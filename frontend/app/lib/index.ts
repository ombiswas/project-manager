import type { ProjectStatus, TaskStatus } from "@/types";

export const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/reset-password",
  "/forgot-password",
  "*",
];

export const getTaskStatusColor = (status: ProjectStatus | string) => {
  switch (status) {
    case "In Progress":
      return "bg-[#1a1c20] text-[#a0c3ec] border border-[#a0c3ec]/30 font-mono text-[11px] uppercase tracking-[1.2px]";
    case "Completed":
    case "Done":
      return "bg-[#1a1c20] text-white border border-white/30 font-mono text-[11px] uppercase tracking-[1.2px]";
    case "Cancelled":
      return "bg-[#1a1c20] text-[#ff7a17] border border-[#ff7a17]/30 font-mono text-[11px] uppercase tracking-[1.2px]";
    case "On Hold":
      return "bg-[#1a1c20] text-[#ffc285] border border-[#ffc285]/30 font-mono text-[11px] uppercase tracking-[1.2px]";
    case "Planning":
    case "In Review":
      return "bg-[#1a1c20] text-[#c4b5fd] border border-[#c4b5fd]/30 font-mono text-[11px] uppercase tracking-[1.2px]";
    default:
      return "bg-[#1a1c20] text-[#dadbdf] border border-[#212327] font-mono text-[11px] uppercase tracking-[1.2px]";
  }
};

export const getProjectProgress = (tasks?: { status: TaskStatus }[]) => {
  if (!tasks || !Array.isArray(tasks)) return 0;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task?.status === "Done").length;
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

export * from "./query-keys";
