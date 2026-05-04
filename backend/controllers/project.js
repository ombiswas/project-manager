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

    if (!memberInfo) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    if (memberInfo.role === "viewer") {
      return res.status(403).json({
        message: "Viewers cannot create projects",
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

    // Ensure the creator is added as a member if not already there
    const creatorIncluded = members && members.some(m => m.user.toString() === req.user._id.toString());
    const finalMembers = members || [];
    if (!creatorIncluded && !members) {
      finalMembers.push({ user: req.user._id, role: "manager" });
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

    const project = await Project.findById(projectId).populate("members.user", "name email profilePicture");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const isMember = project.members.some(
      (m) => m.user && (m.user._id || m.user).equals(req.user._id)
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
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const isMember = project.members.some(
      (m) => m.user && (m.user._id || m.user).equals(req.user._id)
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
    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const creatorMember = workspace.members.find(
      (m) => m.user.toString() === project.createdBy.toString()
    );

    const requesterRole = requesterMember.role;
    const creatorRole = creatorMember ? creatorMember.role : "member"; // Default to member if creator left

    let canDelete = false;

    if (requesterRole === "owner") {
      canDelete = true;
    } else if (requesterRole === "admin") {
      if (creatorRole !== "owner") {
        canDelete = true;
      }
    } else if (requesterRole === "member") {
      if (project.createdBy.toString() === req.user._id.toString()) {
         canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({
        message: "You do not have permission to delete this project based on your role and the project creator's role",
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

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isOwner = project.createdBy.equals(req.user._id);
    const isManager = project.members.some(
      (m) => m.user && m.user.equals(req.user._id) && m.role === "manager"
    );

    if (!isOwner && !isManager) {
      return res.status(403).json({
        message: "Only the project owner or manager can update this project",
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
