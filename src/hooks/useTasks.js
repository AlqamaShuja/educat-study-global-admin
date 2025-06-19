import { useState, useContext } from 'react';
import axios from 'axios';
// import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext exists

const useTasks = () => {
  // const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Get tasks based on role
  const getTasks = async () => {
    // setLoading(true);
    // setError(null);
    // try {
    //   let endpoint;
    //   if (user.role === "consultant") endpoint = "/consultant/tasks";
    //   else if (user.role === "manager") endpoint = "/manager/tasks";
    //   else if (user.role === "super_admin") endpoint = "/super-admin/tasks";
    //   else throw new Error("Invalid role");
    //   const response = await api.get(endpoint);
    //   return response.data;
    // } catch (err) {
    //   setError(err.response?.data?.error || "Failed to fetch tasks");
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Create task (manager/super_admin)
  const createTask = async (taskData) => {
    // setLoading(true);
    // setError(null);
    // try {
    //   const endpoint =
    //     user.role === 'manager' ? '/manager/tasks' : '/super-admin/tasks';
    //   const response = await api.post(endpoint, taskData);
    //   return response.data;
    // } catch (err) {
    //   setError(err.response?.data?.error || 'Failed to create task');
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Update task status (consultant)
  const updateTaskStatus = async (taskId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/consultant/tasks/${taskId}/status`, {
        status,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign task (manager/super_admin)
  const assignTask = async (taskId, consultantId) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === 'manager'
          ? `/manager/tasks/${taskId}/assign`
          : `/super-admin/tasks/${taskId}/assign`;
      const response = await api.put(endpoint, { consultantId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get task details
  const getTaskDetails = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (user.role === 'consultant') endpoint = `/consultant/tasks/${taskId}`;
      else if (user.role === 'manager') endpoint = `/manager/tasks/${taskId}`;
      else if (user.role === 'super_admin')
        endpoint = `/super-admin/tasks/${taskId}`;
      else throw new Error('Invalid role');

      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch task details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete task (manager/super_admin)
  const deleteTask = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        user.role === 'manager'
          ? `/manager/tasks/${taskId}`
          : `/super-admin/tasks/${taskId}`;
      const response = await api.delete(endpoint);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getTasks,
    createTask,
    updateTaskStatus,
    assignTask,
    getTaskDetails,
    deleteTask,
  };
};

export default useTasks;
