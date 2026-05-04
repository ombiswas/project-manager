import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

export const checkWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.owner.equals(req.user._id);
    const isMember = workspace.members.some(
      (m) => m.user && m.user.equals(req.user._id)
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "You no longer have access to this workspace" });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("workspace");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const workspace = project.workspace;
    const isWorkspaceOwner = workspace?.owner?.equals(req.user._id);
    const isWorkspaceAdmin = workspace?.members?.find(
      (m) => m.user && m.user.equals(req.user._id)
    )?.role === "admin";

    const isMember = project.members.some(
      (userId) => userId && userId.equals(req.user._id)
    );

    if (!isCreator && !isMember && !isWorkspaceOwner && !isWorkspaceAdmin) {
      return res.status(403).json({ message: "You no longer have access to this project" });
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkTaskMember = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project).populate("workspace");
    if (!project) {
        return res.status(404).json({ message: "Associated project not found" });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const workspace = project.workspace;
    const isWorkspaceOwner = workspace?.owner?.equals(req.user._id);
    const isWorkspaceAdmin = workspace?.members?.find(
      (m) => m.user && m.user.equals(req.user._id)
    )?.role === "admin";

    const isMember = project.members.some(
      (userId) => userId && userId.equals(req.user._id)
    );

    if (!isCreator && !isMember && !isWorkspaceOwner && !isWorkspaceAdmin) {
      return res.status(403).json({ message: "You no longer have access to this task" });
    }

    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
};
