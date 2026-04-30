import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router";

export const clientLoader = async () => {
    try {
        const [workspaces] = await Promise.all([fetchData("/workspaces")]);
        return { workspaces };

    } catch (error) {
        console.log(error);
        return { workspaces: [] };
    }
};


const DashboardLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

    const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const workspaceId = searchParams.get("workspaceId");
        if (!workspaceId && workspaces.length > 0) {
            const savedId = localStorage.getItem("lastWorkspaceId");
            const targetId = workspaces.find(w => w._id === savedId)?._id || workspaces[0]._id;
            
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("workspaceId", targetId);
            navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
        } else if (workspaceId && workspaces.length > 0) {
            const matchingWorkspace = workspaces.find(w => w._id === workspaceId);
            if (matchingWorkspace && currentWorkspace?._id !== matchingWorkspace._id) {
                setCurrentWorkspace(matchingWorkspace);
                localStorage.setItem("lastWorkspaceId", matchingWorkspace._id);
            }
        }
    }, [searchParams, workspaces, location.pathname, navigate, currentWorkspace]);

    if (isLoading) {
        return <Loader />;
    };

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" />;
    };

    const handleWorkspaceSelected = (workspace: Workspace) => {
        setCurrentWorkspace(workspace);
    };

    return (
        <div className="flex h-screen w-full">
            <SidebarComponent currentWorkspace={currentWorkspace} />

            <div className="flex flex-1 flex-col h-full">
                <Header
                    onWorkspaceSelected={handleWorkspaceSelected}
                    selectedWorkspace={currentWorkspace}
                    onCreateWorkspace={() => setIsCreatingWorkspace(true)}
                />

                <main className="flex-1 overflow-y-auto h-full w-full">
                    <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
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