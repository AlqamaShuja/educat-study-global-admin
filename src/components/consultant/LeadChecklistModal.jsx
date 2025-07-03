// src/components/consultant/LeadCheckListModal.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Calendar,
  AlertCircle,
  CheckCircle,
  Circle,
  Edit3,
  Save,
  Trash2,
  Flag,
  Clock,
  User,
} from "lucide-react";

const Modal = ({ isOpen, onClose, title, size = "lg", children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
            size === "sm"
              ? "sm:max-w-sm"
              : size === "md"
              ? "sm:max-w-md"
              : size === "lg"
              ? "sm:max-w-lg"
              : size === "xl"
              ? "sm:max-w-4xl"
              : "sm:max-w-lg"
          } sm:w-full`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Button = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center border border-transparent font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "text-gray-700 bg-white hover:bg-gray-50 border-gray-300 focus:ring-blue-500",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    ></div>
  );
};

const LeadChecklistModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingChecklist = null,
  studentName,
  loading = false,
}) => {
  const [checklistForm, setChecklistForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    items: [],
  });

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    completed: false,
    required: true,
  });

  const [editingItemIndex, setEditingItemIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Priority colors and labels
  const priorityConfig = {
    low: {
      color: "bg-green-100 text-green-800",
      label: "Low Priority",
      icon: "🟢",
    },
    medium: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Medium Priority",
      icon: "🟡",
    },
    high: {
      color: "bg-red-100 text-red-800",
      label: "High Priority",
      icon: "🔴",
    },
  };

  // Initialize form when modal opens or when existingChecklist changes
  useEffect(() => {
    if (isOpen) {
      if (existingChecklist) {
        setChecklistForm({
          title: existingChecklist.title || "",
          description: existingChecklist.description || "",
          dueDate: existingChecklist.dueDate
            ? new Date(existingChecklist.dueDate).toISOString().slice(0, 16)
            : "",
          priority: existingChecklist.priority || "medium",
          items: existingChecklist.items || [],
        });
      } else {
        // Reset form for new checklist
        setChecklistForm({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          items: [],
        });
      }
      setNewItem({
        title: "",
        description: "",
        completed: false,
        required: true,
      });
      setEditingItemIndex(-1);
    }
  }, [isOpen, existingChecklist]);

  // Add new item to checklist
  const handleAddItem = () => {
    if (!newItem.title.trim()) return;

    const item = {
      id: Date.now().toString(),
      title: newItem.title.trim(),
      description: newItem.description.trim(),
      completed: newItem.completed,
      required: newItem.required,
      createdAt: new Date().toISOString(),
    };

    setChecklistForm((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      title: "",
      description: "",
      completed: false,
      required: true,
    });
  };

  // Remove item from checklist
  const handleRemoveItem = (index) => {
    setChecklistForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Edit existing item
  const handleEditItem = (index) => {
    const item = checklistForm.items[index];
    setNewItem({
      title: item.title,
      description: item.description || "",
      completed: item.completed,
      required: item.required,
    });
    setEditingItemIndex(index);
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (!newItem.title.trim()) return;

    const updatedItems = [...checklistForm.items];
    updatedItems[editingItemIndex] = {
      ...updatedItems[editingItemIndex],
      title: newItem.title.trim(),
      description: newItem.description.trim(),
      completed: newItem.completed,
      required: newItem.required,
      updatedAt: new Date().toISOString(),
    };

    setChecklistForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setNewItem({
      title: "",
      description: "",
      completed: false,
      required: true,
    });
    setEditingItemIndex(-1);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setNewItem({
      title: "",
      description: "",
      completed: false,
      required: true,
    });
    setEditingItemIndex(-1);
  };

  // Toggle item completion
  const toggleItemCompletion = (index) => {
    const updatedItems = [...checklistForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      completed: !updatedItems[index].completed,
      completedAt: !updatedItems[index].completed
        ? new Date().toISOString()
        : null,
    };

    setChecklistForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle form submission
  // 🔄 Put this *inside* LeadChecklistModal, replacing your current handleSubmit
  const handleSubmit = async () => {
    // ────────────────────────────────────────────────────────
    // 1.  Merge the draft/newItem into the items array
    // ────────────────────────────────────────────────────────
    let items = [...checklistForm.items];

    // If we’re in “edit” mode but the user never pressed “Save changes”
    if (editingItemIndex >= 0) {
      items[editingItemIndex] = {
        ...items[editingItemIndex],
        ...newItem,
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        updatedAt: new Date().toISOString(),
      };
    }
    // If we’re *not* editing, treat the draft as a fresh item
    else if (newItem.title.trim()) {
      items.push({
        id: Date.now().toString(),
        ...newItem,
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    // ────────────────────────────────────────────────────────
    // 2.  Basic validation before sending to the API
    // ────────────────────────────────────────────────────────
    if (!checklistForm.title.trim()) {
      alert("Checklist title is required");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item to the checklist");
      return;
    }

    // ────────────────────────────────────────────────────────
    // 3.  Build the payload and send it
    // ────────────────────────────────────────────────────────
    const payload = { ...checklistForm, items };

    setIsSubmitting(true);
    try {
      await onSubmit(payload); // ← your API call
      handleClose();
    } catch (err) {
      console.error("Error submitting checklist:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  //   const handleSubmit = async () => {
  //     if (!checklistForm.title.trim()) {
  //       alert("Checklist title is required");
  //       return;
  //     }

  //     if (checklistForm.items.length === 0) {
  //       alert("Please add at least one item to the checklist");
  //       return;
  //     }

  //     setIsSubmitting(true);
  //     try {
  //       await onSubmit(checklistForm);
  //       handleClose();
  //     } catch (error) {
  //       console.error("Error submitting checklist:", error);
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

  // Handle modal close
  const handleClose = () => {
    setChecklistForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      items: [],
    });
    setNewItem({
      title: "",
      description: "",
      completed: false,
      required: true,
    });
    setEditingItemIndex(-1);
    onClose();
  };

  // Calculate progress
  const completedItems = checklistForm.items.filter(
    (item) => item.completed
  ).length;
  const totalItems = checklistForm.items.length;
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-blue-600" />
          <span>
            {existingChecklist ? "Edit Checklist" : "Create New Checklist"}
          </span>
          {studentName && (
            <span className="text-sm text-gray-500">for {studentName}</span>
          )}
        </div>
      }
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Checklist Basic Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checklist Title *
              </label>
              <Input
                type="text"
                value={checklistForm.title}
                onChange={(e) =>
                  setChecklistForm({ ...checklistForm, title: e.target.value })
                }
                placeholder="e.g., Document Collection Checklist"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={checklistForm.description}
                onChange={(e) =>
                  setChecklistForm({
                    ...checklistForm,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of the checklist..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <Input
                type="datetime-local"
                value={checklistForm.dueDate}
                onChange={(e) =>
                  setChecklistForm({
                    ...checklistForm,
                    dueDate: e.target.value,
                  })
                }
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={checklistForm.priority}
                onChange={(e) =>
                  setChecklistForm({
                    ...checklistForm,
                    priority: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-600">
                  {completedItems}/{totalItems} completed ({progress}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Add New Item */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            {editingItemIndex >= 0 ? "Edit Item" : "Add New Item"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Title *
              </label>
              <Input
                type="text"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                placeholder="e.g., Submit passport copy"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Additional details about this item..."
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newItem.required}
                  onChange={(e) =>
                    setNewItem({ ...newItem, required: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Required</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newItem.completed}
                  onChange={(e) =>
                    setNewItem({ ...newItem, completed: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Completed</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            {editingItemIndex >= 0 ? (
              <>
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancelEdit} size="sm" variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAddItem}
                size="sm"
                disabled={!newItem.title.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {/* Checklist Items */}
        {checklistForm.items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Checklist Items ({checklistForm.items.length})
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {checklistForm.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    item.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleItemCompletion(index)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-green-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${
                            item.completed
                              ? "text-green-800 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.required && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className={`text-xs mt-1 ${
                            item.completed ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditItem(index)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Creating for: {studentName}</span>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !checklistForm.title.trim() ||
                checklistForm.items.length === 0
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {existingChecklist ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {existingChecklist ? "Update Checklist" : "Create Checklist"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LeadChecklistModal;
