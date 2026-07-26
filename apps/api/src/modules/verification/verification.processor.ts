import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUES } from '../../common/queues/queues.constants';
import { AuditService } from '../audit/audit.service';
import { CustomersService } from '../identity/customers.service';

/**
 * Verification lifecycle worker. The nightly `expire-passes` sweep keeps
 * the retention rule of §4.2 true structurally: an expired pass reverts
 * to `unverified` and can never satisfy a checkout assertion.
 */
@Processor(QUEUES.VERIFICATION)
export class VerificationProcessor extends WorkerHost {
  private readonly logger = new Logger(VerificationProcessor.name);

  constructor(
    private readonly customers: CustomersService,
    private readonly audit: AuditService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case 'expire-passes': {
        const expired = await this.customers.expireVerificationPasses(
          new Date(),
        );
        if (expired > 0) {
          this.logger.log(`Expired ${expired} age-verification pass(es)`);
          await this.audit.record({
            actor: 'system',
            action: 'verification.passes_expired',
            subjectRef: 'customers:batch',
            after: { count: expired },
          });
        }
        return { expired };
      }

      default:
        throw new Error(
          `Unknown job "${job.name}" on queue "${QUEUES.VERIFICATION}"`,
        );
    }
  }
}
