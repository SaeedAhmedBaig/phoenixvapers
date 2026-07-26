import {
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { AuditService } from '../audit/audit.service';
import { CustomersService } from '../identity/customers.service';
import { AgeVerificationStatus } from '../identity/schemas/customer.schema';
import {
  AGE_VERIFICATION_PORT,
  AvProviderUnavailableError,
} from './verification.port';
import { VerificationService } from './verification.service';

/**
 * [COMPLIANCE] These tests are the executable form of spec §4.2. They are
 * never weakened for a deadline (§23.1).
 */
describe('VerificationService', () => {
  let service: VerificationService;
  let provider: { checkElectronic: jest.Mock; checkDocument: jest.Mock };
  let customers: {
    verificationSubject: jest.Mock;
    applyVerificationOutcome: jest.Mock;
    requireById: jest.Mock;
  };
  let audit: { record: jest.Mock };

  /** Customer state the mocks report back. */
  let state: {
    status: AgeVerificationStatus;
    failedAttempts: number;
    expiresAt?: Date;
  };

  beforeEach(async () => {
    state = { status: AgeVerificationStatus.UNVERIFIED, failedAttempts: 0 };

    provider = { checkElectronic: jest.fn(), checkDocument: jest.fn() };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    customers = {
      verificationSubject: jest.fn().mockImplementation(() => ({
        id: 'c1',
        firstName: 'Alex',
        lastName: 'Tester',
        dateOfBirth: new Date('1990-01-01'),
        status: state.status,
        failedAttempts: state.failedAttempts,
      })),
      applyVerificationOutcome: jest.fn().mockImplementation((_id, outcome) => {
        state.status = outcome.status;
        state.expiresAt = outcome.expiresAt;
        if (outcome.countFailure) state.failedAttempts += 1;
        return {};
      }),
      requireById: jest.fn().mockImplementation(() => ({
        ageVerification: {
          status: state.status,
          failedAttempts: state.failedAttempts,
          expiresAt: state.expiresAt,
        },
      })),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: AGE_VERIFICATION_PORT, useValue: provider },
        { provide: CustomersService, useValue: customers },
        { provide: AuditService, useValue: audit },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(365),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(VerificationService);
  });

  it('[COMPLIANCE] provider outage fails closed: 503, audit trail, no status change', async () => {
    provider.checkElectronic.mockRejectedValue(
      new AvProviderUnavailableError(),
    );

    await expect(service.initiate('c1')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(customers.applyVerificationOutcome).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'verification.provider_outage' }),
    );
  });

  it('a pass stores outcome, method, evidence ref and expiry — and is audited', async () => {
    provider.checkElectronic.mockResolvedValue({
      outcome: 'passed',
      evidenceRef: 'mock-av:abc',
    });

    const view = await service.initiate('c1');

    expect(view.status).toBe(AgeVerificationStatus.PASSED);
    const outcome = customers.applyVerificationOutcome.mock.calls[0][1];
    expect(outcome.evidenceRef).toBe('mock-av:abc');
    expect(outcome.expiresAt).toBeInstanceOf(Date);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'verification.passed' }),
    );
  });

  it('inconclusive offers the document escalation path', async () => {
    provider.checkElectronic.mockResolvedValue({
      outcome: 'inconclusive',
      evidenceRef: 'mock-av:inc',
    });

    const view = await service.initiate('c1');

    expect(view.status).toBe(AgeVerificationStatus.INCONCLUSIVE);
    expect(view.escalationAvailable).toBe(true);
  });

  it('[COMPLIANCE] the third failure soft-locks the account for human review', async () => {
    provider.checkElectronic.mockResolvedValue({
      outcome: 'failed',
      evidenceRef: 'mock-av:f',
    });

    await service.initiate('c1'); // 1st failure
    await service.initiate('c1'); // 2nd
    const view = await service.initiate('c1'); // 3rd -> lock

    expect(view.status).toBe(AgeVerificationStatus.LOCKED);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'verification.locked' }),
    );

    // And a locked account cannot start another check.
    await expect(service.initiate('c1')).rejects.toThrow(ConflictException);
  });

  it('[COMPLIANCE] sale assertion rejects unverified accounts', async () => {
    await expect(service.assertSaleAllowed('c1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('[COMPLIANCE] sale assertion rejects an EXPIRED pass', async () => {
    state.status = AgeVerificationStatus.PASSED;
    state.expiresAt = new Date(Date.now() - 1000); // expired a second ago

    await expect(service.assertSaleAllowed('c1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('sale assertion accepts a valid, unexpired pass', async () => {
    state.status = AgeVerificationStatus.PASSED;
    state.expiresAt = new Date(Date.now() + 86_400_000);

    await expect(service.assertSaleAllowed('c1')).resolves.toBeUndefined();
  });
});
