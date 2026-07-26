/**
 * Public projection of a customer — the ONLY shape that leaves the API.
 * Built up from named fields: passwordHash, dateOfBirth and internal
 * counters can never leak by omission. DOB is deliberately absent from
 * responses (data minimisation, §16.5) — the client that typed it does
 * not need it back.
 */
export interface PublicCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  ageVerification: {
    status: string;
    method?: string;
    verifiedAt?: Date;
    expiresAt?: Date;
  };
  addresses: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  }[];
  consents: { marketingEmail: boolean };
}

export function toPublicCustomer(doc: any): PublicCustomer {
  return {
    id: String(doc._id ?? doc.id),
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    emailVerified: Boolean(doc.emailVerified),
    ageVerification: {
      status: doc.ageVerification?.status ?? 'unverified',
      method: doc.ageVerification?.method,
      verifiedAt: doc.ageVerification?.verifiedAt,
      expiresAt: doc.ageVerification?.expiresAt,
    },
    addresses: (doc.addresses ?? []).map((address: any) => ({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      postcode: address.postcode,
      country: address.country,
    })),
    consents: { marketingEmail: Boolean(doc.consents?.marketingEmail) },
  };
}
