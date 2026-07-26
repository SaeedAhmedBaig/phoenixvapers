import { complianceProfileSchema, createProductSchema } from './product.dto';

/**
 * [COMPLIANCE] DTO-level rules — these tests are the executable form of
 * spec §4.1/§4.3. If one of them fails, the platform can sell something
 * illegal; they are never weakened for convenience.
 */
describe('complianceProfileSchema', () => {
  const validNicotineLiquid = {
    productType: 'nic-salt',
    nicotineStrengthMgPerMl: 10,
    containerVolumeMl: 10,
    notificationNumber: 'MHRA-12345',
    mandatedWarnings: [
      'This product contains nicotine which is a highly addictive substance.',
    ],
    dutyClassification: 'vaping-liquid',
  };

  it('accepts a complete, compliant nicotine liquid', () => {
    expect(complianceProfileSchema.safeParse(validNicotineLiquid).success).toBe(
      true,
    );
  });

  it('rejects banned product types (single-use disposables) outright', () => {
    const result = complianceProfileSchema.safeParse({
      ...validNicotineLiquid,
      productType: 'disposable',
    });
    expect(result.success).toBe(false);
  });

  it('rejects nicotine strength above the 20 mg/ml TPD limit', () => {
    const result = complianceProfileSchema.safeParse({
      ...validNicotineLiquid,
      nicotineStrengthMgPerMl: 21,
    });
    expect(result.success).toBe(false);
  });

  it('rejects nicotine-containing liquid in containers over 10 ml', () => {
    const result = complianceProfileSchema.safeParse({
      ...validNicotineLiquid,
      containerVolumeMl: 50,
    });
    expect(result.success).toBe(false);
  });

  it('allows 0 mg shortfills in large bottles — but never with nicotine', () => {
    const shortfill = {
      productType: 'shortfill',
      nicotineStrengthMgPerMl: 0,
      containerVolumeMl: 50,
      mandatedWarnings: [],
      dutyClassification: 'vaping-liquid',
    };
    expect(complianceProfileSchema.safeParse(shortfill).success).toBe(true);
    expect(
      complianceProfileSchema.safeParse({
        ...shortfill,
        nicotineStrengthMgPerMl: 3,
      }).success,
    ).toBe(false);
  });

  it('requires an MHRA notification number for nicotine products', () => {
    const result = complianceProfileSchema.safeParse({
      ...validNicotineLiquid,
      notificationNumber: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('duty-classifies ALL liquid as vaping-liquid — including 0 mg (§4.4)', () => {
    const result = complianceProfileSchema.safeParse({
      productType: 'shortfill',
      nicotineStrengthMgPerMl: 0,
      containerVolumeMl: 50,
      mandatedWarnings: [],
      dutyClassification: 'non-liquid', // wrong on purpose
    });
    expect(result.success).toBe(false);
  });
});

describe('createProductSchema (merchandiser surface)', () => {
  const validDraft = {
    name: 'Forest Mint Nic Salt',
    brand: 'Phoenix',
    category: 'nic-salts',
    description:
      'A crisp mint nic salt, UK-made and batch-tested for consistency.',
    variants: [{ sku: 'PHX-MINT-10' }],
  };

  it('accepts a valid draft', () => {
    expect(createProductSchema.safeParse(validDraft).success).toBe(true);
  });

  it('strips complianceProfile if a merchandiser tries to smuggle it in', () => {
    const result = createProductSchema.parse({
      ...validDraft,
      complianceProfile: { productType: 'disposable', locked: true },
    });

    expect('complianceProfile' in result).toBe(false);
  });

  it('rejects javascript: media URLs (stored-XSS vector)', () => {
    const result = createProductSchema.safeParse({
      ...validDraft,
      media: [{ url: 'javascript:alert(1)', alt: 'malicious image' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate variant SKUs within a product', () => {
    const result = createProductSchema.safeParse({
      ...validDraft,
      variants: [{ sku: 'PHX-MINT-10' }, { sku: 'PHX-MINT-10' }],
    });
    expect(result.success).toBe(false);
  });
});
