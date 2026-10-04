import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { toast } from "sonner";

export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([
      fetchData<Workspace[]>("/workspaces"),
    ]);
    return { workspaces: workspaces || [] };
  } catch {
    return { workspaces: [] };
  }
};

export const shouldRevalidate = ({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) => {
  // Condition 1: A form submission or route action ran (formMethod present, e.g. POST, PUT, PATCH, DELETE).
  // Revalidate to ensure data mutations reflect in the layout loader.
  if (formMethod) {
    return true;
  }

  // Condition 2: User logged in or out (authentication token missing or cleared from storage).
  // Revalidate so workspaces match the current session state.
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    return true;
  }

  // Condition 3: Pathname changed (navigating to/from a different route).
  // Revalidate when navigating across distinct route boundaries.
  if (currentUrl.pathname !== nextUrl.pathname) {
    return true;
  }

  // Condition 4: Only search parameters changed (e.g. workspaceId, filters, sort, tabs, search)
  // and the pathname is unchanged.
  // Return false to skip re-running clientLoader (/workspaces).
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }

  // Default fallback revalidation behavior
  return defaultShouldRevalidate;
};

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );

  const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Close mobile navigation drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, searchParams]);

  useEffect(() => {
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId && workspaces.length > 0) {
      const savedId = localStorage.getItem("lastWorkspaceId");
      const targetId =
        workspaces.find((w) => w._id === savedId)?._id || workspaces[0]._id;

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("workspaceId", targetId);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, {
        replace: true,
      });
    } else if (workspaceId && workspaces.length > 0) {
      const matchingWorkspace = workspaces.find((w) => w._id === workspaceId);
      if (
        matchingWorkspace &&
        currentWorkspace?._id !== matchingWorkspace._id
      ) {
        setCurrentWorkspace(matchingWorkspace);
        localStorage.setItem("lastWorkspaceId", matchingWorkspace._id);
      }
    }
  }, [searchParams, workspaces, location.pathname, navigate, currentWorkspace]);

  useEffect(() => {
    let lastAlertTime = 0;
    const ALERT_DEBOUNCE = 1000; // 1 second debounce

    const handleAccessDenied = (event: Event) => {
      const now = Date.now();
      if (now - lastAlertTime < ALERT_DEBOUNCE) return;
      lastAlertTime = now;

      const customEvent = event as CustomEvent<{ message?: string }>;
      const message =
        customEvent.detail?.message || "Access denied or resource not found";
      toast.error(message, {
        id: "access-denied-toast",
      });

      const workspaceId = searchParams.get("workspaceId");
      if (workspaceId) {
        navigate(`/dashboard?workspaceId=${workspaceId}`);
      } else {
        navigate("/dashboard");
      }
    };

    window.addEventListener("access-denied", handleAccessDenied);
    return () =>
      window.removeEventListener("access-denied", handleAccessDenied);
  }, [navigate, searchParams]);

  if (isLoading) {
    return <Loader label="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("lastWorkspaceId", workspace._id);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <SidebarComponent
        currentWorkspace={currentWorkspace}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col h-full bg-[#0a0a0a] overflow-hidden min-w-0">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-[#0a0a0a]">
          <div className="mx-auto container px-3 sm:px-6 lg:px-8 pt-4 pb-10 md:pt-8 md:pb-20 w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;
