export const Task = {
  id: String,
  leadId: String,
  description: String,
  dueDate: String,
  status: ["pending", "completed"],
};

export const Document = {
  id: String,
  leadId: String,
  type: String,
  url: String,
  notes: String,
  uploadedAt: String,
};
