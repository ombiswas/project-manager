import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { CheckCircle2, ChevronLeft, ChevronRight, LayoutDashboard, List, ListCheck, LogOut, Settings, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

export const SidebarComponent = ({
    currentWorkspace
}: { currentWorkspace: Workspace | null }) => {
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
        <aside
            className={cn("flex flex-col border-r border-[#212327] bg-[#0a0a0a] transition-all duration-200 shrink-0",
                isCollapsed ? "w-16 md:w-[72px]" : "w-16 md:w-[240px]"
            )}
        >
            <div className={cn("flex h-14 items-center border-b border-[#212327] mb-3 justify-center md:justify-between", isCollapsed ? "md:px-2" : "md:px-4")}>
                <Link to="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="size-7 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center font-mono font-normal text-xs tracking-tight transition-transform duration-200 group-hover:scale-105">
                        X
                    </div>
                    <span className={cn("font-normal text-white text-base tracking-tight hidden", !isCollapsed && "md:block")}>
                        TaskHub
                    </span>
                </Link>

                <Button
                    variant={"ghost"}
                    size="icon"
                    className="hidden md:flex h-8 w-8 text-[#7d8187] hover:text-white"
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
            <div className={cn("p-3 mt-auto border-t border-[#212327] flex", isCollapsed ? "justify-center md:px-2" : "justify-center md:justify-start md:px-3")}>
                <Button 
                    variant={"ghost"} 
                    className={cn(
                        "h-9 w-9 p-0 justify-center rounded-full text-[#7d8187] hover:text-white hover:bg-[#1a1c20]",
                        !isCollapsed && "md:w-full md:justify-start md:px-3.5 md:py-2",
                        isCollapsed && "md:w-9 md:justify-center md:p-0"
                    )} 
                    onClick={logout}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className={cn("size-4", !isCollapsed && "md:mr-2.5")} />
                    <span className={cn("hidden text-sm font-normal", !isCollapsed && "md:block")}>
                        Logout
                    </span>
                </Button>
            </div>
        </aside>
    )
};