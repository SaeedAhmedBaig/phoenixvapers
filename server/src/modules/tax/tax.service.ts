import { Injectable } from "@nestjs/common";

export interface VatBreakdown {
  rate: number;
  netMinor: number;
  vatMinor: number;
  grossMinor: number;
}

const UK_VAT_RATE = 0.2;

@Injectable()
export class TaxService {
  /** UK retail e-liquid prices are displayed VAT-inclusive; this breaks the gross amount down for invoicing/reporting. */
  vatBreakdown(grossMinor: number): VatBreakdown {
    const netMinor = Math.round(grossMinor / (1 + UK_VAT_RATE));
    return { rate: UK_VAT_RATE, netMinor, vatMinor: grossMinor - netMinor, grossMinor };
  }

  get rate(): number {
    return UK_VAT_RATE;
  }
}
