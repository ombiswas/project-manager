import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import { projectSchema } from "../libs/validate-schema.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const memberInfo = workspace.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();
    const requesterRole = isWorkspaceOwner ? "owner" : (memberInfo ? memberInfo.role : null);

    if (!requesterRole) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    if (requesterRole !== "owner" && requesterRole !== "admin") {
      return res.status(403).json({
        message: "Only Workspace Owners and Admins can create projects",
      });
    }

    const tagArray = Array.isArray(tags) 
      ? tags 
      : tags ? tags.split(",").map(t => t.trim()).filter(t => t !== "") : [];

    if (members && members.length === 0) {
      return res.status(400).json({
        message: "At least one member is required for the project",
      });
    }

    // Ensure the creator is added as a member for access control
    const finalMembers = members || [];
    if (!finalMembers.some(m => m.toString() === req.user._id.toString())) {
      finalMembers.push(req.user._id);
    }

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members: finalMembers,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("members", "name email profilePicture");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const isMember = project.members.some(
      (m) => String(m._id || m) === req.user._id.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const isMember = project.members.some(
      (m) => String(m._id || m) === req.user._id.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("workspace");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = project.workspace;
    if (!workspace) {
      return res.status(404).json({ message: "Workspace associated with project not found" });
    }

    // Robust Owner check
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !requesterMember) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const requesterRole = isOwner ? "owner" : requesterMember.role;

    const creatorMember = workspace.members.find(
      (m) => m.user.toString() === project.createdBy.toString()
    );

    const isCreatorOwner = workspace.owner.toString() === project.createdBy.toString();
    const creatorRole = isCreatorOwner ? "owner" : (creatorMember ? creatorMember.role : "member");

    let canDelete = false;
    if (requesterRole === "owner" || requesterRole === "admin") {
      canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({
        message: "You do not have permission to delete this project.",
      });
    }

    // Remove project from workspace
    await Workspace.findByIdAndUpdate(project.workspace._id, {
      $pull: { projects: projectId },
    });

    // Delete all tasks associated with the project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Manual validation to catch specific errors
    const validationResult = projectSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(err => {
        if (err.code === "invalid_enum_value") {
          return `${err.path.join('.')} must be a valid option`;
        }
        return `${err.path.join('.')}: ${err.message}`;
      }).join(', ');
      return res.status(400).json({ message: errorMessage });
    }

    const { title, description, status, startDate, dueDate, tags, members } = validationResult.data;

    const project = await Project.findById(projectId).populate("workspace");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = project.workspace;
    if (!workspace) {
      return res.status(404).json({ message: "Workspace associated with project not found" });
    }

    // Robust Owner check
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !requesterMember) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const requesterRole = isOwner ? "owner" : requesterMember.role;

    const creatorMember = workspace.members.find(
      (m) => m.user.toString() === project.createdBy.toString()
    );

    const isCreatorOwner = workspace.owner.toString() === project.createdBy.toString();
    const creatorRole = isCreatorOwner ? "owner" : (creatorMember ? creatorMember.role : "member");

    let canUpdate = false;
    if (requesterRole === "owner" || requesterRole === "admin") {
      canUpdate = true;
    }

    if (!canUpdate) {
      return res.status(403).json({
        message: "You do not have permission to update this project.",
      });
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (tags !== undefined) {
      project.tags = Array.isArray(tags) 
        ? tags 
        : tags.split(",").map(t => t.trim()).filter(t => t !== "");
    }
    if (members !== undefined) {
      if (members.length === 0) {
        return res.status(400).json({
          message: "At least one member is required for the project",
        });
      }
      project.members = members;
    }

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createProject,
  getProjectDetails,
  getProjectTasks,
  deleteProject,
  updateProject,
};
