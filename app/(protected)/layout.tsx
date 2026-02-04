import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="h-screen w-screen overflow-hidden">
        {/* The game canvas as full background */}
        <div className="absolute inset-0 z-0 overflow-hidden">{children}</div>

        {/* HUD over the game */}
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col">
          <div className="pointer-events-auto">
            <SiteHeader />
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="pointer-events-auto h-full flex">
              <AppSidebar />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
