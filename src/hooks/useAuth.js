import { useState } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";
import * as leadService from "../services/leadService";
import * as officeService from "../services/officeService";
import * as appointmentService from "../services/appointmentService";
import * as documentService from "../services/documentService";
import * as notificationService from "../services/notificationService";
import * as universityService from "../services/universityService";
import * as courseService from "../services/courseService";
import * as messageService from "../services/messageService";
import * as reportService from "../services/reportService";
import * as taskService from "../services/taskService";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (serviceMethod, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceMethod(...args);
      return response.data || response;
    } catch (err) {
      setError(err.response?.data?.error || "API call failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    callApi,
    services: {
      auth: authService,
      user: userService,
      lead: leadService,
      office: officeService,
      appointment: appointmentService,
      document: documentService,
      notification: notificationService,
      university: universityService,
      course: courseService,
      message: messageService,
      report: reportService,
      task: taskService,
    },
  };
};

export default useApi;
