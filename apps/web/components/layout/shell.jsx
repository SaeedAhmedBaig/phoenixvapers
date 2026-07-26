import { Announcement } from "@/components/layout/announcement";
import { ConditionalCategoryNav } from "@/components/layout/conditional-category-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { sessionState } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";

export async function StorefrontShell({ children }) {
  const [session, cartCount] = await Promise.all([sessionState(), getCartCount()]);
  const signedIn = session.hasAccess || session.hasRefresh;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Announcement />
      <div className="border-border sticky top-0 z-50 border-b bg-card">
        <Header signedIn={signedIn} cartCount={cartCount} />
        <ConditionalCategoryNav />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
