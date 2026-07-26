import { ConfigService } from '@nestjs/config';

import { AvProviderUnavailableError } from '../verification.port';
import { MockAvAdapter } from './mock-av.adapter';

function adapter(faultMode?: string) {
  return new MockAvAdapter({
    get: jest.fn().mockReturnValue(faultMode),
  } as unknown as ConfigService);
}

const adult = {
  id: 'c1',
  firstName: 'Alex',
  lastName: 'Tester',
  dateOfBirth: new Date('1990-06-15'),
};

describe('MockAvAdapter (sandbox provider contract)', () => {
  it('[COMPLIANCE] an under-18 subject always fails', async () => {
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

    const minor = { ...adult, dateOfBirth: seventeenYearsAgo };

    await expect(adapter().checkElectronic(minor)).resolves.toMatchObject({
      outcome: 'failed',
    });
    await expect(adapter().checkDocument(minor)).resolves.toMatchObject({
      outcome: 'failed',
    });
  });

  it('an adult passes the electronic check with an evidence reference', async () => {
    const result = await adapter().checkElectronic(adult);
    expect(result.outcome).toBe('passed');
    expect(result.evidenceRef).toMatch(/^mock-av:/);
  });

  it('"inconclusive" surname triggers the escalation path', async () => {
    const result = await adapter().checkElectronic({
      ...adult,
      lastName: 'Smith-Inconclusive',
    });
    expect(result.outcome).toBe('inconclusive');
  });

  it('[COMPLIANCE] AV_FAULT_MODE=outage makes the provider unavailable', async () => {
    await expect(adapter('outage').checkElectronic(adult)).rejects.toThrow(
      AvProviderUnavailableError,
    );
  });
});
