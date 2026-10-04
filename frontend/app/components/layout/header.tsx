import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, Menu, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  onOpenMobileNav?: () => void;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  onOpenMobileNav,
}: HeaderProps) => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
  const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

  const handleOnClick = (workspace: Workspace) => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set("workspaceId", workspace._id);

    if (url.pathname.includes("/workspaces/")) {
      // If we are on a workspace details page, navigate to the new workspace's details
      navigate(`/workspaces/${workspace._id}`);
    } else {
      // Otherwise, stay on the current page but update the workspaceId query param
      navigate(`${url.pathname}?${searchParams.toString()}`);
    }
  };

  return (
    <header className="bg-[#0a0a0a] sticky top-0 z-40 border-b border-[#212327]">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileNav}
            className="md:hidden size-8 shrink-0 text-[#7d8187] hover:text-white hover:bg-[#1a1c20]"
            aria-label="Open mobile navigation"
          >
            <Menu className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                className="h-9 px-2.5 sm:px-3.5 text-xs font-normal border-white/20 hover:border-white/40 max-w-[150px] sm:max-w-[240px] md:max-w-xs shrink"
              >
                {selectedWorkspace ? (
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedWorkspace.color && (
                      <WorkspaceAvatar
                        color={selectedWorkspace.color}
                        name={selectedWorkspace.name}
                      />
                    )}
                    <span className="font-normal text-white truncate">
                      {selectedWorkspace?.name}
                    </span>
                  </div>
                ) : (
                  <span className="font-normal text-[#7d8187] truncate">
                    Select Workspace
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws._id}
                  onClick={() => handleOnClick(ws)}
                >
                  {ws.color && (
                    <WorkspaceAvatar color={ws.color} name={ws.name} />
                  )}
                  <span className="ml-2">{ws.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-[#7d8187] hover:text-white hover:bg-[#1a1c20]"
          >
            <Bell className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white/40 cursor-pointer group">
                <Avatar className="w-8 h-8 border border-[#212327] bg-[#1a1c20]">
                  <AvatarImage
                    src={user?.profilePicture}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-[#1a1c20] text-white font-mono font-normal text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
