import taskService from "../services/task.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(
    req.params.projectId,
    req.user._id,
    req.body
  );
  res.status(201).json(task);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId);
  res.status(200).json(task);
});

export const updateTaskTitle = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskTitle(
    req.params.taskId,
    req.user._id,
    req.body.title
  );
  res.status(200).json(task);
});

export const updateTaskDescription = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskDescription(
    req.params.taskId,
    req.user._id,
    req.body.description
  );
  res.status(200).json(task);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.params.taskId,
    req.user._id,
    req.body.status
  );
  res.status(200).json(task);
});

export const updateTaskPriority = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskPriority(
    req.params.taskId,
    req.user._id,
    req.body.priority
  );
  res.status(200).json(task);
});

export const updateTaskAssignees = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskAssignees(
    req.params.taskId,
    req.user._id,
    req.body.assignees
  );
  res.status(200).json(task);
});

export const addSubTask = asyncHandler(async (req, res) => {
  const task = await taskService.addSubTask(
    req.params.taskId,
    req.user._id,
    req.body.title
  );
  res.status(201).json(task);
});

export const updateSubTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateSubTask(
    req.params.taskId,
    req.params.subTaskId,
    req.user._id,
    req.body.completed
  );
  res.status(200).json(task);
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await taskService.addComment(
    req.params.taskId,
    req.user._id,
    req.body.text
  );
  res.status(201).json(comment);
});

export const watchTask = asyncHandler(async (req, res) => {
  const task = await taskService.watchTask(req.params.taskId, req.user._id);
  res.status(200).json(task);
});

export const achievedTask = asyncHandler(async (req, res) => {
  const task = await taskService.achievedTask(req.params.taskId, req.user._id);
  res.status(200).json(task);
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getMyTasks(req.user._id);
  res.status(200).json(tasks);
});

export const getArchivedTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getArchivedTasks(req.user._id);
  res.status(200).json(tasks);
});

export const getActivityByResourceId = asyncHandler(async (req, res) => {
  const activity = await taskService.getActivityByResourceId(
    req.params.resourceId,
    req.query
  );
  res.status(200).json(activity);
});

export const getCommentsByTaskId = asyncHandler(async (req, res) => {
  const comments = await taskService.getCommentsByTaskId(req.params.taskId);
  res.status(200).json(comments);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.taskId, req.user._id);
  res.status(200).json(result);
});

export default {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignees,
  addSubTask,
  updateSubTask,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
  getArchivedTasks,
  getActivityByResourceId,
  getCommentsByTaskId,
  deleteTask,
};
