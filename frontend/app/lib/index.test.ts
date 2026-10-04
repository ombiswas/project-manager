import { describe, it, expect } from "vitest";
import { getTaskStatusColor, getProjectProgress, publicRoutes } from "./index";
import { cn } from "./utils";
import type { TaskStatus } from "@/types";

describe("Frontend Library Utilities", () => {
  describe("publicRoutes", () => {
    it("should include standard public auth paths", () => {
      expect(publicRoutes).toContain("/");
      expect(publicRoutes).toContain("/sign-in");
      expect(publicRoutes).toContain("/sign-up");
      expect(publicRoutes).toContain("/verify-email");
      expect(publicRoutes).toContain("/reset-password");
      expect(publicRoutes).toContain("/forgot-password");
    });
  });

  describe("getTaskStatusColor", () => {
    it("should return correct classes for known statuses", () => {
      expect(getTaskStatusColor("In Progress")).toContain("text-[#a0c3ec]");
      expect(getTaskStatusColor("Completed")).toContain("text-white");
      expect(getTaskStatusColor("Done")).toContain("text-white");
      expect(getTaskStatusColor("Cancelled")).toContain("text-[#ff7a17]");
      expect(getTaskStatusColor("On Hold")).toContain("text-[#ffc285]");
      expect(getTaskStatusColor("Planning")).toContain("text-[#c4b5fd]");
      expect(getTaskStatusColor("In Review")).toContain("text-[#c4b5fd]");
    });

    it("should return fallback classes for unknown status", () => {
      expect(getTaskStatusColor("Unknown")).toContain("text-[#dadbdf]");
    });
  });

  describe("getProjectProgress", () => {
    it("should return 0 when tasks array is empty or undefined", () => {
      expect(getProjectProgress(undefined)).toBe(0);
      expect(getProjectProgress([])).toBe(0);
    });

    it("should return 100 when all tasks are Done", () => {
      const tasks = [
        { status: "Done" as TaskStatus },
        { status: "Done" as TaskStatus },
      ];
      expect(getProjectProgress(tasks)).toBe(100);
    });

    it("should calculate correct percentage when partially completed", () => {
      const tasks = [
        { status: "Done" as TaskStatus },
        { status: "In Progress" as TaskStatus },
      ];
      expect(getProjectProgress(tasks)).toBe(50);
    });

    it("should round properly for non-integer percentages", () => {
      const tasks = [
        { status: "Done" as TaskStatus },
        { status: "To Do" as TaskStatus },
        { status: "In Review" as TaskStatus },
      ];
      expect(getProjectProgress(tasks)).toBe(33);
    });
  });

  describe("cn utility", () => {
    it("should merge conditional classnames correctly", () => {
      const isHidden = false;
      const isExpanded = true;
      expect(cn("px-2", "py-1")).toBe("px-2 py-1");
      expect(cn("px-2", isHidden && "hidden", "py-1")).toBe("px-2 py-1");
      expect(cn("px-2", isExpanded && "px-4")).toBe("px-4");
    });
  });

  describe("URL Search Params filter & sort derivations", () => {
    it("should derive default values when search params are empty", () => {
      const params = new URLSearchParams("");
      const filter = params.get("filter") || "all";
      const sortDirection = params.get("sort") === "asc" ? "asc" : "desc";
      const search = params.get("search") || "";

      expect(filter).toBe("all");
      expect(sortDirection).toBe("desc");
      expect(search).toBe("");
    });

    it("should derive filter, sort and search from URL search params accurately", () => {
      const params = new URLSearchParams("filter=todo&sort=asc&search=urgent");
      const filter = params.get("filter") || "all";
      const sortDirection = params.get("sort") === "asc" ? "asc" : "desc";
      const search = params.get("search") || "";

      expect(filter).toBe("todo");
      expect(sortDirection).toBe("asc");
      expect(search).toBe("urgent");
    });

    it("should preserve unrelated params like workspaceId when updating search", () => {
      const prev = new URLSearchParams("workspaceId=ws-123&tab=overview");
      const next = new URLSearchParams(prev);
      const searchTerm = "john";

      if (searchTerm.trim()) {
        next.set("search", searchTerm);
      } else {
        next.delete("search");
      }

      expect(next.get("workspaceId")).toBe("ws-123");
      expect(next.get("tab")).toBe("overview");
      expect(next.get("search")).toBe("john");
    });

    it("should delete search param when searchTerm is empty or whitespace", () => {
      const prev = new URLSearchParams("workspaceId=ws-123&search=existing");
      const next = new URLSearchParams(prev);
      const searchTerm = "   ";

      if (searchTerm.trim()) {
        next.set("search", searchTerm);
      } else {
        next.delete("search");
      }

      expect(next.get("workspaceId")).toBe("ws-123");
      expect(next.has("search")).toBe(false);
    });

    it("should preserve existing search and filter params when toggling sort", () => {
      const prev = new URLSearchParams("filter=inprogress&search=fix&sort=desc");
      const currentSort = prev.get("sort") === "asc" ? "asc" : "desc";
      const nextSort = currentSort === "asc" ? "desc" : "asc";

      const next = new URLSearchParams(prev);
      next.set("sort", nextSort);

      expect(next.get("filter")).toBe("inprogress");
      expect(next.get("search")).toBe("fix");
      expect(next.get("sort")).toBe("asc");
    });
  });
});

