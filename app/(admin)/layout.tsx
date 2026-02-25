import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Login page doesn't need the sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {session?.user ? (
        <div className="flex h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
