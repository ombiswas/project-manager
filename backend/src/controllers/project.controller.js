import projectService from "../services/project.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(
    req.params.workspaceId,
    req.user._id,
    req.body
  );
  res.status(201).json(project);
});

export const getProjectDetails = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectDetails(req.params.projectId, req.user._id);
  res.status(200).json(project);
});

export const getProjectTasks = asyncHandler(async (req, res) => {
  const result = await projectService.getProjectTasks(req.params.projectId, req.user._id);
  res.status(200).json(result);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.params.projectId,
    req.user._id,
    req.body
  );
  res.status(200).json(project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject(req.params.projectId, req.user._id);
  res.status(200).json(result);
});

export default {
  createProject,
  getProjectDetails,
  getProjectTasks,
  updateProject,
  deleteProject,
};
