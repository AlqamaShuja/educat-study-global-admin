import { useState, useEffect } from "react";
import * as appointmentService from "../services/appointmentService";
import { useAuthStore } from "../stores/authStore";

const useCalendar = (initialDate = new Date()) => {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, user]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAppointments({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      setEvents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.createAppointment(eventData);
      setEvents((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId, eventData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.updateAppointment(
        eventId,
        eventData
      );
      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? response.data : event))
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      await appointmentService.deleteAppointment(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  return {
    currentDate,
    events,
    loading,
    error,
    setCurrentDate,
    addEvent,
    updateEvent,
    deleteEvent,
    navigateMonth,
    fetchEvents,
  };
};

export default useCalendar;
