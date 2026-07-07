import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { CartSheet } from "./cart-sheet";
import { AgeGateDialog } from "./age-gate-dialog";
import { NewsletterPanel } from "./newsletter-panel";

export function StoreShell({ children, newsletter = true }) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      {children}
      {newsletter ? <NewsletterPanel /> : null}
      <SiteFooter />
      <CartSheet />
      <AgeGateDialog />
    </main>
  );
}
