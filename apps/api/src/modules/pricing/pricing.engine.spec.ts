import {
  priceDelivery,
  priceLine,
  priceUnit,
  sumBreakdowns,
  unitDutyMinor,
  type PricingParams,
} from './pricing.engine';

/**
 * [COMPLIANCE] Exhaustive duty/VAT maths tests (spec §4.4, §6.5) — bottles,
 * shortfills, nic salts, 0 mg, hardware, quantities, and rounding edges.
 * These numbers are legally consequential; every case states its expected
 * value explicitly rather than re-deriving it with the engine's own maths.
 */

/** £2.20 per 10 ml, 20% VAT — the Edition 1.0 statutory defaults. */
const PARAMS: PricingParams = { dutyMinorPer10Ml: 220, vatRateBp: 2000 };

const liquid = (unitNetMinor: number, containerVolumeMl: number) => ({
  unitNetMinor,
  dutyClassification: 'vaping-liquid',
  containerVolumeMl,
});

const hardware = (unitNetMinor: number) => ({
  unitNetMinor,
  dutyClassification: 'non-liquid',
});

describe('unitDutyMinor — Vaping Products Duty per §4.4', () => {
  it('charges £2.20 on a 10ml nic-salt bottle', () => {
    expect(unitDutyMinor(liquid(399, 10), PARAMS)).toBe(220);
  });

  it('charges duty on 0mg liquid — ALL liquid is dutiable, nicotine or not', () => {
    expect(unitDutyMinor(liquid(999, 50), PARAMS)).toBe(1100);
  });

  it('charges per 10ml band: 50ml shortfill = 5 bands', () => {
    expect(unitDutyMinor(liquid(999, 50), PARAMS)).toBe(5 * 220);
  });

  it('charges a part-band as a full band (11ml → 2 bands)', () => {
    expect(unitDutyMinor(liquid(500, 11), PARAMS)).toBe(440);
  });

  it('charges a 100ml shortfill as 10 bands', () => {
    expect(unitDutyMinor(liquid(1499, 100), PARAMS)).toBe(2200);
  });

  it('charges a 2ml pod as one full band', () => {
    expect(unitDutyMinor(liquid(299, 2), PARAMS)).toBe(220);
  });

  it('never duties non-liquid products (devices, coils)', () => {
    expect(unitDutyMinor(hardware(1999), PARAMS)).toBe(0);
  });

  it('never duties liquid with no recorded volume (fails to zero, price still VATs)', () => {
    expect(
      unitDutyMinor(
        { unitNetMinor: 399, dutyClassification: 'vaping-liquid' },
        PARAMS,
      ),
    ).toBe(0);
  });

  it('tracks a configured rate change without code change (§4.4)', () => {
    const raised = { ...PARAMS, dutyMinorPer10Ml: 310 };
    expect(unitDutyMinor(liquid(399, 10), raised)).toBe(310);
    expect(unitDutyMinor(liquid(999, 50), raised)).toBe(1550);
  });
});

describe('priceUnit — duty- and VAT-inclusive display price', () => {
  it('prices a £3.99 10ml bottle: net 399 + duty 220 + VAT 124 = £7.43', () => {
    // VAT base 619 × 20% = 123.8 → 124 (half-up)
    expect(priceUnit(liquid(399, 10), PARAMS)).toEqual({
      netMinor: 399,
      dutyMinor: 220,
      vatMinor: 124,
      totalMinor: 743,
    });
  });

  it('prices a £9.99 50ml 0mg shortfill: net 999 + duty 1100 + VAT 420 = £25.19', () => {
    // VAT base 2099 × 20% = 419.8 → 420
    expect(priceUnit(liquid(999, 50), PARAMS)).toEqual({
      netMinor: 999,
      dutyMinor: 1100,
      vatMinor: 420,
      totalMinor: 2519,
    });
  });

  it('prices hardware with VAT only: £19.99 device → total £23.99', () => {
    // VAT base 1999 × 20% = 399.8 → 400
    expect(priceUnit(hardware(1999), PARAMS)).toEqual({
      netMinor: 1999,
      dutyMinor: 0,
      vatMinor: 400,
      totalMinor: 2399,
    });
  });

  it('includes duty in the VAT base (duty is VATable)', () => {
    // net 100 + duty 220 = 320 → VAT 64. VAT on net alone would be 20.
    expect(priceUnit(liquid(100, 10), PARAMS).vatMinor).toBe(64);
  });

  it('rounds VAT half-up on an exact half-penny', () => {
    // net 250 + duty 0 (hardware) → VAT base 250 × 20% = 50 exactly; use
    // 253: 50.6 → 51, and 252: 50.4 → 50 to pin the rounding direction.
    expect(priceUnit(hardware(253), PARAMS).vatMinor).toBe(51);
    expect(priceUnit(hardware(252), PARAMS).vatMinor).toBe(50);
    // exact .5: base 255 × 20% = 51.0; base 1 duty case — 5% rate on 250
    expect(
      priceUnit(hardware(250), { dutyMinorPer10Ml: 220, vatRateBp: 500 })
        .vatMinor,
    ).toBe(13); // 12.5 → 13
  });

  it('prices a zero-rated VAT configuration', () => {
    expect(priceUnit(liquid(399, 10), { ...PARAMS, vatRateBp: 0 })).toEqual({
      netMinor: 399,
      dutyMinor: 220,
      vatMinor: 0,
      totalMinor: 619,
    });
  });
});

