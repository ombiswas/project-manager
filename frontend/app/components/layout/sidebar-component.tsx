import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

interface SidebarComponentProps {
  currentWorkspace: Workspace | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarComponent = ({
  currentWorkspace,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarComponentProps) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workspaces",
      href: "/workspaces",
      icon: Users,
    },
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListCheck,
    },
    {
      title: "Members",
      href: "/members",
      icon: Users,
    },
    {
      title: "Archived",
      href: "/archived",
      icon: CheckCircle2,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Mobile Sliding Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] bg-[#0a0a0a] border-r border-[#212327] transition-transform duration-200 ease-in-out md:hidden shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-[#212327]">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5"
          >
            <div className="size-7 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center font-mono font-normal text-xs tracking-tight">
              X
            </div>
            <span className="font-normal text-white text-base tracking-tight">
              TaskHub
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md text-[#7d8187] hover:text-white hover:bg-[#1a1c20]"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        {currentWorkspace && (
          <div className="px-4 py-3 border-b border-[#212327] bg-[#111214]/50 flex items-center gap-2.5">
            {currentWorkspace.color && (
              <WorkspaceAvatar
                color={currentWorkspace.color}
                name={currentWorkspace.name}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono text-[#7d8187] uppercase tracking-wider">
                Workspace
              </p>
              <p className="text-xs font-normal text-white truncate">
                {currentWorkspace.name}
              </p>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-3 py-3">
          <SidebarNav
            items={navItems}
            isCollapsed={false}
            isMobileDrawer={true}
            onItemClick={onCloseMobile}
            currentWorkspace={currentWorkspace}
          />
        </ScrollArea>

        <div className="p-3 border-t border-[#212327] bg-[#0d0e10] space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="size-8 border border-[#212327]">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="bg-[#1a1c20] text-xs text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#7d8187] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-xs text-[#7d8187] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            onClick={() => {
              onCloseMobile?.();
              logout();
            }}
          >
            <LogOut className="size-4 mr-2.5 shrink-0" />
            <span>Log Out</span>
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-[#212327] bg-[#0a0a0a] transition-all duration-200 shrink-0",
          isCollapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-[#212327] mb-3",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="size-7 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center font-mono font-normal text-xs tracking-tight transition-transform duration-200 group-hover:scale-105">
              X
            </div>
            <span
              className={cn(
                "font-normal text-white text-base tracking-tight",
                isCollapsed && "hidden"
              )}
            >
              TaskHub
            </span>
          </Link>

          <Button
            variant={"ghost"}
            size="icon"
            className="h-8 w-8 text-[#7d8187] hover:text-white"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2.5 py-2">
          <SidebarNav
            items={navItems}
            isCollapsed={isCollapsed}
            className={cn(isCollapsed && "items-center space-y-1.5")}
            currentWorkspace={currentWorkspace}
          />
        </ScrollArea>
        <div
          className={cn(
            "p-3 mt-auto border-t border-[#212327] flex",
            isCollapsed ? "justify-center px-2" : "justify-start px-3"
          )}
        >
          <Button
            variant={"ghost"}
            className={cn(
              "h-9 w-9 p-0 justify-center rounded-full text-[#7d8187] hover:text-white hover:bg-[#1a1c20]",
              !isCollapsed && "w-full justify-start px-3.5 py-2",
              isCollapsed && "w-9 justify-center p-0"
            )}
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("size-4", !isCollapsed && "mr-2.5")} />
            <span
              className={cn(
                "text-sm font-normal",
                isCollapsed ? "hidden" : "block"
              )}
            >
              Logout
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
};

