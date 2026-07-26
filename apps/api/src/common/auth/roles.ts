/**
 * Operator roles (seed set from spec §3.2).
 *
 * Two principles govern every role (spec §3.2):
 *  - Least privilege: each role gets the minimum access to do its job.
 *  - [COMPLIANCE] Segregation of duties: the person who can create a
 *    product cannot unilaterally clear its compliance flags.
 */
export enum OperatorRole {
  /** Curates the catalogue — may NOT touch compliance flags. */
  MERCHANDISER = 'merchandiser',
  /** Guards the licence — approves listings, owns compliance profiles. */
  COMPLIANCE_OFFICER = 'compliance_officer',
  /** Front line — reads orders and customers to assist; no money moves. */
  CUSTOMER_SUPPORT = 'customer_support',
  /** Money & reporting — orders, refunds, revenue/tax reports, invoices. */
  FINANCE = 'finance',
  /** Warehouse — picking, packing, dispatch, inventory (grows with Phase 4). */
  FULFILMENT = 'fulfilment',
  /** Promotions, content, and newsletters (grows with Phase 8). */
  MARKETING = 'marketing',
  /** Runs the system — configuration, roles; cannot silently alter audit. */
  PLATFORM_ADMIN = 'platform_admin',
}

/** Display labels for the console (single source of truth). */
export const OPERATOR_ROLE_LABELS: Record<OperatorRole, string> = {
  [OperatorRole.MERCHANDISER]: 'Merchandiser',
  [OperatorRole.COMPLIANCE_OFFICER]: 'Compliance Officer',
  [OperatorRole.CUSTOMER_SUPPORT]: 'Customer Support',
  [OperatorRole.FINANCE]: 'Finance',
  [OperatorRole.FULFILMENT]: 'Fulfilment',
  [OperatorRole.MARKETING]: 'Marketing',
  [OperatorRole.PLATFORM_ADMIN]: 'Platform Admin',
};

/** Shape attached to authenticated admin requests by the guard. */
export interface Operator {
  role: OperatorRole;
  /** Stable identifier for audit attribution (token digest, later: user id). */
  actorId: string;
}
