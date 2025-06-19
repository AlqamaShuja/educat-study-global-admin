// middleware/errorMiddleware.js

import { toast } from "react-toastify";

export const handleApiError = (
  error,
  defaultMessage = "Something went wrong"
) => {
  if (!error || typeof error !== "object") {
    toast.error(defaultMessage);
    return;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;

  switch (status) {
    case 400:
      toast.error(message || "Bad Request");
      break;
    case 401:
      toast.error("Unauthorized. Please log in.");
      break;
    case 403:
      toast.error("Forbidden. You do not have access.");
      break;
    case 404:
      toast.error("Not found.");
      break;
    case 500:
      toast.error("Internal server error.");
      break;
    default:
      toast.error(message || defaultMessage);
      break;
  }
};

// Optionally wrap React Query errors:
export const reactQueryErrorHandler = (error) => {
  handleApiError(error, "Query failed");
};
