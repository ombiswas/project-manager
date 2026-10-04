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
  isMobileDrawer?: boolean;
  onItemClick?: () => void;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  currentWorkspace,
  className,
  isMobileDrawer = false,
  onItemClick,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn("flex flex-col gap-y-1", className)} {...props}>
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
        };

        return (
          <Button
            key={el.href}
            variant="ghost"
            className={cn(
              "transition-all duration-200 cursor-pointer",
              isMobileDrawer
                ? "h-10 w-full justify-start px-3.5 py-2 rounded-[8px]"
                : cn(
                    "h-9 w-9 p-0 justify-center rounded-full",
                    !isCollapsed &&
                      "md:w-full md:justify-start md:px-3.5 md:py-2 md:rounded-full",
                    isCollapsed && "md:w-9 md:justify-center md:p-0"
                  ),
              isActive
                ? "bg-[#1a1c20] border border-white/20 text-white font-normal"
                : "text-[#7d8187] hover:bg-[#1a1c20] hover:text-white hover:border-transparent"
            )}
            title={isCollapsed && !isMobileDrawer ? el.title : undefined}
            onClick={() => {
              handleClick();
              onItemClick?.();
            }}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isMobileDrawer ? "mr-3" : !isCollapsed && "md:mr-2.5",
                isActive ? "text-white" : "text-[#7d8187]"
              )}
            />
            <span
              className={cn(
                "text-sm font-normal",
                isMobileDrawer
                  ? "block text-white"
                  : cn("hidden", !isCollapsed && "md:block")
              )}
            >
              {el.title}
            </span>
          </Button>
        );
      })}
    </nav>
  );
};
