import { AdminGate, PlatformAdminBadge } from "@/components/AuthGates";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PlatformAdminBadge />
      <AdminGate>
        <AdminNav />
        {children}
      </AdminGate>
    </>
  );
}
