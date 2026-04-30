import { SchoolAdminSidebar } from "@/components/school-admin/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <SchoolAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
