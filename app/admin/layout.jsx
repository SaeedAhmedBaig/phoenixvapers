import { AdminAuthProvider } from "./lib/admin-auth";

export const metadata = {
  title: "Phoenix Vapers | Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
