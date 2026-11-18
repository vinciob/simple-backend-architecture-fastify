import { Type, type Static } from "typebox";

export const TaskStatusSchema = Type.Union([
  Type.Literal("created"),
  Type.Literal("in_progress"),
  Type.Literal("completed"),
]);

const NullableDateSchema = Type.Union([
  Type.String({ format: "date-time" }),
  Type.Null(),
]);

const NullableDescriptionSchema = Type.Union([
  Type.String({ maxLength: 2000 }),
  Type.Null(),
]);

export const TaskParamsSchema = Type.Object({
  id: Type.String({ pattern: "^[a-fA-F0-9]{24}$" }),
});

/**
 * Schema for creating a new task
 */
export const CreateTaskSchema = Type.Object(
  {
    name: Type.String({
      minLength: 1,
      maxLength: 120,
    }),
    description: Type.Optional(NullableDescriptionSchema),
    dueDate: Type.Optional(NullableDateSchema),
    status: Type.Optional(TaskStatusSchema),
  },
  { additionalProperties: false },
);
export type CreateTaskInput = Static<typeof CreateTaskSchema>;

/**
 * Schema for updating an existing task
 * Requires at least one property to be provided for update
 */
export const UpdateTaskSchema = Type.Partial(CreateTaskSchema, {
  minProperties: 1,
  additionalProperties: false,
});
export type UpdateTaskInput = Static<typeof UpdateTaskSchema>;

/**
 * Schema for task response
 */
export const TaskResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: NullableDescriptionSchema,
  status: TaskStatusSchema,
  dueDate: NullableDateSchema,
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  createdBy: Type.String(),
});
export type TaskResponse = Static<typeof TaskResponseSchema>;

/**
 * Schema for task list item
 */
export const TaskListItemSchema = Type.Object({
  _id: Type.String(),
  name: Type.String(),
  dueDate: NullableDateSchema,
  status: TaskStatusSchema,
});
export const TaskListResponseSchema = Type.Array(TaskListItemSchema);
export type TaskListItem = Static<typeof TaskListItemSchema>;

/**
 * Schema for task routes
 */

const taskTag = "Tasks";

export const CreateTaskRouteSchema = {
  tags: [taskTag],
  body: CreateTaskSchema,
  response: { 201: TaskResponseSchema },
};

export const GetTasksListRouteSchema = {
  tags: [taskTag],
  response: { 200: TaskListResponseSchema },
};

export const GetTaskRouteSchema = {
  tags: [taskTag],
  params: TaskParamsSchema,
  response: { 200: TaskResponseSchema },
};

export const UpdateTaskRouteSchema = {
  tags: [taskTag],
  params: TaskParamsSchema,
  body: UpdateTaskSchema,
  response: { 200: TaskResponseSchema },
};

export const DeleteTaskRouteSchema = {
  tags: [taskTag],
  params: TaskParamsSchema,
};
