import Workspace from "../models/workspace.js";

const createWorkspace = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const workspace = await Workspace.create({
            name,
            description,
            color,
            owener: req.user._id,
            menubar: [
                {
                    user: req.user._id,
                    role: "owener",
                    joinedAt: new Date(),
                }
            ]
        });

        res.status(201).json({ workspace });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "menubar.user": req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({ workspaces });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export { createWorkspace, getWorkspaces };