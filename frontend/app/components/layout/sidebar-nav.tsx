import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        title: string;
        href: string;
        icon: LucideIcon;
    }[];
    isCollapsed: boolean;
    currentWorkspace: Workspace | null;
    className?: string;
}

export const SidebarNav = ({
    items,
    isCollapsed,
    currentWorkspace,
    className,
    ...props
}: SidebarNavProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className={cn("flex flex-col gap-y-2", className)} {...props}>
            {items.map((el) => {
                const Icon = el.icon;
                const isActive = location.pathname === el.href;

                const handleClick = () => {
                    if (el.href === "/workspaces") {
                        navigate(el.href);
                    } else if (currentWorkspace && currentWorkspace._id) {
                        navigate(`${el.href}?workspaceId=${currentWorkspace._id}`);
                    } else {
                        navigate(el.href);
                    }
                }

                return (
                    <Button
                        key={el.href}
                        variant={isActive ? "outline" : "ghost"}
                        className={cn(
                            "h-10 w-10 p-0 justify-center", // mobile
                            !isCollapsed && "md:w-full md:justify-start md:px-4 md:py-2", // desktop not collapsed
                            isCollapsed && "md:w-10 md:justify-center md:p-0", // desktop collapsed
                            isActive && "bg-blue-800/20 text-blue-600 font-medium"
                        )}
                        title={isCollapsed ? el.title : undefined}
                        onClick={handleClick}
                    >
                        <Icon className={cn("size-4", !isCollapsed && "md:mr-2")} />
                        <span className={cn("hidden", !isCollapsed && "md:block")}>
                            {el.title}
                        </span>
                    </Button>
                );
            })}
        </nav>
    );
};
