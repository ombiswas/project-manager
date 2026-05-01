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
        <div
            className={cn("flex flex-col border-r bg-sidebar transition-all duration-300",
                isCollapsed ? "w-16 md:w-[80px]" : "w-16 md:w-[240px]"
            )}
        >
            <div className={cn("flex h-14 items-center border-b mb-4 justify-center md:justify-between", isCollapsed ? "md:px-2" : "md:px-4")}>
                <Link to="/dashboard" className="flex items-center gap-2">
                    <Wrench className="size-6 text-blue-600 min-w-6" />
                    <span className={cn("font-semibold text-lg hidden", !isCollapsed && "md:block")}>
                        TaskHub
                    </span>
                </Link>

                <Button
                    variant={"ghost"}
                    size="icon"
                    className="hidden md:flex h-8 w-8"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronRight className="size-4" />
                    ) : (
                        <ChevronLeft className="size-4" />
                    )}
                </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-2">
                <SidebarNav
                    items={navItems}
                    isCollapsed={isCollapsed}
                    className={cn(isCollapsed && "items-center space-y-2")}
                    currentWorkspace={currentWorkspace}
                />
            </ScrollArea>
            <div className={cn("p-4 mt-auto border-t flex", isCollapsed ? "justify-center md:px-2" : "justify-center md:justify-start md:px-4")}>
                <Button 
                    variant={"ghost"} 
                    className={cn(
                        "h-10 w-10 p-0 justify-center", // mobile
                        !isCollapsed && "md:w-full md:justify-start md:px-4 md:py-2", // desktop not collapsed
                        isCollapsed && "md:w-10 md:justify-center md:p-0" // desktop collapsed
                    )} 
                    onClick={logout}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className={cn("size-5", !isCollapsed && "md:mr-2")} />
                    <span className={cn("hidden", !isCollapsed && "md:block")}>
                        Logout
                    </span>
                </Button>
            </div>
        </div>
    )
};