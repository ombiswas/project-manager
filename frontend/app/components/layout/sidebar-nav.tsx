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
              "h-9 w-9 p-0 justify-center rounded-full text-[#7d8187] transition-all duration-200 cursor-pointer",
              !isCollapsed &&
                "md:w-full md:justify-start md:px-3.5 md:py-2 md:rounded-full",
              isCollapsed && "md:w-9 md:justify-center md:p-0",
              isActive
                ? "bg-[#1a1c20] border border-white/20 text-white font-normal"
                : "hover:bg-[#1a1c20] hover:text-white hover:border-transparent"
            )}
            title={isCollapsed ? el.title : undefined}
            onClick={handleClick}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                !isCollapsed && "md:mr-2.5",
                isActive ? "text-white" : "text-[#7d8187]"
              )}
            />
            <span
              className={cn(
                "hidden text-sm font-normal",
                !isCollapsed && "md:block"
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
