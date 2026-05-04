import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/projetc-card";
import { getProjectProgress } from "@/lib";

interface ProjectListProps {
    workspaceId: string;
    projects: Project[];
    canCreateProject: boolean;
    onCreateProject: () => void;
}

export const ProjectList = ({
    workspaceId,
    projects,
    canCreateProject,
    onCreateProject,
}: ProjectListProps) => {
    return (
        <div>
            <h3 className="text-xl font-medium mb-4">Projects</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <NoDataFound
                        title="No projects found"
                        description="Projects you are a part of will appear here."
                        buttonText={canCreateProject ? "Create Project" : undefined}
                        buttonAction={canCreateProject ? onCreateProject : undefined}
                    />
                ) : (
                    projects.map((project) => {
                        const projectProgress = getProjectProgress(project.tasks as any);

                        return (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                progress={projectProgress}
                                workspaceId={workspaceId}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
