/**
 * Seed real demonstration products — `pnpm --filter api seed:products`.
 *
 * Drives the SAME service methods the admin console uses (createDraft →
 * submitForReview → updateComplianceProfile → approveCompliance → publish)
 * with a synthetic platform_admin actor, so every seeded product goes
 * through the real state machine and audit trail rather than a raw insert.
 *
 * Each nicotine strength of a flavour is its own Product document — the
 * compliance profile (MHRA notification number, nicotine strength) is
 * legitimately singular per product, matching real MHRA notification
 * practice — linked to its siblings via `flavourFamily` so the storefront
 * PDP can offer a strength switcher (see CatalogueService.getSellableBySlug).
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

import { AppModule } from '../app.module';
import { OperatorRole } from '../common/auth/roles';
import { ensureResolvableDns } from '../common/bootstrap/ensure-dns';
import { CatalogueService } from '../modules/catalogue/catalogue.service';
import type { ComplianceProfileDto, CreateProductDto } from '../modules/catalogue/dto/product.dto';

const ACTOR = { actorId: 'seed', role: OperatorRole.PLATFORM_ADMIN };

const NICOTINE_WARNING = 'This product contains nicotine, which is a highly addictive substance.';

interface FlavourStrength {
  strength: number;
  sku: string;
  notificationNumber?: string;
}

interface FlavourSeed {
  name: string;
  brand: string;
  range?: string;
  category: 'e-liquids' | 'nic-salts';
  productType: 'e-liquid' | 'nic-salt';
  description: string;
  flavourFamily: string;
  vgPg?: string;
  mediaUrl: string;
  mediaAlt: string;
  strengths: FlavourStrength[];
}

const FLAVOURS: FlavourSeed[] = [
  {
    name: 'Cedar Reserve – American Red',
    brand: 'Cedar Reserve',
    range: 'Cedar Reserve TPD',
    category: 'e-liquids',
    productType: 'e-liquid',
    description:
      'A no fuss tobacco taste with rich woody undertones. 10ml TPD-compliant e-liquid.',
    flavourFamily: 'cedar-reserve-american-red',
    vgPg: '30/70',
    mediaUrl: '/media/products/cedar-reserve-american-red.png',
    mediaAlt: 'Cedar Reserve – American Red Tobacco e-liquid bottle',
    strengths: [
      { strength: 0, sku: 'P70465CR-0' },
      { strength: 3, sku: 'P70465CR-3', notificationNumber: '10012345-67890-00003' },
      { strength: 6, sku: 'P70465CR-6', notificationNumber: '10012345-67890-00006' },
      { strength: 12, sku: 'P70465CR-12', notificationNumber: '10012345-67890-00012' },
      { strength: 18, sku: 'P70465CR-18', notificationNumber: '10012345-67890-00018' },
    ],
  },
  {
    name: 'Bar Wars – Blue Raspberry Lemonade',
    brand: 'Bar Wars',
    category: 'nic-salts',
    productType: 'nic-salt',
    description:
      'Tangy and sweet blue raspberry blended with a traditional American-style lemonade. ' +
      'High strength & smooth — fast-hitting nicotine salts, less metallic and bitter than rivals. 10ml.',
    flavourFamily: 'bar-wars-blue-raspberry-lemonade',
    vgPg: '50/50',
    mediaUrl: '/media/products/bar-wars-blue-raspberry-lemonade.png',
    mediaAlt: 'Bar Wars – Blue Raspberry Lemonade nic salt bottle',
    strengths: [
      { strength: 10, sku: 'P52738BW-10', notificationNumber: '20045678-11223-00010' },
      { strength: 20, sku: 'P52738BW-20', notificationNumber: '20045678-11223-00020' },
    ],
  },
  {
    name: 'FiftyFifty Smooth – Mango Madness',
    brand: 'FiftyFifty Smooth',
    category: 'nic-salts',
    productType: 'nic-salt',
    description:
      'A prominent super sweet Indian mango balanced with a slightly tart edge. ' +
      'High strength & super smooth nicotine salts. 10ml.',
    flavourFamily: 'fiftyfifty-smooth-mango-madness',
    vgPg: '50/50',
    mediaUrl: '/media/products/fiftyfifty-smooth-mango-madness.png',
    mediaAlt: 'FiftyFifty Smooth – Mango Madness nic salt bottle',
    strengths: [
      { strength: 10, sku: 'PFF-MANGO-10', notificationNumber: '30098765-44556-00010' },
      { strength: 20, sku: 'PFF-MANGO-20', notificationNumber: '30098765-44556-00020' },
    ],
  },
];

async function seedFlavour(catalogue: CatalogueService, logger: Logger, flavour: FlavourSeed) {
  for (const s of flavour.strengths) {
    const dto: CreateProductDto = {
      name: `${flavour.name} (${s.strength}mg)`,
      brand: flavour.brand,
      range: flavour.range,
      category: flavour.category,
      description: flavour.description,
      flavourFamily: flavour.flavourFamily,
      media: [{ url: flavour.mediaUrl, alt: flavour.mediaAlt }],
      specification: {
        strengthMgPerMl: s.strength,
        volumeMl: 10,
        vgPg: flavour.vgPg,
      },
      provenance: { madeIn: 'United Kingdom', batchTested: true },
      variants: [
        {
          sku: s.sku,
          attributes: { strength: `${s.strength}mg` },
          netPriceMinor: 113, // net 113p + 220p duty + 67p VAT = 400p (£4.00), matches real retail price
          inStockStub: true,
        },
      ],
    };

    const created = await catalogue.createDraft(dto, ACTOR);
    await catalogue.submitForReview(created.id, ACTOR);

    const compliance: ComplianceProfileDto = {
      productType: flavour.productType,
      nicotineStrengthMgPerMl: s.strength,
      containerVolumeMl: 10,
      notificationNumber: s.notificationNumber,
      mandatedWarnings: s.strength > 0 ? [NICOTINE_WARNING] : [],
      dutyClassification: 'vaping-liquid',
    };
    await catalogue.updateComplianceProfile(created.id, compliance, ACTOR);
    await catalogue.approveCompliance(created.id, ACTOR);
    await catalogue.publish(created.id, ACTOR);

    logger.log(`Seeded ${dto.name} — ${s.sku}`);
  }
}

async function main(): Promise<void> {
  const logger = new Logger('SeedProducts');
  ensureResolvableDns();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const catalogue = app.get(CatalogueService);

    // Idempotent re-runs: clear any earlier attempt at these exact flavours
    // (matched by SKU, not a collection-wide wipe) before recreating them.
    const connection = app.get<Connection>(getConnectionToken());
    const skus = FLAVOURS.flatMap((f) => f.strengths.map((s) => s.sku));
    const { deletedCount } = await connection.collection('products').deleteMany({
      'variants.sku': { $in: skus },
    });
    if (deletedCount) logger.log(`Cleared ${deletedCount} previously-seeded product(s).`);

    for (const flavour of FLAVOURS) {
      await seedFlavour(catalogue, logger, flavour);
    }
    logger.log('Done — 9 products seeded and sellable.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('seed-products failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
