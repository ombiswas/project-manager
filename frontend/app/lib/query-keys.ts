/**
 * Centralized Query Keys Factory for TanStack Query.
 * Organizes query keys hierarchically to enable fine-grained and prefix-based cache invalidations.
 */

export const queryKeys = {
  workspaces: {
    all: ["workspaces"] as const,
  },
  workspace: {
    all: ["workspace"] as const,
    byId: (workspaceId?: string) => ["workspace", workspaceId] as const,
    stats: (workspaceId?: string) => ["workspace", workspaceId, "stats"] as const,
    details: (workspaceId?: string, token?: string | null) =>
      ["workspace", workspaceId, "details", token || ""] as const,
  },
  projects: {
    all: ["project"] as const,
    byId: (projectId?: string) => ["project", projectId] as const,
  },
  tasks: {
    all: ["task"] as const,
    byId: (taskId?: string) => ["task", taskId] as const,
    activity: (taskId?: string) => ["task-activity", taskId] as const,
    comments: (taskId?: string) => ["comments", taskId] as const,
    myTasks: () => ["my-tasks"] as const,
    archivedTasks: () => ["archived-tasks"] as const,
  },
  user: {
    all: ["user"] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;

/** Polling interval for detail views (tasks, projects) while tab is visible */
export const DETAIL_POLL_MS = 30_000;
