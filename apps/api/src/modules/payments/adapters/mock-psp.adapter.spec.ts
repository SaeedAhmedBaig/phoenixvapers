import { ConfigService } from '@nestjs/config';

import { PspUnavailableError } from '../payments.port';
import { MockPspAdapter } from './mock-psp.adapter';

const configWith = (faultMode?: string) =>
  ({ get: () => faultMode }) as unknown as ConfigService;

const request = (paymentMethodToken: string) => ({
  amountMinor: 1486,
  currency: 'GBP',
  paymentMethodToken,
  orderRef: 'order:PHX-1001',
  customerRef: 'customer:abc',
});

describe('MockPspAdapter', () => {
  it('authorises the happy-path token', async () => {
    const psp = new MockPspAdapter(configWith());

    const result = await psp.authorise(request('pm_card_ok'));

    expect(result.status).toBe('authorised');
    expect(result.intentId).toMatch(/^mockpay_/);
  });

  it('declines the declined-card tokens with a customer-safe reason', async () => {
    const psp = new MockPspAdapter(configWith());

    await expect(
      psp.authorise(request('pm_card_declined')),
    ).resolves.toMatchObject({
      status: 'declined',
      declineReason: 'Your card was declined',
    });
    await expect(
      psp.authorise(request('pm_card_insufficient')),
    ).resolves.toMatchObject({
      status: 'declined',
      declineReason: 'Insufficient funds',
    });
  });

  it('supports partial capture up to the authorised amount (§6.4)', async () => {
    const psp = new MockPspAdapter(configWith());
    const { intentId } = await psp.authorise(request('pm_card_ok'));

    await expect(psp.capture(intentId, 1000)).resolves.toEqual({
      captured: true,
    });
    await expect(psp.capture(intentId, 486)).resolves.toEqual({
      captured: true,
    });
    // Anything beyond the authorisation is refused.
    await expect(psp.capture(intentId, 1)).resolves.toEqual({
      captured: false,
    });
  });

  it('refunds only what was captured (§6.4)', async () => {
    const psp = new MockPspAdapter(configWith());
    const { intentId } = await psp.authorise(request('pm_card_ok'));
    await psp.capture(intentId, 1486);

    await expect(psp.refund(intentId, 500)).resolves.toEqual({
      refunded: true,
    });
    await expect(psp.refund(intentId, 986)).resolves.toEqual({
      refunded: true,
    });
    await expect(psp.refund(intentId, 1)).resolves.toEqual({ refunded: false });
  });

  it('throws PspUnavailableError under PSP_FAULT_MODE=outage — the fail-closed hook', async () => {
    const psp = new MockPspAdapter(configWith('outage'));

    await expect(psp.authorise(request('pm_card_ok'))).rejects.toThrow(
      PspUnavailableError,
    );
  });
});
