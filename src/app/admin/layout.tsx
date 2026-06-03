import { AdminGate, PlatformAdminBadge } from "@/components/AuthGates";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PlatformAdminBadge />
      <AdminGate>{children}</AdminGate>
    </>
  );
}