describe('priceLine — quantities and line-level VAT rounding', () => {
  it('scales net and duty exactly with quantity', () => {
    const line = priceLine(liquid(399, 10), 3, PARAMS);
    expect(line.netMinor).toBe(1197);
    expect(line.dutyMinor).toBe(660);
  });

  it('rounds VAT once at line level, not per unit', () => {
    // Unit base 101 → unit VAT 20.2 → 20; naive 3 × 20 = 60.
    // Line base 303 → 60.6 → 61. Line-level rounding must win.
    const line = priceLine(hardware(101), 3, PARAMS);
    expect(line.vatMinor).toBe(61);
    expect(line.totalMinor).toBe(303 + 61);
  });

  it('prices a mixed-reality worst case: 3 × 11ml at £5.00', () => {
    // duty/unit 440, line net 1500, line duty 1320, VAT base 2820 → 564
    expect(priceLine(liquid(500, 11), 3, PARAMS)).toEqual({
      netMinor: 1500,
      dutyMinor: 1320,
      vatMinor: 564,
      totalMinor: 3384,
    });
  });

  it('rejects a non-positive or fractional quantity', () => {
    expect(() => priceLine(liquid(399, 10), 0, PARAMS)).toThrow(RangeError);
    expect(() => priceLine(liquid(399, 10), -1, PARAMS)).toThrow(RangeError);
    expect(() => priceLine(liquid(399, 10), 1.5, PARAMS)).toThrow(RangeError);
  });

  it('rejects float or negative money — integer pence only (§18)', () => {
    expect(() => priceLine(liquid(3.99, 10), 1, PARAMS)).toThrow(RangeError);
    expect(() => priceLine(liquid(-399, 10), 1, PARAMS)).toThrow(RangeError);
  });
});

describe('priceDelivery — duty-free VAT-carrying line, priced from gross', () => {
  it('backs VAT out of a £3.99 gross so the display price holds exactly', () => {
    // 399 × 2000/12000 = 66.5 → 67; net is the exact remainder.
    expect(priceDelivery(399, PARAMS)).toEqual({
      netMinor: 332,
      dutyMinor: 0,
      vatMinor: 67,
      totalMinor: 399,
    });
  });

  it('keeps net + VAT = gross for every amount (no rounding drift)', () => {
    for (const gross of [1, 99, 100, 399, 599, 1000, 12_345]) {
      const line = priceDelivery(gross, PARAMS);
      expect(line.netMinor + line.vatMinor).toBe(gross);
    }
  });

  it('prices free delivery as an all-zero line', () => {
    expect(priceDelivery(0, PARAMS)).toEqual({
      netMinor: 0,
      dutyMinor: 0,
      vatMinor: 0,
      totalMinor: 0,
    });
  });
});

describe('sumBreakdowns — order totals', () => {
  it('sums component-wise so stored totals equal the sum of stored lines', () => {
    const lines = [
      priceLine(liquid(399, 10), 2, PARAMS), // 798 + 440 + 248 (1238×.2=247.6→248)
      priceLine(hardware(1999), 1, PARAMS), //  1999 + 0 + 400
      priceDelivery(399, PARAMS), //             332 + 0 + 67 (gross 399)
    ];
    const total = sumBreakdowns(lines);

    expect(total).toEqual({
      netMinor: 798 + 1999 + 332,
      dutyMinor: 440,
      vatMinor: 248 + 400 + 67,
      totalMinor: 1238 + 248 + 2399 + 399,
    });
    // Invariant: total = net + duty + VAT, with no hidden re-rounding.
    expect(total.totalMinor).toBe(
      total.netMinor + total.dutyMinor + total.vatMinor,
    );
  });

  it('sums an empty basket to zero', () => {
    expect(sumBreakdowns([])).toEqual({
      netMinor: 0,
      dutyMinor: 0,
      vatMinor: 0,
      totalMinor: 0,
    });
  });
});
