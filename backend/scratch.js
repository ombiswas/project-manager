import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
});

const partialSchema = projectSchema.partial();

const payload = {
  title: "Test Project",
  description: "",
  status: "In Progress"
};

const result = partialSchema.safeParse(payload);
console.log(JSON.stringify(result, null, 2));
