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
});
