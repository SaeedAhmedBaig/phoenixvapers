import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

import { Operator, OperatorRole } from '../../common/auth/roles';
import { AuditService } from '../audit/audit.service';
import { PricingService } from '../pricing/pricing.service';
import { ProductStatus } from './catalogue.constants';
import { CatalogueService } from './catalogue.service';
import { Product } from './schemas/product.schema';

const merchandiser: Operator = {
  role: OperatorRole.MERCHANDISER,
  actorId: 'token:merch',
};
const officer: Operator = {
  role: OperatorRole.COMPLIANCE_OFFICER,
  actorId: 'token:comp',
};

describe('CatalogueService — compliance gates', () => {
  let service: CatalogueService;
  let model: {
    findOneAndUpdate: jest.Mock;
    findOneAndDelete: jest.Mock;
    findById: jest.Mock;
  };
  let audit: { record: jest.Mock };

  beforeEach(async () => {
    model = {
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      findById: jest.fn(),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogueService,
        { provide: getModelToken(Product.name), useValue: model },
        { provide: AuditService, useValue: audit },
        {
          provide: PricingService,
          useValue: { params: { dutyMinorPer10Ml: 220, vatRateBp: 2000 } },
        },
      ],
    }).compile();

    service = moduleRef.get(CatalogueService);
  });

  /** findById(...).lean() and findById(...) both need to resolve. */
  function givenStoredProduct(product: Record<string, unknown>) {
    model.findById.mockReturnValue({
      lean: () => Promise.resolve(product),
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(product).then(resolve),
    });
  }

  it('[COMPLIANCE] publish fails closed when the profile is not approved', async () => {
    // Atomic precondition misses => findOneAndUpdate returns null.
    model.findOneAndUpdate.mockResolvedValue(null);
    givenStoredProduct({
      _id: 'p1',
      status: ProductStatus.REVIEW,
      complianceProfile: { locked: false },
    });

    await expect(service.publish('p1', merchandiser)).rejects.toThrow(
      ConflictException,
    );
    // And nothing was audited as published.
    expect(audit.record).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'catalogue.product.published' }),
    );
  });

  it('[COMPLIANCE] publish requires locked+approved profile in the atomic query itself', async () => {
    model.findOneAndUpdate.mockResolvedValue({ id: 'p1' });

    await service.publish('p1', merchandiser);

    const [filter] = model.findOneAndUpdate.mock.calls[0];
    expect(filter).toMatchObject({
      status: ProductStatus.REVIEW,
      'complianceProfile.locked': true,
      'complianceProfile.approvedAt': { $exists: true },
    });
  });

  it('[COMPLIANCE] approval refuses an incomplete profile (fails closed)', async () => {
    givenStoredProduct({
      _id: 'p1',
      status: ProductStatus.REVIEW,
      // Missing everything a nicotine product needs:
      complianceProfile: { productType: 'nic-salt' },
    });

    await expect(service.approveCompliance('p1', officer)).rejects.toThrow(
      /fails closed/i,
    );
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('[COMPLIANCE] editing the compliance profile clears approval and pulls a sellable product back to review', async () => {
    givenStoredProduct({
      _id: 'p1',
      status: ProductStatus.SELLABLE,
      complianceProfile: {
        productType: 'nic-salt',
        locked: true,
        approvedBy: 'token:comp',
      },
    });
    model.findOneAndUpdate.mockResolvedValue({ id: 'p1' });

    await service.updateComplianceProfile(
      'p1',
      {
        productType: 'nic-salt',
        nicotineStrengthMgPerMl: 20,
        containerVolumeMl: 10,
        notificationNumber: 'MHRA-99999',
        mandatedWarnings: [
          'This product contains nicotine which is a highly addictive substance.',
        ],
        dutyClassification: 'vaping-liquid',
      },
      officer,
    );

    const [, update] = model.findOneAndUpdate.mock.calls[0];
    expect(update.$set.complianceProfile.locked).toBe(false);
    expect(update.$set.complianceProfile.approvedBy).toBeUndefined();
    expect(update.$set.status).toBe(ProductStatus.REVIEW);
  });

  it('merchandiser draft updates can only match DRAFT documents', async () => {
    model.findOneAndUpdate.mockResolvedValue({ id: 'p1' });

    await service.updateDraft('p1', { name: 'Renamed Product' }, merchandiser);

    const [filter] = model.findOneAndUpdate.mock.calls[0];
    expect(filter).toMatchObject({ status: ProductStatus.DRAFT });
  });

  it('delete is atomic on DRAFT status — reviewed products are never deletable', async () => {
    model.findOneAndDelete.mockResolvedValue({ name: 'Draft', slug: 'draft' });

    await service.deleteDraft('p1', merchandiser);

    const [filter] = model.findOneAndDelete.mock.calls[0];
    expect(filter).toMatchObject({ status: ProductStatus.DRAFT });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'catalogue.product.draft_deleted' }),
    );
  });

  it('delete of a non-draft is refused with a conflict', async () => {
    model.findOneAndDelete.mockResolvedValue(null);
    givenStoredProduct({ _id: 'p1', status: ProductStatus.SELLABLE });

    await expect(service.deleteDraft('p1', merchandiser)).rejects.toThrow(
      ConflictException,
    );
  });
});
