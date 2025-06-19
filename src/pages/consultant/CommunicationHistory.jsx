// pages/consultant/CommunicationHistory.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import useAuthStore from "../../stores/authStore";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import MessageList from "../../components/messaging/MessageList";
import MessageComposer from "../../components/messaging/MessageComposer";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

const CommunicationHistory = () => {
  const { studentId } = useParams();
  const { user } = useAuthStore();
  const { request, loading } = useApi();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchMyStudents();
  }, []);

  useEffect(() => {
    if (studentId) {
      const student = students.find((s) => s.studentId === studentId);
      if (student) {
        setSelectedStudent(student);
        fetchCommunicationHistory(studentId);
      }
    }
  }, [studentId, students]);

  const fetchMyStudents = async () => {
    try {
      const response = await request("/consultant/leads");
      const leads = response || [];

      const studentsWithLeads = leads.map((lead) => ({
        studentId: lead.studentId,
        leadId: lead.id,
        name: lead.student?.name || "Unknown",
        email: lead.student?.email || "N/A",
        avatar: lead.student?.avatar || null,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
        status: lead.status,
      }));

      setStudents(studentsWithLeads);

      if (!selectedStudent && studentsWithLeads.length > 0) {
        setSelectedStudent(studentsWithLeads[0]);
        fetchCommunicationHistory(studentsWithLeads[0].studentId);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCommunicationHistory = async (studentIdParam) => {
    try {
      const response = await request(
        `/consultant/students/${studentIdParam}/communication`
      );
      const communications = response || [];

      // Convert communications to message format
      const formattedMessages = communications.map((comm) => ({
        id: comm.id || Math.random().toString(),
        senderId:
          comm.senderId || (comm.type === "notification" ? "system" : user.id),
        senderName:
          comm.senderName ||
          (comm.senderId === user.id ? user.name : selectedStudent?.name),
        content: comm.content || comm.message,
        timestamp: comm.timestamp || comm.createdAt,
        type: comm.type || "text",
        isRead: comm.isRead || false,
      }));

      setMessages(formattedMessages);

      // Mark messages as read
      if (
        formattedMessages.some((msg) => !msg.isRead && msg.senderId !== user.id)
      ) {
        markMessagesAsRead(studentIdParam);
      }
    } catch (error) {
      console.error("Error fetching communication history:", error);
    }
  };

  const markMessagesAsRead = async (studentIdParam) => {
    try {
      await request(`/consultant/students/${studentIdParam}/messages/read`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (messageContent, attachments = []) => {
    if (!selectedStudent || !messageContent.trim()) return;

    try {
      await request(
        `/consultant/students/${selectedStudent.studentId}/messages`,
        {
          method: "POST",
          data: { message: messageContent },
        }
      );

      // Add message to local state immediately for better UX
      const newMsg = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: "text",
        isRead: true,
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      // Update student's last message info
      setStudents((prev) =>
        prev.map((student) =>
          student.studentId === selectedStudent.studentId
            ? {
                ...student,
                lastMessage: messageContent,
                lastMessageTime: new Date().toISOString(),
              }
            : student
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedStudent) return;

    // This would typically open a meeting scheduler modal
    console.log("Schedule meeting with:", selectedStudent.name);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "unread" && student.unreadCount > 0) ||
      (filterType === "recent" && student.lastMessageTime);

    return matchesSearch && matchesFilter;
  });

  const filteredMessages = messages.filter((message) => {
    if (filterType === "all") return true;
    if (filterType === "sent") return message.senderId === user.id;
    if (filterType === "received") return message.senderId !== user.id;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Communication Center
            </h1>
            <p className="text-gray-600">
              Manage conversations with your students
            </p>
          </div>

          {selectedStudent && (
            <div className="flex space-x-3">
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>

              <Button variant="outline" onClick={handleScheduleMeeting}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Students Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="unread">Unread Messages</option>
              <option value="recent">Recent Conversations</option>
            </select>
          </div>

          {/* Students List */}
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No students found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <div
                    key={student.studentId}
                    onClick={() => {
                      setSelectedStudent(student);
                      fetchCommunicationHistory(student.studentId);
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedStudent?.studentId === student.studentId
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </p>
                          {student.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                              {student.unreadCount}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 truncate">
                          {student.lastMessage || "No messages yet"}
                        </p>

                        {student.lastMessageTime && (
                          <p className="text-xs text-gray-400">
                            {new Date(
                              student.lastMessageTime
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <select
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Messages</option>
                      <option value="sent">Sent</option>
                      <option value="received">Received</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <MessageList
                  messages={filteredMessages}
                  currentUserId={user.id}
                />
              </div>

              {/* Message Composer */}
              <div className="bg-white border-t border-gray-200 p-4">
                <MessageComposer
                  onSend={handleSendMessage}
                  placeholder={`Message ${selectedStudent.name}...`}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a student to start messaging
                </h3>
                <p className="text-gray-600">
                  Choose a student from the sidebar to view conversation history
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationHistory;
