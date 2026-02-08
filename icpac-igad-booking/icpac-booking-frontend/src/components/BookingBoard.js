import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import apiService from "../services/api";
import emailService from "../services/emailService";
import EmailSettingsPanel from "./EmailSettingsPanel";
import "./BookingBoard.css";
import "../services/emailNotifications.css";

// Utility function for amenity icons
const getAmenityIcon = (amenity) => {
  const amenityIcons = {
    Projector: "📽️",
    Whiteboard: "📝",
    "Video Conferencing": "📹",
    "Audio System": "🎤",
    "TV Screen": "📺",
    Screen: "🖥️",
    Computers: "💻",
    "Internet Access": "🌐",
    Printers: "🖨️",
  };
  return amenityIcons[amenity] || "🔧";
};

const BookingBoard = () => {
  const navigate = useNavigate();

  // Get data from context (API integrated)
  const {
    rooms: contextRooms,
    bookings: contextBookings,
    user,
    createBooking: apiCreateBooking,
    logout: contextLogout,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showProcurementDashboard, setShowProcurementDashboard] =
    useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState("all"); // all, pending, approved, rejected
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("icpac_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedMeetingSpace, setSelectedMeetingSpace] = useState(null);
  const [selectedMeetingSpaces, setSelectedMeetingSpaces] = useState([]);
  const [selectedBookingType, setSelectedBookingType] = useState("hourly");
  const [showMeetingSpaceModal, setShowMeetingSpaceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoomForModal, setSelectedRoomForModal] = useState(null);

  // localStorage functions
  const saveBookingsToStorage = (bookingsData) => {
    try {
      localStorage.setItem("icpac_bookings", JSON.stringify(bookingsData));
    } catch (error) {
      console.error("Error saving bookings to localStorage:", error);
    }
  };

  const saveMeetingSpaceSelection = (spaceId) => {
    try {
      if (currentUser) {
        localStorage.setItem(
          `icpac_selected_space_${currentUser.username}`,
          spaceId
        );
      }
    } catch (error) {
      console.error("Error saving meeting space selection:", error);
    }
  };

  const loadMeetingSpaceSelection = () => {
    try {
      if (currentUser) {
        return localStorage.getItem(
          `icpac_selected_space_${currentUser.username}`
        );
      }
      return null;
    } catch (error) {
      console.error("Error loading meeting space selection:", error);
      return null;
    }
  };

  const clearMeetingSpaceSelection = () => {
    try {
      if (currentUser) {
        localStorage.removeItem(`icpac_selected_space_${currentUser.username}`);
      }
    } catch (error) {
      console.error("Error clearing meeting space selection:", error);
    }
  };

  const loadBookingsFromStorage = () => {
    try {
      const saved = localStorage.getItem("icpac_bookings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading bookings from localStorage:", error);
    }
    return null;
  };

  const saveUsersToStorage = (usersData) => {
    try {
      localStorage.setItem("icpac_users", JSON.stringify(usersData));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  };

  const loadUsersFromStorage = () => {
    try {
      const saved = localStorage.getItem("icpac_users");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
    }
    return null;
  };

  const shouldShowBookingInterface = (date) => {
    const now = new Date();
    const selectedDateObj = new Date(date);

    // Set both dates to start of day for comparison
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(selectedDateObj);
    selectedDay.setHours(0, 0, 0, 0);

    // Hide interface for past dates completely
    if (selectedDay < today) {
      return false;
    }

    // For future dates, always show
    if (selectedDay > today) {
      return true;
    }

    // For today, show bookings only if it's before 18:00 (6 PM)
    const currentHour = now.getHours();
    return currentHour < 18;
  };

  const handleAdminLogin = (password) => {
    if (password === "admin123") {
      // Simple password check
      setIsAdmin(true);
      setShowAdminLogin(false);
      localStorage.setItem("icpac_admin", "true");
    } else {
      alert("Invalid admin password");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("icpac_admin");

    // Use context logout to clear global state and tokens
    contextLogout();

    // Redirect to login page
    navigate("/login");
  };

  const handleUserLogin = (email, password) => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLandingPage(false);
      setShowUserLogin(false);
      localStorage.setItem("icpac_current_user", JSON.stringify(user));

      // Delay meeting space check to allow rooms to be initialized
      setTimeout(() => {
        const savedSpace = loadMeetingSpaceSelection();
        if (savedSpace && rooms.length > 0) {
          const space = rooms.find((room) => room.id.toString() === savedSpace);
          if (space) {
            setSelectedMeetingSpace(space);
            setSelectedRoomId(savedSpace);
          } else {
            // If saved space no longer exists, show modal
            setShowMeetingSpaceModal(true);
          }
        } else {
          // Show meeting space selection modal for new/returning users
          setShowMeetingSpaceModal(true);
        }
      }, 100);

      // Set admin status based on user role
      if (user.role === "super_admin" || user.role === "room_admin") {
        setIsAdmin(true);
        localStorage.setItem("icpac_admin", "true");
      }
    } else {
      alert("Invalid email or password");
    }
  };

  const handleUserLogout = () => {
    // Clear local state
    clearMeetingSpaceSelection();
    setCurrentUser(null);
    setSelectedMeetingSpace(null);
    setSelectedRoomId("");
    setIsAdmin(false);
    setIsAuthenticated(false);
    setShowLandingPage(true);
    setShowMeetingSpaceModal(false);
    localStorage.removeItem("icpac_current_user");
    localStorage.removeItem("icpac_admin");

    // Use context logout to clear global state and tokens
    contextLogout();

    // Redirect to login page
    navigate("/login");
  };

  const handleMeetingSpaceSelection = (roomId) => {
    const selectedRoom = rooms.find(
      (room) => room.id.toString() === roomId.toString()
    );
    if (selectedRoom) {
      setSelectedMeetingSpace(selectedRoom);
      setSelectedRoomId(roomId.toString());
      saveMeetingSpaceSelection(roomId);
      setShowMeetingSpaceModal(false);
    }
  };

  const handleUserSignup = (userData) => {
    // Check if email already exists
    const emailExists = users.some(
      (user) =>
        user.email &&
        userData.email &&
        user.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (emailExists) {
      alert(
        "Error: A user with this email address already exists. Please use a different email."
      );
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: "user",
      managedRooms: [],
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);

    // Auto-login the new user
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setShowLandingPage(false);
    setShowSignup(false);
    localStorage.setItem("icpac_current_user", JSON.stringify(newUser));

    alert("Account created successfully! You are now logged in.");
  };

  const sendProcurementNotification = (booking) => {
    if (!booking.procurementOrders || booking.procurementOrders.length === 0) {
      return;
    }

    const notificationData = {
      id: Date.now(),
      bookingId: booking.id,
      bookingTitle: booking.title,
      organizer: booking.organizer,
      date: booking.date || booking.startDate,
      time: booking.time || booking.startTime,
      attendeeCount: booking.attendeeCount,
      procurementOrders: booking.procurementOrders,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (in a real app, this would be sent to a server)
    const existingNotifications = JSON.parse(
      localStorage.getItem("icpac_procurement_notifications") || "[]"
    );
    existingNotifications.push(notificationData);
    localStorage.setItem(
      "icpac_procurement_notifications",
      JSON.stringify(existingNotifications)
    );

    // Show a simple alert (in a real app, this would be proper notification)
    const orderSummary = booking.procurementOrders
      .map((order) => `${order.quantity} ${order.itemName}(s)`)
      .join(", ");

    alert(
      `Procurement notification sent!\n\nBooking: ${booking.title}\nOrganizer: ${booking.organizer}\nAttendees: ${booking.attendeeCount}\nOrders: ${orderSummary}\n\nProcurement officer has been notified.`
    );
  };

  const canManageRoom = (roomId) => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    if (currentUser.role === "room_admin") {
      return (
        currentUser.managedRooms && currentUser.managedRooms.includes(roomId)
      );
    }
    return false;
  };

  // Handle meeting space checkbox changes
  const handleMeetingSpaceChange = (roomId, isChecked) => {
    if (isChecked) {
      setSelectedMeetingSpaces((prev) => [...prev, roomId]);
    } else {
      setSelectedMeetingSpaces((prev) => prev.filter((id) => id !== roomId));
    }
  };

  const getVisibleRooms = () => {
    // If user has selected specific meeting spaces, show only those spaces
    if (selectedMeetingSpaces.length > 0 && currentUser) {
      return rooms.filter((room) => selectedMeetingSpaces.includes(room.id));
    }

    // If user has selected a specific meeting space (legacy single selection), show only that space
    if (selectedMeetingSpace && currentUser) {
      return [selectedMeetingSpace];
    }

    // If not logged in, show all rooms for general viewing
    if (!currentUser) return rooms;

    // Super admin can see all rooms (but still filtered by meeting space selection)
    if (currentUser.role === "super_admin") return rooms;

    // Room admin can only see their assigned rooms
    if (currentUser.role === "room_admin") {
      return rooms.filter(
        (room) =>
          currentUser.managedRooms && currentUser.managedRooms.includes(room.id)
      );
    }

    // Regular users can see all rooms for booking (but with limited management)
    return rooms;
  };

  const getFilteredRooms = () => {
    try {
      const visibleRooms = getVisibleRooms();
      console.log("getFilteredRooms - selectedRoomId:", selectedRoomId);
      console.log("getFilteredRooms - visibleRooms:", visibleRooms);

      // If no room is selected or "all" is selected, show all rooms
      if (
        !selectedRoomId ||
        selectedRoomId === "" ||
        selectedRoomId === "all"
      ) {
        return visibleRooms;
      }

      // Filter to show only the selected room
      const filteredRooms = visibleRooms.filter((room) => {
        return (
          room && room.id && room.id.toString() === selectedRoomId.toString()
        );
      });

      console.log("Filtered rooms:", filteredRooms);
      return filteredRooms;
    } catch (error) {
      console.error("Error in getFilteredRooms:", error);
      return [];
    }
  };

  const getGroupedRooms = () => {
    const visibleRooms = getVisibleRooms();
    return visibleRooms.reduce((groups, room) => {
      const category = room.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(room);
      return groups;
    }, {});
  };

  const getCategoryInfo = (category) => {
    const categoryConfig = {
      conference: {
        label: "Meeting Spaces",
        color: "#10b981",
        icon: "🏛️",
      },
      computer_lab: {
        label: "Computer Labs",
        color: "#3b82f6",
        icon: "💻",
      },
      special: {
        label: "Special Rooms",
        color: "#f59e0b",
        icon: "⚡",
      },
      other: {
        label: "Other Rooms",
        color: "#6b7280",
        icon: "🏢",
      },
    };
    return categoryConfig[category] || categoryConfig.other;
  };

  const getCapacityLevel = (capacity) => {
    if (capacity <= 10) return "small";
    if (capacity <= 25) return "medium";
    if (capacity <= 50) return "large";
    return "extra-large";
  };

  const getCapacityColor = (capacity) => {
    if (capacity <= 10) return "#f59e0b";
    if (capacity <= 25) return "#10b981";
    if (capacity <= 50) return "#3b82f6";
    return "#8b5cf6";
  };

  const canManageBooking = (booking) => {
    if (!currentUser) return false;

    // Super admin can manage all bookings
    if (currentUser.role === "super_admin") return true;

    // Room admin can manage bookings in their rooms
    if (currentUser.role === "room_admin") {
      return (
        currentUser.managedRooms &&
        currentUser.managedRooms.includes(booking.roomId)
      );
    }

    // Users can manage their own bookings (cancel and edit)
    // Check if the current user is the organizer or creator of the booking
    return (
      booking.organizer === currentUser.name ||
      booking.organizer === currentUser.email ||
      booking.createdBy === currentUser.email ||
      booking.createdBy === currentUser.id
    );
  };

  const cancelBooking = async (bookingId) => {
    const bookingToCancel = bookings.find(
      (booking) => booking.id === bookingId
    );
    const roomToCancel = rooms.find(
      (room) => room.id === bookingToCancel?.roomId
    );

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updatedBookings = bookings.filter(
        (booking) => booking.id !== bookingId
      );
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);

      // 📧 Send cancellation notification
      try {
        if (currentUser && bookingToCancel && roomToCancel) {
          const cancellationReason =
            prompt("Reason for cancellation (optional):") ||
            "No reason provided";
          await emailService.sendCancellationNotification(
            bookingToCancel,
            roomToCancel,
            currentUser,
            cancellationReason
          );
        }
      } catch (error) {
        console.error("Error sending cancellation notification:", error);
      }
    }
  };

  const editBooking = (booking) => {
    setEditingBooking(booking);
    setShowEditForm(true);
  };

  const updateBooking = (bookingData) => {
    // Check for conflicts with the new time/date/room combination
    const hasConflict = bookings.some((booking) => {
      // Skip checking against the current booking being edited
      if (booking.id === editingBooking.id) return false;

      return (
        booking.date === bookingData.date &&
        booking.time === bookingData.time &&
        booking.roomId === parseInt(bookingData.roomId)
      );
    });

    if (hasConflict) {
      alert(
        "This time slot is already booked for the selected room. Please choose a different time or room."
      );
      return;
    }

    // Preserve original creator information and approval status
    const updatedBooking = {
      ...editingBooking,
      ...bookingData,
      // Convert numeric fields to proper types
      roomId: parseInt(bookingData.roomId),
      duration: parseFloat(bookingData.duration),
      attendeeCount: parseInt(bookingData.attendeeCount),
      // Preserve original creator info
      createdBy: editingBooking.createdBy,
      createdByName: editingBooking.createdByName,
      // Keep auto-approved status
      approvalStatus: "approved",
      approvedBy: "System",
      approvedAt: new Date().toISOString(),
    };

    const updatedBookings = bookings.map((booking) =>
      booking.id === editingBooking.id ? updatedBooking : booking
    );
    setBookings(updatedBookings);
    saveBookingsToStorage(updatedBookings);

    setShowEditForm(false);
    setEditingBooking(null);
  };

  // Approval functions
  const canApproveBooking = (booking) => {
    if (!currentUser) return false;

    // Super admin can approve any booking
    if (currentUser.role === "super_admin") return true;

    // Room admin can approve bookings for rooms they manage
    if (currentUser.role === "room_admin") {
      return (
        currentUser.managedRooms &&
        currentUser.managedRooms.includes(booking.roomId)
      );
    }

    return false;
  };

  const approveBooking = async (bookingId) => {
    console.log(
      "approveBooking called with ID:",
      bookingId,
      "Current user:",
      currentUser
    );
    if (window.confirm("Are you sure you want to approve this booking?")) {
      const bookingToApprove = bookings.find(
        (booking) => booking.id === bookingId
      );
      const selectedRoom = rooms.find(
        (room) => room.id === bookingToApprove.roomId
      );
      const bookingUser = users.find(
        (user) =>
          user.email === bookingToApprove.userEmail ||
          user.name === bookingToApprove.organizer
      );

      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              approvalStatus: "approved",
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
            }
          : booking
      );
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);

      // 📧 Send approval notification to the user
      if (bookingUser && selectedRoom) {
        try {
          await emailService.sendApprovalNotification(
            bookingToApprove,
            selectedRoom,
            bookingUser,
            currentUser.name
          );
        } catch (error) {
          console.error("Error sending approval notification:", error);
        }
      }

      console.log("Booking approved successfully");
    }
  };

  const rejectBooking = async (bookingId) => {
    console.log(
      "rejectBooking called with ID:",
      bookingId,
      "Current user:",
      currentUser
    );
    const reason = prompt("Please provide a reason for rejection (optional):");
    if (reason !== null) {
      // User didn't cancel the prompt
      const bookingToReject = bookings.find(
        (booking) => booking.id === bookingId
      );
      const selectedRoom = rooms.find(
        (room) => room.id === bookingToReject.roomId
      );
      const bookingUser = users.find(
        (user) =>
          user.email === bookingToReject.userEmail ||
          user.name === bookingToReject.organizer
      );

      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              approvalStatus: "rejected",
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
              rejectionReason: reason,
            }
          : booking
      );
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings);

      // 📧 Send rejection notification to the user
      if (bookingUser && selectedRoom) {
        try {
          await emailService.sendRejectionNotification(
            bookingToReject,
            selectedRoom,
            bookingUser,
            currentUser.name,
            reason
          );
        } catch (error) {
          console.error("Error sending rejection notification:", error);
        }
      }

      console.log("Booking rejected successfully");
    }
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("icpac_dark_mode", JSON.stringify(newMode));
    document.body.classList.toggle("dark-mode", newMode);
  };

  // Load users on mount (if needed for user management features)
  useEffect(() => {
    const savedUsers = loadUsersFromStorage();
    if (savedUsers && savedUsers.length > 0) {
      setUsers(savedUsers);
    }
  }, []);

  // Initialize data
  // Load rooms from backend API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiService.getRooms();
        // Handle paginated response (check if response has 'results' key)
        const roomsData = response.results || response;
        // Transform backend format to frontend format
        const transformedRooms = roomsData.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          category: room.category,
          // Backend returns amenities as an array (JSONField)
          amenities: Array.isArray(room.amenities)
            ? room.amenities
            : typeof room.amenities === "string"
            ? room.amenities
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
            : [],
        }));
        setRooms(transformedRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
        // Fallback to hardcoded rooms if API fails
        setRooms([
          {
            id: 1,
            name: "Conference Room - Ground Floor",
            capacity: 200,
            category: "conference",
            amenities: [
              "Projector",
              "Whiteboard",
              "Video Conferencing",
              "Audio System",
            ],
          },
          {
            id: 2,
            name: "Boardroom - First Floor",
            capacity: 25,
            category: "conference",
            amenities: ["Projector", "Whiteboard", "Video Conferencing"],
          },
          {
            id: 3,
            name: "Small Boardroom - 1st Floor",
            capacity: 12,
            category: "conference",
            amenities: ["TV Screen", "Whiteboard"],
          },
          {
            id: 4,
            name: "Situation Room",
            capacity: 8,
            category: "special",
            amenities: ["Screen"],
          },
          {
            id: 5,
            name: "Computer Lab 1 - Ground Floor",
            capacity: 20,
            category: "computer_lab",
            amenities: ["Computers", "Projector", "Whiteboard"],
          },
          {
            id: 6,
            name: "Computer Lab 2 - First Floor",
            capacity: 20,
            category: "computer_lab",
            amenities: ["Computers", "Projector", "Whiteboard"],
          },
        ]);
      }
    };

    fetchRooms();

    // Load bookings from backend API
    const fetchBookings = async () => {
      try {
        const response = await apiService.getBookings();
        // Handle paginated response (check if response has 'results' key)
        const bookingsData = response.results || response;
        // Transform backend format to frontend format
        const transformedBookings = bookingsData.map((booking) => {
          // Calculate duration in hours from start and end time
          const startTime =
            booking.start_time?.substring(0, 5) || booking.start_time;
          const endTime = booking.end_time?.substring(0, 5) || booking.end_time;
          let durationHours = 0.5; // default 30 minutes

          if (startTime && endTime) {
            const [startHour, startMin] = startTime.split(":").map(Number);
            const [endHour, endMin] = endTime.split(":").map(Number);
            durationHours =
              (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
          }

          return {
            id: booking.id,
            roomId: booking.room_id || booking.room, // API returns room_id
            date: booking.start_date,
            time: startTime, // Convert "14:00:00" to "14:00"
            duration: durationHours, // Duration in hours (e.g., 0.5, 1, 2)
            bookingType: booking.booking_type || "hourly", // Add bookingType field
            startDate: booking.start_date,
            endDate: booking.end_date,
            startTime: startTime,
            endTime: endTime,
            title: booking.purpose,
            organizer:
              booking.user_name || booking.user_details?.name || "Unknown",
            description: booking.special_requirements || "",
            attendeeCount: booking.expected_attendees || 1,
            approvalStatus: booking.approval_status || "pending",
            approvedBy: booking.approved_by,
            approvedAt: booking.approved_at,
            createdBy: booking.user_details?.email,
            createdByName: booking.user_name || booking.user_details?.name,
          };
        });
        console.log("✅ Loaded bookings from API:", transformedBookings);
        setBookings(transformedBookings);
        // Also save to localStorage for offline access
        saveBookingsToStorage(transformedBookings);
      } catch (error) {
        console.error("Failed to load bookings from API:", error);
        // Fallback to localStorage if API fails
        const savedBookings = loadBookingsFromStorage();
        if (savedBookings && savedBookings.length > 0) {
          setBookings(savedBookings);
        }
      }
    };

    fetchBookings();
  }, []);

  // Generate time slots with 15-minute intervals for more granular booking
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      // Add the hour slots (08:00, 09:00, etc.)
      slots.push(`${hour.toString().padStart(2, "0")}:00`);

      // Add 15-minute intervals for each hour (except the last hour)
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:15`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
        slots.push(`${hour.toString().padStart(2, "0")}:45`);
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filter out past time slots for current day to remove empty spaces
  const getAvailableTimeSlots = (date) => {
    const today = new Date();
    const selectedDay = new Date(date);

    // If it's not today, show all slots
    if (selectedDay.toDateString() !== today.toDateString()) {
      return timeSlots;
    }

    // For today, filter out past time slots
    return timeSlots.filter((time) => !isTimeSlotInPast(date, time));
  };

  // Apply dark mode on initial load
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getTimeSlotIndex = (time) => {
    return timeSlots.findIndex((slot) => slot === time);
  };

  const isWeekend = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0; // Only Sunday = 0 is blocked, Saturday (6) is now allowed
  };

  // Week calculation helpers
  const getWeekDays = (selectedDate) => {
    const days = [];
    const date = new Date(selectedDate);

    // Get Monday of the week containing selectedDate
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday (0) as last day
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getDayAbbrev = (date) => {
    const abbrevs = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return abbrevs[date.getDay()];
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isTimeSlotInPast = (date, time) => {
    const now = new Date();
    const slotDate = new Date(date);

    // If the date is in the future, it's not in the past
    if (slotDate.toDateString() !== now.toDateString()) {
      return slotDate < now;
    }

    // If it's today, check if the time has passed
    const [hours, minutes] = time.split(":").map(Number);
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return slotDateTime < now;
  };

  const isSlotBooked = (roomId, time) => {
    const currentDate = formatDate(selectedDate);

    const result = bookings.some((booking) => {
      if (booking.roomId !== roomId) {
        return false;
      }

      // Apply approval filter (only for admins who can see all statuses)
      if (
        approvalFilter !== "all" &&
        currentUser &&
        (currentUser.role === "super_admin" ||
          currentUser.role === "room_admin")
      ) {
        const bookingStatus = booking.approvalStatus || "pending";
        if (bookingStatus !== approvalFilter) {
          return false;
        }
      }

      // Check if current date falls within booking date range
      const bookingStartDate = new Date(booking.startDate || booking.date);
      const bookingEndDate = new Date(booking.endDate || booking.date);
      const currentDateObj = new Date(currentDate);

      // If current date is not within the booking date range, no conflict
      if (
        currentDateObj < bookingStartDate ||
        currentDateObj > bookingEndDate
      ) {
        return false;
      }

      // For hourly bookings, check time slots
      if (booking.bookingType === "hourly") {
        const bookingStartIndex = getTimeSlotIndex(booking.time);
        // Convert duration from hours to number of 15-minute slots
        const durationInSlots = Math.ceil(booking.duration * 4);
        const bookingEndIndex = bookingStartIndex + durationInSlots;
        const currentTimeIndex = getTimeSlotIndex(time);

        const isBooked =
          currentTimeIndex >= bookingStartIndex &&
          currentTimeIndex < bookingEndIndex;

        // Debug log
        if (roomId === 1 && time >= "14:00" && time <= "14:30") {
          console.log(`🔍 Checking slot ${time} for room ${roomId}:`, {
            bookingTime: booking.time,
            bookingDuration: booking.duration,
            bookingStartIndex,
            bookingEndIndex,
            currentTimeIndex,
            durationInSlots,
            isBooked,
          });
        }

        return isBooked;
      }

      // For full-day, multi-day, or weekly bookings, all time slots are booked
      return true;
    });

    return result;
  };

  const getBookingDetails = (roomId, time) => {
    const currentDate = formatDate(selectedDate);

    return bookings.find((booking) => {
      if (booking.roomId !== roomId) {
        return false;
      }

      // Apply approval filter (only for admins who can see all statuses)
      if (
        approvalFilter !== "all" &&
        currentUser &&
        (currentUser.role === "super_admin" ||
          currentUser.role === "room_admin")
      ) {
        const bookingStatus = booking.approvalStatus || "pending";
        if (bookingStatus !== approvalFilter) {
          return false;
        }
      }

      // Check if current date falls within booking date range
      const bookingStartDate = new Date(booking.startDate || booking.date);
      const bookingEndDate = new Date(booking.endDate || booking.date);
      const currentDateObj = new Date(currentDate);

      // If current date is not within the booking date range, no match
      if (
        currentDateObj < bookingStartDate ||
        currentDateObj > bookingEndDate
      ) {
        return false;
      }

      // For hourly bookings, check time slots
      if (booking.bookingType === "hourly") {
        const bookingStartIndex = getTimeSlotIndex(booking.time);
        // Convert duration from hours to number of 15-minute slots
        const durationInSlots = Math.ceil(booking.duration * 4);
        const bookingEndIndex = bookingStartIndex + durationInSlots;
        const currentTimeIndex = getTimeSlotIndex(time);

        return (
          currentTimeIndex >= bookingStartIndex &&
          currentTimeIndex < bookingEndIndex
        );
      }

      // For full-day, multi-day, or weekly bookings, all time slots match
      return true;
    });
  };

  const canBookDuration = (roomId, startTime, duration) => {
    const startIndex = getTimeSlotIndex(startTime);

    // Convert duration (in hours) to number of 15-minute slots
    const durationInSlots = Math.ceil(duration * 4); // 4 slots per hour (15-minute intervals)
    const endIndex = startIndex + durationInSlots;

    // Check if booking would exceed available time slots
    if (endIndex > timeSlots.length) {
      return false;
    }

    // Check if any slot in the duration is already booked
    for (let i = startIndex; i < endIndex; i++) {
      if (isSlotBooked(roomId, timeSlots[i])) {
        return false;
      }
    }

    return true;
  };

  const canBookDateRange = (roomId, startDate, endDate, bookingType) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check each date in the range
    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];

      // Check if there are any existing bookings on this date for this room
      const hasConflict = bookings.some((booking) => {
        if (booking.roomId !== roomId) return false;

        // Check if booking overlaps with the date range
        const bookingStart = new Date(booking.startDate || booking.date);
        const bookingEnd = new Date(booking.endDate || booking.date);

        // Check for date overlap
        return date >= bookingStart && date <= bookingEnd;
      });

      if (hasConflict) {
        return false;
      }
    }

    return true;
  };

  const handleBooking = (room, time) => {
    // Check if the selected date is Sunday
    if (isWeekend(selectedDate)) {
      alert("Cannot book on Sunday. Please select Monday through Saturday.");
      return;
    }

    // Check if the time slot is in the past
    if (isTimeSlotInPast(selectedDate, time)) {
      alert("Cannot book past time slots. Please select a future time.");
      return;
    }

    setSelectedRoom(room);
    setSelectedTime(time);
    setShowBookingForm(true);
  };

  const confirmBooking = async (bookingData) => {
    // Enhanced validation for different booking types
    if (bookingData.bookingType === "hourly") {
      if (
        !canBookDuration(selectedRoom.id, selectedTime, bookingData.duration)
      ) {
        alert(
          "Cannot book for the selected duration. Some time slots are already booked or exceed available hours."
        );
        return;
      }
    } else {
      // Check for multi-day booking conflicts
      if (
        !canBookDateRange(
          selectedRoom.id,
          bookingData.startDate,
          bookingData.endDate,
          bookingData.bookingType
        )
      ) {
        alert(
          "Cannot book for the selected date range. Some dates are already booked."
        );
        return;
      }
    }

    try {
      // Automatically set times for full_day, weekly, and multi_day bookings
      let startTime = bookingData.startTime;
      let endTime = bookingData.endTime;

      if (bookingData.bookingType === "full_day" || bookingData.bookingType === "weekly" || bookingData.bookingType === "multi_day") {
        startTime = "08:00";
        endTime = "18:00";
      }

      // Map frontend data to backend API format
      const backendBookingData = {
        room: selectedRoom.id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate || bookingData.startDate,
        start_time: startTime,
        end_time: endTime,
        purpose: bookingData.title,
        expected_attendees: bookingData.attendeeCount || 1,
        special_requirements: bookingData.description || "",
        booking_type: bookingData.bookingType || "hourly",
        selected_dates: bookingData.selectedDates || [],
      };

      // Save to backend database
      const savedBooking = await apiService.createBooking(backendBookingData);

      // Transform backend response to frontend format for local state
      const newBooking = {
        id: savedBooking.id,
        roomId: savedBooking.room,
        // Keep legacy fields for backward compatibility
        date: savedBooking.start_date,
        time: savedBooking.start_time,
        duration: bookingData.duration || 0.5,
        // New fields for extended booking
        bookingType: bookingData.bookingType || "hourly",
        startDate: savedBooking.start_date,
        endDate: savedBooking.end_date,
        startTime: savedBooking.start_time,
        endTime: savedBooking.end_time,
        title: savedBooking.purpose,
        organizer: bookingData.organizer,
        description: savedBooking.special_requirements || "",
        attendeeCount: savedBooking.expected_attendees || 1,
        // Add approval status from backend
        approvalStatus: savedBooking.approval_status || "pending",
        approvedBy: savedBooking.approved_by,
        approvedAt: savedBooking.approved_at,
        // Add creator information
        userId: currentUser ? currentUser.id : null,
        userName: currentUser ? currentUser.name : bookingData.organizer,
        createdBy: currentUser ? currentUser.email : bookingData.organizer,
        createdByName: currentUser ? currentUser.name : bookingData.organizer,
      };

      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      saveBookingsToStorage(updatedBookings); // Save to localStorage for offline viewing

      // 📧 EMAIL NOTIFICATIONS - Send booking confirmation and admin notifications
      try {
        if (currentUser) {
          // 1. Send booking confirmation to the user
          await emailService.sendBookingConfirmation(
            newBooking,
            selectedRoom,
            currentUser
          );

          // 2. Send admin notifications for new booking
          const roomAdmins = emailService.getRoomAdmins(selectedRoom.id, users);
          if (roomAdmins.length > 0) {
            await emailService.sendAdminNotification(
              newBooking,
              selectedRoom,
              currentUser,
              roomAdmins
            );
          }

          // 3. Schedule 30-minute meeting reminder
          const reminderResult = emailService.scheduleReminder(
            newBooking,
            selectedRoom,
            currentUser
          );
          if (reminderResult.success) {
            console.log(
              `⏰ Meeting reminder scheduled for: ${reminderResult.reminderTime}`
            );
          }
        }
      } catch (error) {
        console.error("Email notification error:", error);
        // Don't block booking if email fails
      }

      alert("Booking created successfully!");
      setShowBookingForm(false);
      setSelectedRoom(null);
      setSelectedTime("");
    } catch (error) {
      console.error("Booking creation error:", error);
      alert(error.message || "Failed to create booking. Please try again.");
    }
  };

  // Check if user is authenticated via context
  useEffect(() => {
    if (user) {
      // Use the authenticated user from context
      setCurrentUser({
        id: user.id,
        name: user.first_name + " " + user.last_name,
        email: user.email,
        role: user.is_superuser
          ? "super_admin"
          : user.is_staff
          ? "room_admin"
          : "regular_user",
        managedRooms: [],
        createdAt: user.date_joined,
      });
      setIsAuthenticated(true);

      // Set admin status
      if (user.is_superuser || user.is_staff) {
        setIsAdmin(true);
      }
    }
  }, [user]);

  // Helper function to calculate booking percentage for a room on a given day
  const calculateBookingPercentage = (roomId, date) => {
    // Total working slots: 8 AM - 6 PM = 10 hours × 4 slots/hour = 40 slots
    // (The last slot 18:00 is the end boundary, not a bookable slot)
    const totalWorkingSlots = 40;
    const bookedSlots = new Set();

    // Get all bookings for this room on this date
    const dayBookings = bookings.filter((booking) => {
      if (booking.roomId !== roomId) return false;
      return isSameDay(new Date(booking.startDate), date);
    });

    // Calculate which time slots are booked
    dayBookings.forEach((booking) => {
      const startTime = booking.startTime;
      const endTime = booking.endTime;

      const startIndex = timeSlots.findIndex((slot) => slot === startTime);
      const endIndex = timeSlots.findIndex((slot) => slot === endTime);

      if (startIndex !== -1 && endIndex !== -1) {
        // Mark all slots from start to end as booked
        for (let i = startIndex; i < endIndex; i++) {
          bookedSlots.add(i);
        }
      }
    });

    const bookedCount = bookedSlots.size;
    const percentage = Math.round((bookedCount / totalWorkingSlots) * 100);

    return {
      percentage,
      bookedSlots: bookedCount,
      totalSlots: totalWorkingSlots,
      isFullyBooked: percentage >= 100,
      isPartiallyBooked: percentage > 0 && percentage < 100,
    };
  };

  // Helper function to get room status indicator
  const getRoomStatusIndicator = (room) => {
    const currentTime = new Date();
    const checkDate = new Date(selectedDate); // Use selected date instead of hardcoded today

    // Check if room is currently occupied (only for today)
    const isToday = checkDate.toDateString() === currentTime.toDateString();
    const hasCurrentBooking = isToday && bookings.some((booking) => {
      if (booking.roomId !== room.id) return false;

      const bookingStart = new Date(
        booking.startDate + " " + booking.startTime
      );
      const bookingEnd = new Date(booking.startDate + " " + booking.endTime);

      return currentTime >= bookingStart && currentTime <= bookingEnd;
    });

    if (hasCurrentBooking) {
      return (
        <span
          className="status-indicator status-occupied"
          title="Currently Occupied"
        >
          🔴 Occupied
        </span>
      );
    }

    // Calculate booking percentage for selected date
    const bookingStats = calculateBookingPercentage(room.id, checkDate);

    const dateLabel = isToday ? "today" : "on this date";

    if (bookingStats.isFullyBooked) {
      return (
        <span
          className="status-indicator status-fully-booked"
          title={`Fully Booked ${dateLabel}`}
        >
          🔴 Fully Booked
        </span>
      );
    }

    if (bookingStats.isPartiallyBooked) {
      return (
        <span
          className="status-indicator status-partial"
          title={`${bookingStats.percentage}% booked ${dateLabel} (${bookingStats.bookedSlots}/${bookingStats.totalSlots} slots)`}
        >
          🟡 Partially Booked ({bookingStats.percentage}%)
        </span>
      );
    }

    return (
      <span className="status-indicator status-available" title={`Available ${dateLabel}`}>
        🟢 Available
      </span>
    );
  };

  // Memoized calculations for better performance
  const availableRoomsCount = useMemo(() => {
    const currentTime = new Date();
    return rooms.filter((room) => {
      const hasCurrentBooking = bookings.some((booking) => {
        if (booking.roomId !== room.id) return false;

        const bookingStart = new Date(
          booking.startDate + " " + booking.startTime
        );
        const bookingEnd = new Date(booking.startDate + " " + booking.endTime);

        return currentTime >= bookingStart && currentTime <= bookingEnd;
      });

      return !hasCurrentBooking;
    }).length;
  }, [rooms, bookings]);

  const todayBookingsCount = useMemo(() => {
    // Count bookings for the selected date, not just literal "today"
    const selectedDateStr = formatDate(selectedDate);
    return bookings.filter((b) => b.startDate === selectedDateStr).length;
  }, [bookings, selectedDate]);

  const filteredRooms = useMemo(() => {
    return getFilteredRooms();
  }, [
    rooms,
    selectedRoomId,
    currentUser,
    selectedMeetingSpace,
    selectedMeetingSpaces,
  ]);

  const groupedRooms = useMemo(() => {
    return getGroupedRooms(filteredRooms);
  }, [filteredRooms]);

  const availableTimeSlots = useMemo(() => {
    return getAvailableTimeSlots(selectedDate);
  }, [selectedDate, bookings]);

  // Memoized event handlers for better performance
  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
  }, []);

  const handleTimeSlotClick = useCallback(
    (room, time) => {
      if (isTimeSlotInPast(selectedDate, time) || isWeekend(selectedDate)) {
        return;
      }

      const isBooked = isSlotBooked(room.id, time);
      if (isBooked && !canManageBooking(getBookingDetails(room.id, time))) {
        return;
      }

      setSelectedRoom(room);
      setSelectedTime(time);
      setShowBookingForm(true);
    },
    [selectedDate]
  );

  const handleBookingFormClose = useCallback(() => {
    setShowBookingForm(false);
    setSelectedRoom(null);
    setSelectedTime("");
  }, []);

  const openRoomModal = useCallback((room) => {
    console.log("Opening room modal for:", room.name);
    setSelectedRoomForModal(room);
  }, []);

  const closeRoomModal = useCallback(() => {
    console.log("Closing room modal");
    setSelectedRoomForModal(null);
  }, []);

  return (
    <div className="booking-container">
      <div className="booking-wrapper">
        {/* Enhanced Header */}
        <div className="booking-header">
          <div className="header-title-row">
            <div className="logo-section">
              <img
                src="/ICPAC_Website_Header_Logo.svg"
                alt="ICPAC Logo"
                className="icpac-logo"
              />
            </div>
            <div className="title-section">
              <h1 className="booking-title">ICPAC INTERNAL BOOKING SYSTEM</h1>
              <p className="booking-subtitle">
                Reserve your meeting space with ease - Book conference rooms,
                manage schedules, and collaborate seamlessly across ICPAC
                facilities
              </p>
            </div>
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-number">{rooms.length}</span>
                <span className="stat-label">Rooms</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{todayBookingsCount}</span>
                <span className="stat-label">Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{availableRoomsCount}</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading booking data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button className="error-dismiss" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}

        {/* Date Selector */}
        <div className="date-section">
          <div
            className="date-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              className="admin-controls"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
              }}
            >
              {currentUser ? (
                <>
                  {/* Approval Filter for Admins */}
                  {canApproveBooking({ roomId: 1 }) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "14px",
                          color: "#ffffff",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Filter:
                      </label>
                      <select
                        value={approvalFilter}
                        onChange={(e) => setApprovalFilter(e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "6px",
                          background: "rgba(255, 255, 255, 0.9)",
                          fontSize: "12px",
                          color: "#374151",
                          cursor: "pointer",
                          minWidth: "120px",
                        }}
                      >
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#ffffff",
                      fontWeight: "700",
                    }}
                  >
                    {currentUser.name}
                    {(currentUser.role === "room_admin" ||
                      currentUser.role === "procurement_officer") && (
                      <span
                        className={`role-badge role-${currentUser.role}`}
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "#e5e7eb",
                          color: "#4b5563",
                        }}
                      >
                        {currentUser.role === "room_admin"
                          ? "Room Admin"
                          : "Procurement Officer"}
                      </span>
                    )}
                  </span>

                  {currentUser.role === "super_admin" && (
                    <button
                      onClick={() => setShowUserManagement(true)}
                      title="Manage Users"
                      style={{
                        padding: "8px 12px",
                        background: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      👥 Users
                    </button>
                  )}

                  {currentUser.role === "procurement_officer" && (
                    <button
                      onClick={() => setShowProcurementDashboard(true)}
                      title="View Procurement Dashboard"
                      style={{
                        padding: "8px 12px",
                        background: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      📋 Procurement
                    </button>
                  )}

                  <button
                    onClick={() => setShowEmailSettings(true)}
                    title="Email Notification Settings"
                    style={{
                      padding: "8px",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      height: "32px",
                      width: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    📧
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    title={`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
                    style={{
                      padding: "8px",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      height: "32px",
                      width: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isDarkMode ? "🌙" : "☀️"}
                  </button>

                  <button
                    onClick={handleUserLogout}
                    title="Logout"
                    style={{
                      padding: "8px 16px",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#374151",
                      cursor: "pointer",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#e5e7eb";
                      e.target.style.borderColor = "#9ca3af";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#f3f4f6";
                      e.target.style.borderColor = "#d1d5db";
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* 12-Column Grid Layout: Date Picker | Meeting Spaces | Time Slots */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: "16px",
              alignItems: "stretch",
              marginTop: "16px",
            }}
            className="booking-grid-container"
          >
            {/* Date Picker - 3/12 columns on desktop, full width on mobile */}
            <div
              style={{
                gridColumn: "span 3",
                background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                padding: "16px",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                height: "280px",
                display: "flex",
                flexDirection: "column",
              }}
              className="date-picker-card"
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#475569",
                  fontSize: "14px",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                📅 Select Date
              </h4>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  Choose any date:
                </label>
                <input
                  type="date"
                  value={formatDate(selectedDate)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  style={{
                    width: "calc(100% - 4px)",
                    padding: "8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    background: "#ffffff",
                    color: "#374151",
                    boxSizing: "border-box",
                    margin: "0 2px",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "700",
                    marginBottom: "6px",
                  }}
                >
                  Selected Date:
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    fontWeight: "800",
                  }}
                >
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Current Week Strip */}
              <div
                style={{
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "700",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  Current Week
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                  }}
                  className="week-strip"
                >
                  {getWeekDays(selectedDate).map((day, index) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDay = isToday(day);
                    const isDisabled = isWeekend(day);
                    const isPastDay = day < new Date().setHours(0, 0, 0, 0);

                    return (
                      <button
                        key={index}
                        onClick={() => !isDisabled && setSelectedDate(day)}
                        disabled={isDisabled}
                        aria-label={`Select ${day.toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`}
                        style={{
                          padding: "6px 2px",
                          border: isSelected
                            ? "2px solid #f97316"
                            : isTodayDay
                            ? "2px solid #fb923c"
                            : "1px solid #fdba74",
                          borderRadius: "6px",
                          background: isSelected
                            ? "linear-gradient(135deg, #fed7aa, #fdba74)"
                            : isTodayDay
                            ? "linear-gradient(135deg, #ffedd5, #fed7aa)"
                            : isDisabled
                            ? "#f3f4f6"
                            : "linear-gradient(135deg, #fff7ed, #ffedd5)",
                          color: isSelected
                            ? "#000000"
                            : isTodayDay
                            ? "#c2410c"
                            : isDisabled
                            ? "#9ca3af"
                            : "#c2410c",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          fontSize: "10px",
                          fontWeight: isSelected ? "700" : "600",
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          opacity: isPastDay && !isTodayDay ? 0.6 : 1,
                          boxShadow: isSelected
                            ? "0 2px 8px rgba(249, 115, 22, 0.3)"
                            : isTodayDay
                            ? "0 1px 4px rgba(251, 146, 60, 0.2)"
                            : "0 1px 3px rgba(249, 115, 22, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.background =
                              "linear-gradient(135deg, #fed7aa, #fdba74)";
                            e.target.style.borderColor = "#f97316";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 3px 8px rgba(249, 115, 22, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.background = isTodayDay
                              ? "linear-gradient(135deg, #ffedd5, #fed7aa)"
                              : "linear-gradient(135deg, #fff7ed, #ffedd5)";
                            e.target.style.borderColor = isTodayDay
                              ? "#fb923c"
                              : "#fdba74";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = isTodayDay
                              ? "0 1px 4px rgba(251, 146, 60, 0.2)"
                              : "0 1px 3px rgba(249, 115, 22, 0.1)";
                          }
                        }}
                      >
                        <div style={{ lineHeight: "1.1" }}>
                          <div style={{ fontSize: "9px", marginBottom: "1px" }}>
                            {getDayAbbrev(day)}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "600" }}>
                            {day.getDate()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Meeting Spaces - 5/12 columns on desktop, full width on mobile */}
            <div
              style={{
                gridColumn: "span 5",
                background: "linear-gradient(135deg, #f0fdf4, #e6fffa)",
                padding: "16px",
                border: "1px solid #10b981",
                borderRadius: "12px",
                minHeight: "280px",
                display: "flex",
                flexDirection: "column",
              }}
              className="meeting-spaces-card"
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#034930",
                  fontSize: "14px",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                🏢 Select Meeting Spaces
              </h4>
              {selectedMeetingSpaces.length > 0 ? (
                // Show selected meeting space with amenities
                <div
                  style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    borderRadius: "12px",
                    border: "2px solid #065f46",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "#ffffff",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        marginBottom: "4px",
                      }}
                    >
                      ✓ Selected Space
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {
                        rooms.find((r) => r.id === selectedMeetingSpaces[0])
                          ?.name
                      }
                    </div>
                  </div>

                  {/* Room Amenities Section */}
                  {(() => {
                    const selectedRoom = rooms.find(
                      (r) => r.id === selectedMeetingSpaces[0]
                    );
                    if (
                      selectedRoom &&
                      selectedRoom.amenities &&
                      selectedRoom.amenities.length > 0
                    ) {
                      return (
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.15)",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#ffffff",
                              marginBottom: "8px",
                              textAlign: "center",
                            }}
                          >
                            🏢 Room Amenities
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              justifyContent: "center",
                            }}
                          >
                            {selectedRoom.amenities
                              .slice(0, 4)
                              .map((amenity) => (
                                <span
                                  key={amenity}
                                  style={{
                                    background: "rgba(255, 255, 255, 0.2)",
                                    color: "#ffffff",
                                    padding: "4px 8px",
                                    borderRadius: "12px",
                                    fontSize: "10px",
                                    fontWeight: "500",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.3)",
                                  }}
                                >
                                  {getAmenityIcon(amenity)} {amenity}
                                </span>
                              ))}
                            {selectedRoom.amenities.length > 4 && (
                              <span
                                style={{
                                  background: "rgba(255, 255, 255, 0.2)",
                                  color: "#ffffff",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  fontSize: "10px",
                                  fontWeight: "500",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                }}
                              >
                                +{selectedRoom.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedMeetingSpaces([])}
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "6px",
                        color: "#ffffff",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                      }}
                    >
                      Change Selection
                    </button>
                  </div>
                </div>
              ) : (
                // Show all meeting spaces for selection
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    alignItems: "start",
                    flex: "1",
                    overflowY: "auto",
                  }}
                  className="meeting-spaces-grid"
                >
                  {rooms.map((room) => (
                    <label
                      key={room.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        padding: "8px",
                        background: selectedMeetingSpaces.includes(room.id)
                          ? "linear-gradient(135deg, #059669, #047857)"
                          : "#ffffff",
                        border: selectedMeetingSpaces.includes(room.id)
                          ? "2px solid #065f46"
                          : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "11px",
                        color: selectedMeetingSpaces.includes(room.id)
                          ? "#ffffff"
                          : "#374151",
                        fontWeight: selectedMeetingSpaces.includes(room.id)
                          ? "700"
                          : "500",
                        boxShadow: selectedMeetingSpaces.includes(room.id)
                          ? "0 2px 4px rgba(5, 150, 105, 0.3)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedMeetingSpaces.includes(room.id)) {
                          e.target.style.background = "#f3f4f6";
                          e.target.style.transform = "translateY(-1px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedMeetingSpaces.includes(room.id)) {
                          e.target.style.background = "#ffffff";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMeetingSpaces.includes(room.id)}
                        onChange={(e) =>
                          handleMeetingSpaceChange(room.id, e.target.checked)
                        }
                        style={{
                          marginRight: "6px",
                          marginTop: "2px",
                          accentColor: "#10b981",
                          transform: "scale(1.1)",
                        }}
                      />
                      <div style={{ lineHeight: "1.3", flex: 1 }}>
                        <div
                          style={{
                            fontWeight: selectedMeetingSpaces.includes(room.id)
                              ? "700"
                              : "600",
                            marginBottom: "2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: selectedMeetingSpaces.includes(room.id)
                              ? "#ffffff"
                              : "#374151",
                          }}
                        >
                          {selectedMeetingSpaces.includes(room.id) && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#ffffff",
                                fontWeight: "700",
                              }}
                            >
                              ✓
                            </span>
                          )}
                          {room.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: selectedMeetingSpaces.includes(room.id)
                              ? "#f0fdf4"
                              : "#6b7280",
                            fontWeight: selectedMeetingSpaces.includes(room.id)
                              ? "600"
                              : "400",
                          }}
                        >
                          Capacity: {room.capacity}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Type Selector - 4/12 columns on desktop, full width on mobile */}
            {selectedMeetingSpaces.length > 0 && (
              <div
                style={{
                  gridColumn: "span 4",
                  background: "linear-gradient(135deg, #e0e7ff, #f0f4ff)",
                  padding: "16px",
                  border: "1px solid #6366f1",
                  borderRadius: "12px",
                  minHeight: "280px",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="booking-type-card"
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#4338ca",
                    fontSize: "14px",
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                >
                  📝 Select Booking Type
                </h4>
                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                    flex: "1",
                  }}
                >
                  {[
                    {
                      value: "hourly",
                      label: "⏰ Hourly Booking",
                      desc: "Book for specific hours",
                    },
                    {
                      value: "full_day",
                      label: "📅 Full Day",
                      desc: "8 AM - 6 PM (entire day)",
                    },
                    {
                      value: "multi_day",
                      label: "📊 Multi-Day",
                      desc: "Select 2-6 days",
                    },
                    {
                      value: "weekly",
                      label: "🗓️ Weekly",
                      desc: "7 consecutive days",
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setSelectedBookingType(type.value);
                        if (selectedMeetingSpaces.length === 1) {
                          const room = rooms.find(
                            (r) => r.id === selectedMeetingSpaces[0]
                          );
                          // For hourly booking, open room details modal first
                          if (type.value === "hourly") {
                            setSelectedRoomForModal(room);
                            setSelectedRoom(room);
                          } else {
                            // For other booking types, open booking form directly
                            setSelectedRoom(room);
                            setSelectedTime(""); // No pre-selected time
                            setShowBookingForm(true);
                          }
                        }
                      }}
                      style={{
                        padding: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        border:
                          selectedBookingType === type.value
                            ? "2px solid #4338ca"
                            : "2px solid #e5e7eb",
                        borderRadius: "8px",
                        background:
                          selectedBookingType === type.value
                            ? "#e0e7ff"
                            : "#ffffff",
                        color:
                          selectedBookingType === type.value
                            ? "#4338ca"
                            : "#374151",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedBookingType !== type.value) {
                          e.target.style.background = "#f8fafc";
                          e.target.style.borderColor = "#cbd5e1";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedBookingType !== type.value) {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#e5e7eb";
                        }
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        {type.label}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color:
                            selectedBookingType === type.value
                              ? "#6366f1"
                              : "#6b7280",
                          fontWeight: "400",
                        }}
                      >
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Grid */}
        <div className="booking-grid">
          <div className="grid-header">
            <h2>
              Room Availability -{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>

          {shouldShowBookingInterface(selectedDate) ? (
            <div className="rooms-container">
              {filteredRooms.length === 0 ? (
                <div className="no-rooms-message">
                  <div className="no-rooms-content">
                    <h3>No Rooms Available</h3>
                    <p>
                      {currentUser
                        ? `You don't have access to any rooms. Please contact your administrator.`
                        : "Please log in to view available rooms."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const categoryInfo = getCategoryInfo(room.category);
                  return (
                    <div key={room.id} className="room-card">
                      <div
                        className="room-card-header"
                        onClick={() => openRoomModal(room)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="room-card-title">
                          <span className="room-category-icon">
                            {categoryInfo.icon}
                          </span>
                          <h3 className="room-card-name">{room.name}</h3>
                        </div>
                        <div className="room-status-badge">
                          {getRoomStatusIndicator(room)}
                        </div>
                        <div className="expand-icon">▶</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="day-closed-message">
              <div className="day-closed-content">
                {(() => {
                  const now = new Date();
                  const selectedDateObj = new Date(selectedDate);
                  const today = new Date(now);
                  today.setHours(0, 0, 0, 0);
                  const selectedDay = new Date(selectedDateObj);
                  selectedDay.setHours(0, 0, 0, 0);

                  if (selectedDay < today) {
                    // Past date
                    return (
                      <>
                        <h3>Day Complete</h3>
                        <p>
                          This date has passed. Bookings are no longer
                          available.
                        </p>
                        <p>
                          Please select today or a future date to make new
                          bookings.
                        </p>
                      </>
                    );
                  } else {
                    // Today after hours
                    return (
                      <>
                        <h3>Day Complete</h3>
                        <p>
                          Booking for today is no longer available (after 6:00
                          PM).
                        </p>
                        <p>Please select a future date to make new bookings.</p>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <BookingForm
            room={selectedRoom}
            time={selectedTime}
            date={selectedDate}
            currentUser={currentUser}
            initialBookingType={selectedBookingType}
            onConfirm={confirmBooking}
            onCancel={() => setShowBookingForm(false)}
          />
        )}

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <AdminLoginModal
            onLogin={handleAdminLogin}
            onCancel={() => setShowAdminLogin(false)}
          />
        )}

        {/* Edit Booking Modal */}
        {showEditForm && editingBooking && (
          <EditBookingForm
            booking={editingBooking}
            rooms={filteredRooms}
            currentUser={currentUser}
            onUpdate={updateBooking}
            onCancel={() => {
              setShowEditForm(false);
              setEditingBooking(null);
            }}
          />
        )}

        {/* Room Details Modal */}
        {selectedRoomForModal && (
          <div className="modal-overlay" onClick={closeRoomModal}>
            <div className="room-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedRoomForModal.name}</h2>
                <button className="modal-close" onClick={closeRoomModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Room Info */}
                <div className="modal-room-info">
                  <div className="room-info-chips">
                    <div className="info-chip capacity-chip">
                      <span className="chip-label">Capacity</span>
                      <span className="chip-value">
                        {selectedRoomForModal.capacity}
                      </span>
                    </div>
                    {selectedRoomForModal.amenities &&
                      selectedRoomForModal.amenities.length > 0 && (
                        <div className="info-chip amenities-chip">
                          <span className="chip-label">Amenities</span>
                          <span className="chip-value">
                            {selectedRoomForModal.amenities.join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Day Overview Section */}
                <div className="day-overview-section">
                  <div className="day-overview-header">
                    <h4>Day Overview</h4>
                    <span className="overview-date">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="time-slots-overview">
                    {availableTimeSlots.map((time) => {
                      const isBooked = isSlotBooked(
                        selectedRoomForModal.id,
                        time
                      );
                      const booking = getBookingDetails(
                        selectedRoomForModal.id,
                        time
                      );
                      const isPast = isTimeSlotInPast(selectedDate, time);
                      const isWeekendDay = isWeekend(selectedDate);

                      let status = "available";
                      let statusText = "Available";
                      let statusColor = "#10b981";

                      if (isWeekendDay) {
                        status = "weekend";
                        statusText = "Weekend";
                        statusColor = "#f59e0b";
                      } else if (isPast) {
                        status = "past";
                        statusText = "Past";
                        statusColor = "#6b7280";
                      } else if (isBooked) {
                        status = "booked";
                        statusText = booking.title || "Booked";
                        statusColor = "#ef4444";
                      }

                      return (
                        <div
                          key={time}
                          className={`overview-slot ${status}`}
                          title={`${time}: ${statusText}`}
                          onClick={() => {
                            // Auto-select this time in the picker below
                            const timeSelect =
                              document.getElementById(`modal-time-select`);
                            if (timeSelect) {
                              timeSelect.value = time;
                              timeSelect.dispatchEvent(new Event("change"));
                            }
                          }}
                        >
                          <span className="slot-time">{time}</span>
                          <div
                            className="slot-indicator"
                            style={{ backgroundColor: statusColor }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="overview-legend">
                    <div className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: "#10b981" }}
                      ></div>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: "#ef4444" }}
                      ></div>
                      <span>Booked</span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: "#6b7280" }}
                      ></div>
                      <span>Past</span>
                    </div>
                    <div className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: "#f59e0b" }}
                      ></div>
                      <span>Weekend</span>
                    </div>
                  </div>
                </div>

                {/* Time Picker Section */}
                <div className="time-picker-section">
                  <div className="time-picker-header">
                    <h4>Select Time Slot</h4>
                    <span className="time-range-info">9:00 AM - 6:00 PM</span>
                  </div>

                  <div className="time-picker-controls">
                    <div className="time-input-group">
                      <label htmlFor="modal-time-select">Choose Time:</label>
                      <select
                        id="modal-time-select"
                        className="time-select"
                        onChange={(e) => {
                          const selectedTime = e.target.value;
                          if (selectedTime) {
                            const isBooked = isSlotBooked(
                              selectedRoomForModal.id,
                              selectedTime
                            );
                            const booking = getBookingDetails(
                              selectedRoomForModal.id,
                              selectedTime
                            );
                            const isPast = isTimeSlotInPast(
                              selectedDate,
                              selectedTime
                            );
                            const isWeekendDay = isWeekend(selectedDate);

                            // Update the availability display
                            const availabilityElement =
                              document.getElementById("modal-availability");
                            if (availabilityElement) {
                              if (isWeekendDay) {
                                availabilityElement.innerHTML = `
                                  <div class="availability-status weekend">
                                    <span class="status-icon">🚫</span>
                                    <span class="status-text">Weekend - Not Available</span>
                                  </div>
                                `;
                              } else if (isPast) {
                                availabilityElement.innerHTML = `
                                  <div class="availability-status past">
                                    <span class="status-icon">⏰</span>
                                    <span class="status-text">Past Time Slot</span>
                                  </div>
                                `;
                              } else if (isBooked) {
                                availabilityElement.innerHTML = `
                                  <div class="availability-status booked">
                                    <span class="status-icon">❌</span>
                                    <span class="status-text">Booked: ${booking.title}</span>
                                  </div>
                                `;
                              } else {
                                availabilityElement.innerHTML = `
                                  <div class="availability-status available">
                                    <span class="status-icon">✅</span>
                                    <span class="status-text">Available for Booking</span>
                                  </div>
                                `;
                              }
                            }
                          }
                        }}
                      >
                        <option value="">Select a time slot...</option>
                        {availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      id="modal-availability"
                      className="availability-display"
                    >
                      <div className="availability-status placeholder">
                        <span className="status-icon">ℹ️</span>
                        <span className="status-text">
                          Select a time to check availability
                        </span>
                      </div>
                    </div>

                    <div className="booking-action">
                      <button
                        className="book-now-btn"
                        onClick={() => {
                          const timeSelect =
                            document.getElementById("modal-time-select");
                          const selectedTime = timeSelect.value;
                          if (
                            selectedTime &&
                            !isSlotBooked(
                              selectedRoomForModal.id,
                              selectedTime
                            ) &&
                            !isTimeSlotInPast(selectedDate, selectedTime) &&
                            !isWeekend(selectedDate)
                          ) {
                            handleBooking(selectedRoomForModal, selectedTime);
                            closeRoomModal();
                          } else {
                            alert("Please select a valid available time slot");
                          }
                        }}
                      >
                        Book This Time Slot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Modal */}
        {showUserManagement && (
          <UserManagementModal
            users={users}
            rooms={rooms}
            onUpdateUsers={setUsers}
            onCancel={() => setShowUserManagement(false)}
          />
        )}

        {showProcurementDashboard && (
          <ProcurementDashboard
            bookings={bookings}
            rooms={rooms}
            onClose={() => setShowProcurementDashboard(false)}
          />
        )}

        {showEmailSettings && (
          <EmailSettingsPanel
            user={currentUser}
            onSettingsUpdate={(settings) => {
              console.log("Email settings updated:", settings);
              // You can add additional logic here to handle settings changes
            }}
            onClose={() => setShowEmailSettings(false)}
          />
        )}

        {/* Footer */}
        <footer className="booking-footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img
                  src="/ICPAC_Website_Header_Logo.svg"
                  alt="ICPAC Logo"
                  className="footer-logo-img"
                />
                <div className="footer-text">
                  <h3>ICPAC Boardroom System</h3>
                  <p>Streamlining meeting room reservations</p>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.reload();
                    }}
                  >
                    Refresh
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUserLogout();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="contact-info">
                <p>
                  <strong>ICPAC</strong>
                </p>
                <p>Climate Prediction and Applications Centre</p>
                <p>Email: info@icpac.net</p>
                <p>Phone: +254 20 7095000</p>
              </div>
            </div>

            <div className="footer-section">
              <h4>System Stats</h4>
              <div className="system-stats">
                <p>Total Rooms: {rooms.length}</p>
                <p>Active Bookings: {bookings.length}</p>
                <p>Registered Users: {users.length}</p>
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2025 ICPAC. All rights reserved. | Boardroom Booking System
              v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const ProcurementOrdersSection = ({
  orders,
  attendeeCount,
  onOrdersChange,
}) => {
  const procurementItems = [
    { id: "coffee_tea", name: "Coffee & Tea", unit: "cup" },
    { id: "lunch", name: "Lunch", unit: "plate" },
    { id: "snacks", name: "Snacks", unit: "portion" },
    { id: "water", name: "Bottled Water", unit: "bottle" },
    { id: "juice", name: "Fresh Juice", unit: "glass" },
  ];

  const handleItemToggle = (itemId) => {
    const existingOrder = orders.find((order) => order.itemId === itemId);

    if (existingOrder) {
      onOrdersChange(orders.filter((order) => order.itemId !== itemId));
    } else {
      const item = procurementItems.find((item) => item.id === itemId);
      const newOrder = {
        itemId: itemId,
        itemName: item.name,
        quantity: attendeeCount,
        unit: item.unit,
        notes: "",
      };
      onOrdersChange([...orders, newOrder]);
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    const updatedOrders = orders.map((order) =>
      order.itemId === itemId
        ? { ...order, quantity: parseInt(quantity) || 0 }
        : order
    );
    onOrdersChange(updatedOrders);
  };

  const handleNotesChange = (itemId, notes) => {
    const updatedOrders = orders.map((order) =>
      order.itemId === itemId ? { ...order, notes } : order
    );
    onOrdersChange(updatedOrders);
  };

  return (
    <div className="procurement-orders">
      <div className="procurement-grid">
        {procurementItems.map((item) => {
          const isSelected = orders.some((order) => order.itemId === item.id);
          const selectedOrder = orders.find(
            (order) => order.itemId === item.id
          );

          return (
            <div
              key={item.id}
              className={`procurement-item ${isSelected ? "selected" : ""}`}
            >
              <div className="procurement-item-header">
                <label className="procurement-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleItemToggle(item.id)}
                  />
                  <span className="procurement-item-name">{item.name}</span>
                </label>
              </div>

              {isSelected && (
                <div className="procurement-item-details">
                  <div className="procurement-quantity">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedOrder?.quantity || attendeeCount}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      className="quantity-input"
                    />
                    <span className="quantity-unit">{item.unit}(s)</span>
                  </div>

                  <div className="procurement-notes">
                    <label>Special Instructions:</label>
                    <textarea
                      value={selectedOrder?.notes || ""}
                      onChange={(e) =>
                        handleNotesChange(item.id, e.target.value)
                      }
                      placeholder="Any special requirements or notes..."
                      className="notes-textarea"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orders.length > 0 && (
        <div className="procurement-summary">
          <h4>Procurement Summary</h4>
          <div className="procurement-summary-items">
            {orders.map((order) => (
              <div key={order.itemId} className="summary-item">
                <span>{order.itemName}</span>
                <span>
                  {order.quantity} {order.unit}(s)
                </span>
              </div>
            ))}
          </div>
          <div className="procurement-note">
            <small>
              Note: Procurement officer will be notified of these orders for
              preparation.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingForm = ({
  room,
  time,
  date,
  currentUser,
  initialBookingType = "hourly",
  onConfirm,
  onCancel,
}) => {
  // Generate time slots with 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:15`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
        slots.push(`${hour.toString().padStart(2, "0")}:45`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get current time for today, or use selected time slot
  const getCurrentTimeSlot = () => {
    if (time) return time; // Always use time from clicked slot when available

    const now = new Date();
    const selectedDate = new Date(date);

    // Only use current time logic if booking for today
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (!isToday) {
      // For future dates, user must click on a specific time slot
      return timeSlots[0]; // Fallback only
    }

    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // If it's past the minute mark, go to next hour
    const targetHour = currentMinutes > 0 ? currentHour + 1 : currentHour;

    // Format as HH:00 and find closest available slot
    const timeString = `${targetHour.toString().padStart(2, "0")}:00`;

    // Find the closest available time slot for today
    const availableSlot = timeSlots.find((slot) => slot >= timeString);
    return availableSlot || timeSlots[0];
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration) => {
    const startIndex = timeSlots.findIndex((slot) => slot === startTime);
    if (startIndex === -1) return timeSlots[1];

    // Convert duration from hours to number of 15-minute slots
    const durationInSlots = Math.ceil(duration * 4);
    const endIndex = Math.min(
      startIndex + durationInSlots,
      timeSlots.length - 1
    );
    return timeSlots[endIndex];
  };

  // Get ISO week number (1-52/53)
  const getWeekNumber = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return weekNumber;
  };

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get start date of a week number in a given year
  const getWeekStartDate = (year, weekNumber) => {
    const jan4 = new Date(year, 0, 4);
    const dayOffset = (jan4.getDay() || 7) - 1;
    const weekStartOffset = (weekNumber - 1) * 7 - dayOffset;
    const weekStart = new Date(year, 0, 4 + weekStartOffset);
    return weekStart;
  };

  // Get current year
  const currentYear = new Date().getFullYear();

  const initialStartTime = getCurrentTimeSlot();

  const [formData, setFormData] = useState({
    title: "",
    organizer: currentUser ? currentUser.name : "",
    bookingType: initialBookingType,
    duration: 0.5,
    startDate: date.toISOString().split("T")[0],
    endDate: date.toISOString().split("T")[0],
    startTime: initialStartTime,
    endTime: calculateEndTime(initialStartTime, 0.5),
    description: "",
    attendeeCount: 1,
    selectedDates: [], // For multi-day individual date selection
    weekNumber: getWeekNumber(date), // For weekly booking week number
    weekYear: currentYear, // Year for week number
    useWeekNumber: false, // Toggle between date picker and week number
  });

  const isTimeSlotInPast = (date, time) => {
    const now = new Date();
    const slotDate = new Date(date);

    // If the date is in the future, it's not in the past
    if (slotDate.toDateString() !== now.toDateString()) {
      return slotDate < now;
    }

    // If it's today, check if the time has passed
    const [hours, minutes] = time.split(":").map(Number);
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return slotDateTime < now;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate past time for hourly bookings on today's date
    if (formData.bookingType === "hourly") {
      if (isTimeSlotInPast(new Date(formData.startDate), formData.startTime)) {
        alert("Cannot book past time slots. Please select a future time.");
        return;
      }
    }

    onConfirm(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-adjust end date based on booking type
      if (name === "bookingType") {
        const startDate = new Date(prev.startDate);
        switch (value) {
          case "full_day":
            newData.endDate = prev.startDate;
            newData.startTime = "08:00";
            newData.endTime = "18:00";
            break;
          case "weekly":
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            newData.endDate = endDate.toISOString().split("T")[0];
            newData.startTime = "08:00";
            newData.endTime = "18:00";
            break;
          case "multi_day":
            const multiEndDate = new Date(startDate);
            multiEndDate.setDate(startDate.getDate() + 1);
            newData.endDate = multiEndDate.toISOString().split("T")[0];
            newData.startTime = "08:00";
            newData.endTime = "18:00";
            break;
          default: // hourly
            newData.endDate = prev.startDate;
            break;
        }
      }

      // Recalculate end time when duration changes
      if (name === "duration") {
        const duration = parseInt(value);
        newData.duration = duration; // Ensure duration is stored as integer
        newData.endTime = calculateEndTime(prev.startTime, duration);
      }

      // Recalculate end time when start time changes
      if (name === "startTime") {
        newData.endTime = calculateEndTime(value, parseInt(prev.duration));
      }

      // Auto-adjust end date for weekly booking when start date changes
      if (name === "startDate" && prev.bookingType === "weekly") {
        const weekStartDate = new Date(value);
        weekStartDate.setDate(weekStartDate.getDate() + 6);
        newData.endDate = weekStartDate.toISOString().split("T")[0];
      }

      // Ensure end date is not before start date (except for weekly which auto-calculates)
      if (name === "endDate" && prev.bookingType !== "weekly" && new Date(value) < new Date(prev.startDate)) {
        newData.endDate = prev.startDate;
      }

      return newData;
    });
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-container">
        <button onClick={onCancel} className="booking-modal-close">
          ×
        </button>

        <div className="booking-modal-header">
          <div className="booking-header-icon">
            <span className="header-icon-bg">📅</span>
          </div>
          <div className="booking-header-content">
            <h3 className="booking-modal-title">Book Meeting Room</h3>
            <p className="booking-modal-subtitle">
              Reserve your perfect meeting space
            </p>
          </div>
        </div>

        <div className="booking-room-card">
          <div className="room-card-header">
            <div className="room-icon">🏢</div>
            <div className="room-details">
              <h4 className="room-name">{room.name}</h4>
              <div className="room-meta">
                <span className="capacity-badge">
                  <span className="capacity-icon">👥</span>
                  {room.capacity} people
                </span>
                <span className="booking-preview">
                  {formData.bookingType === "hourly"
                    ? `${new Date(formData.startDate).toLocaleDateString()} • ${
                        formData.startTime
                      } - ${formData.endTime}`
                    : `${new Date(
                        formData.startDate
                      ).toLocaleDateString()} to ${new Date(
                        formData.endDate
                      ).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>

          <div className="room-amenities">
            {room.amenities.map((amenity) => (
              <span key={amenity} className="amenity-chip">
                <span className="amenity-chip-icon">
                  {getAmenityIcon(amenity)}
                </span>
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-booking-form">
          <div className="booking-form-content">
            <div className="booking-form-grid">
              <div className="form-field-group">
                <div className="input-field">
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="modern-input"
                    id="meeting-title"
                  />
                  <label htmlFor="meeting-title" className="input-label">
                    <span className="label-icon">📋</span>
                    Meeting Title *
                  </label>
                </div>
              </div>

              <div className="form-field-group">
                <div className="input-field">
                  <input
                    type="text"
                    name="organizer"
                    required
                    value={formData.organizer}
                    onChange={handleChange}
                    className="modern-input"
                    id="organizer-name"
                  />
                  <label htmlFor="organizer-name" className="input-label">
                    <span className="label-icon">👤</span>
                    Organizer *
                  </label>
                </div>
              </div>

              <div className="form-field-group">
                <div className="select-field">
                  <select
                    name="bookingType"
                    value={formData.bookingType}
                    onChange={handleChange}
                    className="modern-select"
                    id="booking-type"
                  >
                    <option value="hourly">⏰ Hourly Booking</option>
                    <option value="full_day">
                      🌅 Full Day (8:00 AM - 6:00 PM)
                    </option>
                    <option value="multi_day">📅 Multi-Day Booking</option>
                    <option value="weekly">📆 Weekly Booking (7 days)</option>
                  </select>
                  <label htmlFor="booking-type" className="select-label">
                    <span className="label-icon">🕒</span>
                    Booking Type *
                  </label>
                  <div className="select-arrow">▼</div>
                </div>
              </div>

              {formData.bookingType === "hourly" && (
                <div className="form-field-group">
                  <div className="select-field">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="modern-select"
                      id="duration"
                    >
                      <option value={0.25}>⏱️ 15 minutes</option>
                      <option value={0.33}>⏱️ 20 minutes</option>
                      <option value={0.5}>⏱️ 30 minutes</option>
                      <option value={0.75}>⏱️ 45 minutes</option>
                      <option value={1}>⏱️ 1 hour</option>
                      <option value={1.25}>⏱️ 1 hour 15 minutes</option>
                      <option value={1.5}>⏱️ 1 hour 30 minutes</option>
                      <option value={2}>⏱️ 2 hours</option>
                      <option value={3}>⏱️ 3 hours</option>
                      <option value={4}>⏱️ 4 hours</option>
                    </select>
                    <label htmlFor="duration" className="select-label">
                      <span className="label-icon">⏰</span>
                      Duration
                    </label>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>
              )}

              {/* Week number picker for weekly bookings */}
              {formData.bookingType === "weekly" && (
                <div className="form-row">
                  <div className="form-field-group">
                    <div className="select-field">
                      <select
                        name="weekYear"
                        value={formData.weekYear}
                        onChange={(e) => {
                          const year = parseInt(e.target.value);
                          const weekStart = getWeekStartDate(year, formData.weekNumber);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          setFormData(prev => ({
                            ...prev,
                            weekYear: year,
                            startDate: formatLocalDate(weekStart),
                            endDate: formatLocalDate(weekEnd)
                          }));
                        }}
                        className="modern-select"
                        id="week-year"
                      >
                        {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <label htmlFor="week-year" className="select-label">
                        <span className="label-icon">📅</span>
                        Year *
                      </label>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <div className="select-field">
                      <select
                        name="weekNumber"
                        value={formData.weekNumber}
                        onChange={(e) => {
                          const weekNum = parseInt(e.target.value);
                          const weekStart = getWeekStartDate(formData.weekYear, weekNum);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          setFormData(prev => ({
                            ...prev,
                            weekNumber: weekNum,
                            startDate: formatLocalDate(weekStart),
                            endDate: formatLocalDate(weekEnd)
                          }));
                        }}
                        className="modern-select"
                        id="week-number"
                      >
                        {Array.from({ length: 52 }, (_, i) => i + 1).map(week => {
                          const weekStart = getWeekStartDate(formData.weekYear, week);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          return (
                            <option key={week} value={week}>
                              Week {week} ({weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                            </option>
                          );
                        })}
                      </select>
                      <label htmlFor="week-number" className="select-label">
                        <span className="label-icon">📆</span>
                        Week Number *
                      </label>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date field - only for hourly bookings */}
              {formData.bookingType === "hourly" && (
                <div className="form-row">
                  <div className="form-field-group">
                    <div className="date-field">
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleChange}
                        className="modern-date-input"
                        id="start-date"
                      />
                      <label htmlFor="start-date" className="date-label">
                        <span className="label-icon">📅</span>
                        Date *
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Single date for full day booking */}
              {formData.bookingType === "full_day" && (
                <div className="form-field-group">
                  <div className="date-field">
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          startDate: e.target.value,
                          endDate: e.target.value // Same as start for full day
                        }));
                      }}
                      className="modern-date-input"
                      id="full-day-date"
                    />
                    <label htmlFor="full-day-date" className="date-label">
                      <span className="label-icon">📅</span>
                      Select Date *
                    </label>
                  </div>
                </div>
              )}

              {/* Info message for booking types */}
              {formData.bookingType === "full_day" && (
                <div style={{ padding: "10px", backgroundColor: "#e0f2fe", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
                  ℹ️ Full day booking: 8:00 AM - 6:00 PM on selected date
                </div>
              )}
              {formData.bookingType === "weekly" && (
                <div style={{ padding: "10px", backgroundColor: "#e0f2fe", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
                  ℹ️ Weekly booking: 7 consecutive days (8:00 AM - 6:00 PM each day)
                </div>
              )}
              {formData.bookingType === "multi_day" && (
                <>
                  <div style={{ padding: "10px", backgroundColor: "#e0f2fe", borderRadius: "8px", marginBottom: "15px", fontSize: "14px" }}>
                    ℹ️ Multi-day booking: Select 2-6 individual days (8:00 AM - 6:00 PM each day)
                  </div>

                  {/* Individual Date Selection */}
                  <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                      📅 Select Individual Dates (Click to Add/Remove)
                    </label>
                    <div style={{ marginBottom: "12px" }}>
                      <input
                        type="date"
                        value=""
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (selectedDate && !formData.selectedDates.includes(selectedDate)) {
                            if (formData.selectedDates.length < 6) {
                              const newDates = [...formData.selectedDates, selectedDate].sort();
                              setFormData(prev => ({
                                ...prev,
                                selectedDates: newDates,
                                startDate: newDates[0], // First date (earliest)
                                endDate: newDates[newDates.length - 1] // Last date (latest)
                              }));
                              e.target.value = ''; // Reset input
                            } else {
                              alert('Maximum 6 days allowed for multi-day booking');
                            }
                          }
                        }}
                        style={{
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          width: "100%",
                          fontSize: "14px"
                        }}
                      />
                    </div>

                    {/* Selected Dates Display */}
                    {formData.selectedDates.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                          Selected: {formData.selectedDates.length} day{formData.selectedDates.length !== 1 ? 's' : ''}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {formData.selectedDates.map(dateStr => (
                            <div
                              key={dateStr}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                backgroundColor: "#10b981",
                                color: "white",
                                borderRadius: "6px",
                                fontSize: "13px",
                                cursor: "pointer"
                              }}
                              onClick={() => {
                                setFormData(prev => {
                                  const newDates = prev.selectedDates.filter(d => d !== dateStr).sort();
                                  return {
                                    ...prev,
                                    selectedDates: newDates,
                                    startDate: newDates.length > 0 ? newDates[0] : prev.startDate,
                                    endDate: newDates.length > 0 ? newDates[newDates.length - 1] : prev.endDate
                                  };
                                });
                              }}
                            >
                              {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              <span style={{ fontSize: "16px", marginLeft: "4px" }}>×</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.bookingType === "hourly" && (
                <div className="form-row">
                  <div className="form-field-group">
                    <div className="select-field">
                      <select
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="modern-select"
                        id="start-time"
                      >
                        {timeSlots.map((slot) => {
                          const isSlotPast = isTimeSlotInPast(
                            new Date(formData.startDate),
                            slot
                          );
                          return (
                            <option
                              key={slot}
                              value={slot}
                              disabled={isSlotPast}
                            >
                              🕐 {slot} {isSlotPast ? "(Past)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <label htmlFor="start-time" className="select-label">
                        <span className="label-icon">🕐</span>
                        Start Time *
                      </label>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <div className="select-field">
                      <select
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="modern-select"
                        id="end-time"
                      >
                        {timeSlots.map((slot) => {
                          const isSlotPast = isTimeSlotInPast(
                            new Date(formData.startDate),
                            slot
                          );
                          return (
                            <option
                              key={slot}
                              value={slot}
                              disabled={isSlotPast}
                            >
                              🕐 {slot} {isSlotPast ? "(Past)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <label htmlFor="end-time" className="select-label">
                        <span className="label-icon">🕐</span>
                        End Time *
                      </label>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field-group full-width">
                <div className="input-field">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="modern-textarea"
                    id="description"
                  />
                  <label htmlFor="description" className="input-label">
                    <span className="label-icon">📝</span>
                    Description (optional)
                  </label>
                </div>
              </div>

              <div className="form-field-group">
                <div className="input-field">
                  <input
                    type="number"
                    name="attendeeCount"
                    value={formData.attendeeCount}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className="modern-input"
                    id="attendee-count"
                  />
                  <label htmlFor="attendee-count" className="input-label">
                    <span className="label-icon">👥</span>
                    Number of Attendees *
                  </label>
                  <div className="capacity-indicator">
                    <span className="capacity-text">Max: {room.capacity}</span>
                    <div className="capacity-bar">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${Math.min(
                            (formData.attendeeCount / room.capacity) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="booking-btn secondary"
            >
              <span className="btn-icon">❌</span>
              Cancel
            </button>
            <button type="submit" className="booking-btn primary">
              <span className="btn-icon">✅</span>
              Book Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserLoginModal = ({
  onLogin,
  onCancel,
  onSwitchToSignup,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button onClick={onCancel} className="auth-close-btn">
          ×
        </button>

        <div className="auth-split-layout">
          {/* Branding Sidebar */}
          <div className="auth-branding-sidebar">
            <div className="branding-logo">
              <img src="/ICPAC_Website_Header_Logo.svg" alt="ICPAC Logo" />
            </div>
            <h2 className="branding-title">Welcome Back!</h2>
            <p className="branding-subtitle">
              Sign in to access your ICPAC meeting room booking dashboard
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span className="feature-text">
                  Book meeting rooms instantly
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏢</span>
                <span className="feature-text">Manage your reservations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">View analytics dashboard</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="auth-form-section">
            <div className="auth-form-header">
              <h3 className="auth-form-title">Sign In</h3>
              <p className="auth-form-subtitle">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="floating-label-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`floating-input ${email ? "has-value" : ""}`}
                  required
                  id="login-email"
                />
                <label htmlFor="login-email" className="floating-label">
                  Email Address
                </label>
              </div>

              <div className="floating-label-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`floating-input ${password ? "has-value" : ""}`}
                  required
                  id="login-password"
                />
                <label htmlFor="login-password" className="floating-label">
                  Password
                </label>
              </div>

              <div className="forgot-password-link">
                <span className="auth-switch-link" onClick={onForgotPassword}>
                  Forgot Password?
                </span>
              </div>

              <div className="auth-form-actions">
                <button
                  type="button"
                  onClick={onCancel}
                  className="auth-secondary-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="auth-primary-btn">
                  Sign In
                </button>
              </div>
            </form>

            <div className="auth-form-footer">
              <p className="auth-switch-text">
                Don't have an account?{" "}
                <span className="auth-switch-link" onClick={onSwitchToSignup}>
                  Sign up here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserSignupModal = ({ onCancel, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [focusedFields, setFocusedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "#e2e8f0",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // OTP related states
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Register user and trigger OTP email from backend
  const registerUser = async (userData) => {
    try {
      // Split full name into first and last name
      const nameParts = userData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const registrationData = {
        first_name: firstName,
        last_name: lastName,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.confirmPassword || userData.password,
        phone_number: userData.phoneNumber || "",
        department: userData.department || "",
      };

      console.log("Sending registration data:", registrationData);

      // Call backend to register user - this automatically sends OTP
      const response = await apiService.register(registrationData);

      // Show success message without revealing OTP
      alert(
        `Verification code has been sent to ${userData.email}\n\nPlease check your email for the 6-digit verification code.`
      );

      setOtpSent(true);
      setOtpError("");
      setShowOTPStep(true);

      // Start resend cooldown (60 seconds)
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message || "Failed to register. Please try again.";
      alert(`Registration Error: ${errorMessage}`);
      setValidationErrors({ general: errorMessage });
      return false;
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    try {
      await apiService.resendOTP(formData.email);
      alert("New verification code has been sent to your email.");

      // Reset cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setOtpError("Failed to resend code. Please try again.");
    }
  };

  // Verify OTP with backend
  const verifyOTP = async () => {
    try {
      const response = await apiService.verifyEmail(formData.email, otpCode);

      // If verification successful, login the user
      if (response.access) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      setOtpError("");
      return true;
    } catch (error) {
      setOtpError(
        error.message || "Invalid verification code. Please try again."
      );
      return false;
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let text = "";
    let color = "#e2e8f0";

    if (password.length === 0) {
      return { score: 0, text: "", color: "#e2e8f0" };
    }

    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength
    if (score <= 2) {
      text = "Weak";
      color = "#ef4444";
    } else if (score <= 4) {
      text = "Fair";
      color = "#f59e0b";
    } else if (score <= 5) {
      text = "Good";
      color = "#3b82f6";
    } else {
      text = "Strong";
      color = "#10b981";
    }

    return { score, text, color };
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedDomains = ["@icpac.net", "@igad.int"];

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (
      !allowedDomains.some(
        (domain) =>
          formData.email && formData.email.toLowerCase().endsWith(domain)
      )
    ) {
      errors.email = "Email must be from @icpac.net or @igad.int domain";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showOTPStep) {
      // Step 1: Validate form and send OTP
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setValidationErrors({});

      // Register user (this will send OTP via email)
      const success = await registerUser(formData);
      if (!success) {
        console.error("Registration failed");
      }
    } else {
      // Step 2: Verify OTP and complete signup
      if (!otpCode) {
        setOtpError("Please enter the verification code");
        return;
      }

      const verified = await verifyOTP();
      if (verified) {
        // OTP verified successfully, user is now logged in
        alert("Email verified successfully! You are now logged in.");
        window.location.reload(); // Reload to update the UI with logged-in state
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button onClick={onCancel} className="auth-close-btn">
          ×
        </button>

        <div className="auth-split-layout">
          {/* Branding Sidebar */}
          <div className="auth-branding-sidebar">
            <div className="branding-logo">
              <img src="/ICPAC_Website_Header_Logo.svg" alt="ICPAC Logo" />
            </div>
            <h2 className="branding-title">Join ICPAC!</h2>
            <p className="branding-subtitle">
              Create your account to start booking meeting rooms and accessing
              our services
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">📧</span>
                <span className="feature-text">
                  Only ICPAC and IGAD email addresses are accepted
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span className="feature-text">
                  Examples: user@icpac.net, staff@igad.int
                </span>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="auth-form-section">
            <div className="auth-form-header">
              <h3 className="auth-form-title">Create Account</h3>
              <p className="auth-form-subtitle">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!showOTPStep && (
                <>
                  <div className="floating-label-group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={() => handleBlur("name")}
                      className={`floating-input ${
                        formData.name ? "has-value" : ""
                      } ${validationErrors.name ? "error" : ""}`}
                      required
                      id="signup-name"
                    />
                    <label htmlFor="signup-name" className="floating-label">
                      Full Name
                    </label>
                    {validationErrors.name && (
                      <span className="error-message">
                        {validationErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus("email")}
                      onBlur={() => handleBlur("email")}
                      className={`floating-input ${
                        formData.email ? "has-value" : ""
                      } ${validationErrors.email ? "error" : ""}`}
                      required
                      id="signup-email"
                    />
                    <label htmlFor="signup-email" className="floating-label">
                      Email Address
                    </label>
                    {validationErrors.email && (
                      <span className="error-message">
                        {validationErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={() => handleBlur("password")}
                      className={`floating-input ${
                        formData.password ? "has-value" : ""
                      } ${validationErrors.password ? "error" : ""}`}
                      required
                      id="signup-password"
                    />
                    <label htmlFor="signup-password" className="floating-label">
                      Password (min 8 characters, not too common)
                    </label>
                    {formData.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div
                            className="strength-fill"
                            style={{
                              width: `${(passwordStrength.score / 6) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          />
                        </div>
                        <span
                          className="strength-text"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                    {validationErrors.password && (
                      <span className="error-message">
                        {validationErrors.password}
                      </span>
                    )}
                  </div>
                </>
              )}

              {!showOTPStep && (
                <div className="floating-label-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`floating-input ${
                      formData.confirmPassword ? "has-value" : ""
                    } ${validationErrors.confirmPassword ? "error" : ""}`}
                    required
                    id="signup-confirm-password"
                  />
                  <label
                    htmlFor="signup-confirm-password"
                    className="floating-label"
                  >
                    Confirm Password
                  </label>
                  {validationErrors.confirmPassword && (
                    <span className="error-message">
                      {validationErrors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              {showOTPStep && (
                <div className="otp-verification-section">
                  <div className="otp-header">
                    <h3 style={{ color: "#065f46", marginBottom: "0.5rem" }}>
                      📧 Verify Your Email
                    </h3>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                      }}
                    >
                      We've sent a verification code to{" "}
                      <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        setOtpError("");
                      }}
                      className={`floating-input ${
                        otpCode ? "has-value" : ""
                      } ${otpError ? "error" : ""}`}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      style={{
                        textAlign: "center",
                        fontSize: "1.2rem",
                        letterSpacing: "0.2rem",
                        fontWeight: "bold",
                      }}
                      id="otp-input"
                    />
                    <label htmlFor="otp-input" className="floating-label">
                      Verification Code
                    </label>
                    {otpError && (
                      <span className="error-message">{otpError}</span>
                    )}
                  </div>

                  <div
                    className="otp-actions"
                    style={{ textAlign: "center", marginTop: "1rem" }}
                  >
                    {resendCooldown > 0 ? (
                      <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                        Resend code in {resendCooldown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resendOTP()}
                        className="auth-link-btn"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#065f46",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="auth-form-actions">
                <button
                  type="button"
                  onClick={onCancel}
                  className="auth-secondary-btn"
                >
                  Cancel
                </button>
                {showOTPStep && (
                  <button
                    type="button"
                    onClick={() => setShowOTPStep(false)}
                    className="auth-secondary-btn"
                    style={{ marginRight: "0.5rem" }}
                  >
                    ← Back
                  </button>
                )}
                <button type="submit" className="auth-primary-btn">
                  {showOTPStep
                    ? "Verify & Create Account"
                    : "Send Verification Code"}
                </button>
              </div>
            </form>

            <div className="auth-form-footer">
              <p className="auth-switch-text">
                Already have an account?{" "}
                <span className="auth-switch-link" onClick={onSwitchToLogin}>
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordModal = ({ onCancel, onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedDomains = ["@icpac.net", "@igad.int"];

    // Check basic email format first
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check if email ends with allowed domains
    return (
      email &&
      allowedDomains.some((domain) => email.toLowerCase().endsWith(domain))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setValidationError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setValidationError("Email must be from @icpac.net or @igad.int domain");
      return;
    }

    setValidationError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button onClick={onCancel} className="auth-close-btn">
          ×
        </button>

        <div className="auth-split-layout">
          {/* Branding Sidebar */}
          <div className="auth-branding-sidebar">
            <div className="branding-logo">🔐</div>
            <h2 className="branding-title">Reset Password</h2>
            <p className="branding-subtitle">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive password reset instructions"}
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">📧</span>
                <span className="feature-text">Email verification</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">Secure reset link</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Quick process</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Form */}
          <div className="auth-form-section">
            <div className="auth-form-header">
              <h3 className="auth-form-title">
                {isSubmitted ? "Email Sent!" : "Forgot Password"}
              </h3>
              <p className="auth-form-subtitle">
                {isSubmitted
                  ? "We've sent password reset instructions to your email address"
                  : "Enter your email address and we'll send you instructions to reset your password"}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="floating-label-group">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`floating-input ${email ? "has-value" : ""} ${
                      validationError ? "error" : ""
                    }`}
                    required
                    id="forgot-email"
                    disabled={isLoading}
                  />
                  <label htmlFor="forgot-email" className="floating-label">
                    Email Address
                  </label>
                  {validationError && (
                    <span className="error-message">{validationError}</span>
                  )}
                </div>

                <div className="auth-form-actions">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="auth-secondary-btn"
                    disabled={isLoading}
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="auth-primary-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="reset-success">
                <div className="success-icon">✅</div>
                <div className="success-message">
                  <h4>Instructions sent!</h4>
                  <p>
                    Check your email inbox and spam folder for the password
                    reset link.
                  </p>
                  <p className="reset-email">
                    Sent to: <strong>{email}</strong>
                  </p>
                </div>
                <div className="auth-form-actions">
                  <button onClick={onBackToLogin} className="auth-primary-btn">
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            <div className="auth-form-footer">
              <p className="auth-switch-text">
                Remember your password?{" "}
                <span className="auth-switch-link" onClick={onBackToLogin}>
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ onLogin, onSignup, onViewDashboard }) => {
  return (
    <div className="booking-container">
      <div className="booking-wrapper">
        {/* Header */}
        <div className="booking-header">
          <div className="header-title-row">
            <div className="logo-section">
              <img
                src="/ICPAC_Website_Header_Logo.svg"
                alt="ICPAC Logo"
                className="icpac-logo"
              />
            </div>
            <div className="title-section">
              <h1 className="booking-title">ICPAC INTERNAL BOOKING SYSTEM</h1>
              <p className="booking-subtitle">
                Welcome to the ICPAC Internal Booking System - Streamline your
                conference room reservations, manage meeting schedules, and
                enhance team collaboration
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="date-section">
          <div className="date-header">
            <h2 className="date-title">Welcome to ICPAC Booking System</h2>
            <div className="admin-controls">
              <div className="auth-buttons">
                <button
                  onClick={onLogin}
                  className="admin-login-btn"
                  title="Login to your account"
                >
                  Login
                </button>
                <button
                  onClick={onSignup}
                  className="user-management-btn"
                  title="Create new account"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          <div className="date-picker-section">
            <label
              className="date-picker-label"
              style={{ fontSize: "18px", fontWeight: "bold", color: "#ffffff" }}
            >
              Get Started:
            </label>
            <p
              style={{
                marginTop: "10px",
                color: "#ffffff",
                fontSize: "16px",
                fontStyle: "italic",
                fontWeight: "500",
              }}
            >
              Please login to your account or create a new one to access the
              meeting room booking system.
            </p>
          </div>
        </div>

        {/* Dashboard Analytics Section */}
        <div className="date-section">
          <div className="date-header">
            <h2 className="date-title">Room Analytics & Insights</h2>
            <div className="admin-controls">
              <button
                onClick={onViewDashboard}
                className="admin-login-btn"
                title="View detailed analytics dashboard"
              >
                📊 View Dashboard
              </button>
            </div>
          </div>

          <div
            className="dashboard-preview"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              marginTop: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                boxShadow: "0 2px 4px rgba(56, 189, 248, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(56, 189, 248, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(56, 189, 248, 0.1)";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🏢</div>
              <h3
                style={{
                  color: "#0369a1",
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Total Rooms
              </h3>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#0c4a6e",
                  margin: "0",
                }}
              >
                6
              </p>
            </div>
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                boxShadow: "0 2px 4px rgba(34, 197, 94, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(34, 197, 94, 0.1)";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📊</div>
              <h3
                style={{
                  color: "#166534",
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Available Features
              </h3>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#14532d",
                  margin: "0",
                }}
              >
                Live Analytics
              </p>
            </div>
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                boxShadow: "0 2px 4px rgba(245, 158, 11, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(245, 158, 11, 0.1)";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🎯</div>
              <h3
                style={{
                  color: "#d97706",
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Room Types
              </h3>
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#92400e",
                  margin: "0",
                }}
              >
                3
              </p>
            </div>
            <div
              className="stat-card"
              style={{
                background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                boxShadow: "0 2px 4px rgba(139, 92, 246, 0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(139, 92, 246, 0.1)";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>⚡</div>
              <h3
                style={{
                  color: "#7c3aed",
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Real-time
              </h3>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#5b21b6",
                  margin: "0",
                }}
              >
                Updates
              </p>
            </div>
          </div>

          <div
            className="dashboard-features"
            style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ color: "#374151", marginBottom: "15px" }}>
              Dashboard Features Available:
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <strong>📈 Room Utilization Stats</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Real-time usage percentages and booking counts
                </p>
              </div>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <strong>🏆 Room Rankings</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Busiest to least used rooms with analytics
                </p>
              </div>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <strong>🕐 Peak Hours Analysis</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Time-based usage patterns and trends
                </p>
              </div>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <strong>🔥 Usage Heatmaps</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Visual representation of room usage by time
                </p>
              </div>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #8b5cf6",
                }}
              >
                <strong>📊 Interactive Charts</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Weekly/monthly booking trends and patterns
                </p>
              </div>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  borderLeft: "4px solid #06b6d4",
                }}
              >
                <strong>🎯 Capacity Analysis</strong>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Efficiency metrics and capacity utilization
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="booking-footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img
                  src="/ICPAC_Website_Header_Logo.svg"
                  alt="ICPAC Logo"
                  className="footer-logo-img"
                />
                <div className="footer-text">
                  <h3>ICPAC Boardroom System</h3>
                  <p>Streamlining meeting room reservations</p>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onLogin();
                    }}
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSignup();
                    }}
                  >
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="contact-info">
                <p>
                  <strong>ICPAC</strong>
                </p>
                <p>Climate Prediction and Applications Centre</p>
                <p>Email: info@icpac.net</p>
                <p>Phone: +254 20 7095000</p>
              </div>
            </div>

            <div className="footer-section">
              <h4>About the System</h4>
              <div className="system-stats">
                <p>Streamlined meeting room booking</p>
                <p>For ICPAC staff and partners</p>
                <p>Secure and easy to use</p>
                <p>Login required for access</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2025 ICPAC. All rights reserved. | Boardroom Booking System
              v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div
            className="admin-logo-section"
            style={{ textAlign: "center", marginBottom: "16px" }}
          >
            <img
              src="/ICPAC_Website_Header_Logo.svg"
              alt="ICPAC Logo"
              style={{ width: "48px", height: "48px", objectFit: "contain" }}
            />
          </div>
          <h3 className="modal-title">Admin Login</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter admin password"
              required
            />
          </div>
          <div className="form-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="form-button secondary"
            >
              Cancel
            </button>
            <button type="submit" className="form-button primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditBookingForm = ({
  booking,
  rooms,
  currentUser,
  onUpdate,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: booking.title || "",
    organizer: booking.organizer || (currentUser ? currentUser.name : ""),
    duration: booking.duration || 0.5,
    description: booking.description || "",
    date: booking.date || "",
    time: booking.time || "",
    roomId: booking.roomId || 1,
    attendeeCount: booking.attendeeCount || 1,
  });

  // Generate time slots with 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:15`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
        slots.push(`${hour.toString().padStart(2, "0")}:45`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "duration"
          ? parseFloat(value)
          : name === "roomId" || name === "attendeeCount"
          ? parseInt(value)
          : value,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Edit Booking</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>

        <div className="booking-info">
          <h4>Editing: {booking.title}</h4>
          <p>
            Original: {booking.date} at {booking.time}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label className="form-label">Meeting Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Organizer *</label>
            <input
              type="text"
              name="organizer"
              required
              value={formData.organizer}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Room *</label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="form-select"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time *</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="form-select"
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration (hours)</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="form-select"
            >
              <option value={0.25}>15 minutes</option>
              <option value={0.33}>20 minutes</option>
              <option value={0.5}>30 minutes</option>
              <option value={0.75}>45 minutes</option>
              <option value={1}>1 hour</option>
              <option value={1.25}>1 hour 15 minutes</option>
              <option value={1.5}>1 hour 30 minutes</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Number of Attendees <span className="required">*</span>
            </label>
            <input
              type="number"
              name="attendeeCount"
              value={formData.attendeeCount}
              onChange={handleChange}
              min="1"
              max="100"
              required
              className="form-input"
              placeholder="Enter number of attendees"
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="form-button secondary"
            >
              Cancel
            </button>
            <button type="submit" className="form-button primary">
              Update Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserRegistrationModal = ({
  rooms,
  onRegister,
  onCancel,
  user = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: user?.password || "",
    role: user?.role || "user",
    managedRooms: user?.managedRooms || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate email domain
    const allowedDomains = ["@icpac.net", "@igad.int"];
    if (
      !allowedDomains.some(
        (domain) =>
          formData.email && formData.email.toLowerCase().endsWith(domain)
      )
    ) {
      alert("Email must be from @icpac.net or @igad.int domain");
      return;
    }

    onRegister(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoomSelection = (roomId) => {
    const updatedRooms = formData.managedRooms.includes(roomId)
      ? formData.managedRooms.filter((id) => id !== roomId)
      : [...formData.managedRooms, roomId];

    setFormData({
      ...formData,
      managedRooms: updatedRooms,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? "Edit User" : "User Registration"}
          </h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="user-registration-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="user">User</option>
              <option value="room_admin">Room Admin</option>
              <option value="procurement_officer">Procurement Officer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {formData.role === "room_admin" && (
            <div className="form-group">
              <label className="form-label">Managed Rooms</label>
              <div className="room-checkboxes">
                {rooms.map((room) => (
                  <label key={room.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.managedRooms.includes(room.id)}
                      onChange={() => handleRoomSelection(room.id)}
                    />
                    {room.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="form-button secondary"
            >
              Cancel
            </button>
            <button type="submit" className="form-button primary">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagementModal = ({ users, rooms, onUpdateUsers, onCancel }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = (userData) => {
    // Check if email already exists
    const emailExists = users.some(
      (user) =>
        user.email &&
        userData.email &&
        user.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (emailExists) {
      alert(
        "Error: A user with this email address already exists. Please use a different email."
      );
      return;
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    onUpdateUsers(updatedUsers);
    localStorage.setItem("icpac_users", JSON.stringify(updatedUsers));
    setShowAddUser(false);
    alert("User added successfully!");
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find((user) => user.id === userId);
    if (userToDelete) {
      if (
        window.confirm(
          `⚠️ Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.email})?\n\nThis action cannot be undone and will remove all their access to the system.`
        )
      ) {
        const updatedUsers = users.filter((user) => user.id !== userId);
        onUpdateUsers(updatedUsers);
        localStorage.setItem("icpac_users", JSON.stringify(updatedUsers));
        alert(`User "${userToDelete.name}" has been deleted successfully.`);
      }
    }
  };

  const handleEditUser = (userData) => {
    // Check if email already exists (excluding current user)
    const emailExists = users.some(
      (user) =>
        user.id !== editingUser.id &&
        user.email &&
        userData.email &&
        user.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (emailExists) {
      alert(
        "Error: A user with this email address already exists. Please use a different email."
      );
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === editingUser.id
        ? { ...user, ...userData, updatedAt: new Date().toISOString() }
        : user
    );
    onUpdateUsers(updatedUsers);
    localStorage.setItem("icpac_users", JSON.stringify(updatedUsers));
    setEditingUser(null);
    alert("User updated successfully!");
  };

  const getRoomNames = (roomIds) => {
    return roomIds
      .map((id) => rooms.find((room) => room.id === id)?.name)
      .join(", ");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3 className="modal-title">User Management</h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>
        <div className="user-management-content">
          <div className="user-management-header">
            <button
              onClick={() => setShowAddUser(true)}
              className="add-user-btn"
              title="Add new user"
            >
              Add New User
            </button>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Managed Rooms</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role === "super_admin"
                          ? "Super Admin"
                          : user.role === "room_admin"
                          ? "Room Admin"
                          : user.role === "procurement_officer"
                          ? "Procurement Officer"
                          : "User"}
                      </span>
                    </td>
                    <td>
                      {user.managedRooms
                        ? getRoomNames(user.managedRooms)
                        : "None"}
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="edit-user-btn"
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="delete-user-btn"
                          title="Delete user"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-buttons">
            <button onClick={onCancel} className="form-button primary">
              Close
            </button>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <UserRegistrationModal
            rooms={rooms}
            onRegister={handleAddUser}
            onCancel={() => setShowAddUser(false)}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <UserRegistrationModal
            rooms={rooms}
            user={editingUser}
            onRegister={handleEditUser}
            onCancel={() => setEditingUser(null)}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Procurement Dashboard Component
const ProcurementDashboard = ({ bookings, rooms, onClose }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("date");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  const getAllProcurementOrders = () => {
    return bookings
      .filter(
        (booking) =>
          booking.procurementOrders && booking.procurementOrders.length > 0
      )
      .map((booking) => ({
        ...booking,
        roomName:
          rooms.find((room) => room.id === booking.roomId)?.name ||
          "Unknown Room",
        roomLocation: getRoomLocation(
          rooms.find((room) => room.id === booking.roomId)
        ),
        // Normalize procurement orders data structure
        procurementOrders: booking.procurementOrders.map((item) => ({
          ...item,
          itemName: item.itemName || item.name || "Unknown Item",
          quantity: item.quantity || 1,
          notes: item.notes || "",
        })),
        // Add booking duration info
        duration: getBookingDuration(booking),
        totalDays: getTotalBookingDays(booking),
        priority: calculateOrderPriority(booking),
      }))
      .sort(
        (a, b) =>
          new Date(a.date || a.startDate) - new Date(b.date || b.startDate)
      );
  };

  const getRoomLocation = (room) => {
    if (!room) return "Unknown Location";
    const name = room.name.toLowerCase();
    if (name.includes("ground floor")) return "Ground Floor";
    if (name.includes("first floor") || name.includes("1st floor"))
      return "First Floor";
    return "Main Building";
  };

  const calculateOrderPriority = (booking) => {
    const orderDate = new Date(booking.date || booking.startDate);
    const now = new Date();
    const hoursUntil = (orderDate - now) / (1000 * 60 * 60);

    if (hoursUntil < 0) return "expired";
    if (hoursUntil <= 2) return "urgent";
    if (hoursUntil <= 24) return "high";
    if (hoursUntil <= 72) return "medium";
    return "low";
  };

  const getBookingDuration = (booking) => {
    if (booking.bookingType === "weekly") return "Weekly";
    if (booking.bookingType === "multi_day") return "Multi-day";
    if (booking.bookingType === "full_day") return "Full day";
    return "Hourly";
  };

  const getTotalBookingDays = (booking) => {
    if (booking.bookingType === "weekly") return 7;
    if (booking.bookingType === "multi_day") {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const diffTime = Math.abs(endDate - startDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 1;
  };

  const orders = getAllProcurementOrders();

  // Enhanced filtering and searching
  const getFilteredOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.procurementOrders.some((item) =>
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => {
        const status = getOrderStatus(order);
        return status.status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "date":
          aVal = new Date(a.date || a.startDate);
          bVal = new Date(b.date || b.startDate);
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "organizer":
          aVal = a.organizer.toLowerCase();
          bVal = b.organizer.toLowerCase();
          break;
        case "room":
          aVal = a.roomName.toLowerCase();
          bVal = b.roomName.toLowerCase();
          break;
        case "priority":
          const priorityOrder = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
            expired: 0,
          };
          aVal = priorityOrder[a.priority] || 0;
          bVal = priorityOrder[b.priority] || 0;
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Calculate enhanced stats
  const totalOrders = orders.length || 0;
  const totalItems = orders.reduce((total, order) => {
    if (!order.procurementOrders || !Array.isArray(order.procurementOrders)) {
      return total;
    }
    const orderTotal = order.procurementOrders.reduce((orderSum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const days = order.totalDays || 1;
      return orderSum + quantity * days;
    }, 0);
    return total + orderTotal;
  }, 0);

  // Calculate additional stats for enhanced dashboard
  const urgentOrders = orders.filter(
    (order) => order.priority === "urgent"
  ).length;
  const todayOrders = orders.filter((order) => {
    try {
      return getOrderStatus(order).status === "Today";
    } catch (e) {
      return false;
    }
  }).length;
  const upcomingOrders = orders.filter((order) => {
    try {
      return getOrderStatus(order).status === "Upcoming";
    } catch (e) {
      return false;
    }
  }).length;

  // Helper functions for styling
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
      high: { bg: "#fef3c7", border: "#fde68a", color: "#d97706" },
      medium: { bg: "#dbeafe", border: "#bfdbfe", color: "#2563eb" },
      low: { bg: "#f0fdf4", border: "#bbf7d0", color: "#059669" },
      expired: { bg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" },
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (orderStatus) => {
    const colors = {
      today: { bg: "#fef3c7", border: "#fde68a", color: "#d97706" },
      upcoming: { bg: "#dbeafe", border: "#bfdbfe", color: "#2563eb" },
      past: { bg: "#f1f5f9", border: "#cbd5e1", color: "#64748b" },
      declined: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
    };
    const statusKey = orderStatus.status.toLowerCase();
    return colors[statusKey] || colors.upcoming;
  };

  // Download functions
  const downloadPDF = (filterType = null) => {
    const filteredOrders = filterType
      ? orders.filter((order) => order.duration === filterType)
      : orders;
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ICPAC Procurement Orders Report${
          filterType ? ` - ${filterType}` : ""
        }</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .header h1 { color: #10b981; margin: 0; }
          .header p { color: #6b7280; margin: 5px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px; }
          .stat h3 { color: #10b981; margin: 0; font-size: 24px; }
          .stat p { color: #374151; margin: 5px 0; font-size: 14px; }
          .order { margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
          .order-header { background: #f8fafc; padding: 10px; margin: -15px -15px 10px -15px; border-radius: 7px 7px 0 0; }
          .order-title { font-weight: bold; color: #1f2937; margin: 0; }
          .order-details { color: #6b7280; font-size: 14px; margin: 5px 0; }
          .items { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
          .item:last-child { border-bottom: none; }
          .status { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status.past { background: #fee2e2; color: #dc2626; }
          .status.today { background: #fef3c7; color: #d97706; }
          .status.upcoming { background: #dbeafe; color: #2563eb; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 12px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ICPAC Procurement Orders Report${
            filterType ? ` - ${filterType}` : ""
          }</h1>
          <p>Generated on ${currentDate}</p>
          <p>IGAD Climate Prediction and Applications Centre</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <h3>${filteredOrders.length || 0}</h3>
            <p>Total Orders</p>
          </div>
          <div class="stat">
            <h3>${filteredOrders.reduce((total, order) => {
              if (
                !order.procurementOrders ||
                !Array.isArray(order.procurementOrders)
              ) {
                return total;
              }
              const orderTotal = order.procurementOrders.reduce(
                (orderSum, item) => {
                  const quantity = parseInt(item.quantity) || 0;
                  const days = order.totalDays || 1;
                  return orderSum + quantity * days;
                },
                0
              );
              return total + orderTotal;
            }, 0)}</h3>
            <p>Total Items</p>
          </div>
          <div class="stat">
            <h3>${
              filteredOrders.filter((order) => {
                try {
                  return getOrderStatus(order).status === "Today";
                } catch (e) {
                  return false;
                }
              }).length
            }</h3>
            <p>Today's Orders</p>
          </div>
        </div>

        ${filteredOrders
          .map((order) => {
            const status = getOrderStatus(order);
            return `
            <div class="order">
              <div class="order-header">
                <div class="order-title">${order.title}</div>
                <div class="order-details">
                  <strong>Organizer:</strong> ${order.organizer} | 
                  <strong>Date:</strong> ${formatDate(
                    order.date || order.startDate
                  )} | 
                  <strong>Time:</strong> ${formatTime(
                    order.time || order.startTime
                  )} | 
                  ${
                    order.endDate
                      ? `<strong>End Date:</strong> ${formatDate(
                          order.endDate
                        )} | `
                      : ""
                  }
                  <strong>Duration:</strong> ${order.duration} ${
              order.totalDays > 1 ? `(${order.totalDays} days)` : ""
            } | 
                  <strong>Room:</strong> ${order.roomName} | 
                  <strong>Attendees:</strong> ${order.attendeeCount || 1}
                  <span class="status ${status.className}">${
              status.status
            }</span>
                </div>
              </div>
              <div class="items">
                <strong>Items Required:</strong>
                ${order.procurementOrders
                  .map((item) => {
                    const dailyQuantity = item.quantity;
                    const totalQuantity = dailyQuantity * order.totalDays;
                    return `
                    <div class="item">
                      <span>${item.itemName}</span>
                      <span><strong>×${totalQuantity}${
                      order.totalDays > 1 ? ` (${dailyQuantity}/day)` : ""
                    }</strong></span>
                    </div>
                    ${
                      item.notes
                        ? `<div style="font-size: 12px; color: #6b7280; margin-left: 10px;">Note: ${item.notes}</div>`
                        : ""
                    }
                  `;
                  })
                  .join("")}
              </div>
            </div>
          `;
          })
          .join("")}

        <div class="footer">
          <p>This report was generated automatically by the ICPAC Boardroom System</p>
          <p>For questions, contact: admin@icpac.net</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getOrderStatus = (order) => {
    const orderDate = new Date(order.date || order.startDate);
    const orderTime = order.time || order.startTime;

    // Create full datetime for the order
    const orderDateTime = new Date(orderDate);
    const [hours, minutes] = orderTime.split(":");
    orderDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate time difference in hours
    const currentTime = new Date();
    const timeDifferenceHours =
      (currentTime - orderDateTime) / (1000 * 60 * 60);

    // Check if order is declined (2+ hours past)
    if (timeDifferenceHours >= 2) {
      return { status: "Declined", className: "declined" };
    }

    // Check if order date is in the past
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const orderDateOnly = new Date(orderDate);
    orderDateOnly.setHours(0, 0, 0, 0);

    if (orderDateOnly < todayDate) {
      return { status: "Past", className: "past" };
    } else if (orderDateOnly.getTime() === todayDate.getTime()) {
      // If today, check if time has passed
      if (timeDifferenceHours > 0) {
        return { status: "Past", className: "past" };
      } else {
        return { status: "Today", className: "today" };
      }
    } else {
      return { status: "Upcoming", className: "upcoming" };
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large modern-procurement-modal">
        <div
          className="modal-header"
          style={{
            background: "linear-gradient(135deg, #034930 0%, #065f46 100%)",
            padding: "2rem",
            borderRadius: "16px 16px 0 0",
            color: "white",
            position: "relative",
          }}
        >
          <div className="dashboard-title-section">
            <div className="dashboard-title-content">
              <h2
                className="modal-title"
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "white",
                  margin: "0 0 0.5rem 0",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                📊 Procurement Orders Dashboard
              </h2>
              <p
                style={{
                  color: "#d1fae5",
                  fontSize: "1rem",
                  margin: "0",
                  opacity: "0.9",
                }}
              >
                Real-time procurement insights and order management for ICPAC
              </p>
            </div>
          </div>
          <div
            className="download-section"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.75rem",
            }}
          >
            <div
              className="download-label"
              style={{
                fontSize: "0.875rem",
                color: "#d1fae5",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Download Orders
            </div>
            <div className="download-buttons">
              <div
                className="download-group"
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => downloadPDF()}
                  className="download-btn btn-pdf"
                  title="Download all orders as PDF"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  📄 All Orders PDF
                </button>
                <button
                  onClick={() => downloadPDF("Hourly")}
                  className="download-btn btn-hourly"
                  title="Download hourly orders as PDF"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  ⏰ Hourly Orders
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close dashboard"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
          >
            ×
          </button>
        </div>

        <div
          className="procurement-dashboard"
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: "var(--bg-main, #f8fafc)",
            padding: "2rem",
            minHeight: "400px",
          }}
        >
          {!orders || orders.length === 0 ? (
            <div
              className="no-orders"
              style={{
                textAlign: "center",
                padding: "4rem",
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "1rem",
                }}
              >
                No Procurement Orders Found
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "1rem",
                  marginBottom: "2rem",
                }}
              >
                No bookings have procurement orders yet. Orders will appear here
                when users submit procurement requests with their meeting
                bookings.
              </p>
              <div
                style={{
                  background: "#f1f5f9",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: "#475569",
                }}
              >
                <strong>Tip:</strong> Procurement orders are automatically
                created when users add items to their booking requests during
                the meeting booking process.
              </div>
            </div>
          ) : (
            <div className="orders-container">
              {/* Enhanced Search and Filter Controls */}
              <div
                className="dashboard-controls"
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                    alignItems: "end",
                  }}
                >
                  {/* Search Input */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "0.5rem",
                      }}
                    >
                      🔍 Search Orders
                    </label>
                    <input
                      type="text"
                      placeholder="Search by title, organizer, room, or items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "0.5rem",
                      }}
                    >
                      📋 Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        background: "#ffffff",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="all">All Orders</option>
                      <option value="today">Today</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  {/* Sort Controls */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "0.5rem",
                      }}
                    >
                      📊 Sort by
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                          flex: "1",
                          padding: "0.75rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          background: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                        <option value="organizer">Organizer</option>
                        <option value="room">Room</option>
                        <option value="priority">Priority</option>
                      </select>
                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        style={{
                          padding: "0.75rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "8px",
                          background: "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                        title={`Sort ${
                          sortOrder === "asc" ? "Descending" : "Ascending"
                        }`}
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    color: "#64748b",
                  }}
                >
                  Showing {paginatedOrders.length} of {filteredOrders.length}{" "}
                  orders
                  {searchTerm && ` (filtered from ${orders.length} total)`}
                </div>
              </div>
              <div
                className="dashboard-stats"
                role="region"
                aria-label="Dashboard statistics"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  className="stat-card total-orders"
                  role="article"
                  aria-label={`Total orders: ${totalOrders}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #e2e8f0",
                    borderLeft: "5px solid #3b82f6",
                    position: "relative",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                      }}
                    >
                      Total
                      <br />
                      Orders
                    </div>
                    <div
                      className="stat-icon"
                      role="img"
                      aria-label="Orders icon"
                      style={{
                        fontSize: "2rem",
                        opacity: "0.7",
                      }}
                    >
                      📦
                    </div>
                  </div>
                  <div
                    className="stat-value"
                    aria-label={`${totalOrders} orders`}
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      margin: "0",
                    }}
                  >
                    {totalOrders}
                  </div>
                </div>
                <div
                  className="stat-card total-items"
                  role="article"
                  aria-label={`Total items: ${totalItems}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #e2e8f0",
                    borderLeft: "5px solid #10b981",
                    position: "relative",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                      }}
                    >
                      Total
                      <br />
                      Items
                    </div>
                    <div
                      className="stat-icon"
                      role="img"
                      aria-label="Items icon"
                      style={{
                        fontSize: "2rem",
                        opacity: "0.7",
                      }}
                    >
                      📋
                    </div>
                  </div>
                  <div
                    className="stat-value"
                    aria-label={`${totalItems} items`}
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      margin: "0",
                    }}
                  >
                    {totalItems}
                  </div>
                  <small
                    className="stat-description"
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontStyle: "italic",
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    Including multi-day quantities
                  </small>
                </div>
                <div
                  className="stat-card today-orders"
                  role="article"
                  aria-label={`Today's orders: ${todayOrders}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #e2e8f0",
                    borderLeft: "5px solid #f59e0b",
                    position: "relative",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                      }}
                    >
                      Today's
                      <br />
                      Orders
                    </div>
                    <div
                      className="stat-icon"
                      role="img"
                      aria-label="Today icon"
                      style={{
                        fontSize: "2rem",
                        opacity: "0.7",
                      }}
                    >
                      📅
                    </div>
                  </div>
                  <div
                    className="stat-value"
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      margin: "0",
                    }}
                  >
                    {todayOrders}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontStyle: "italic",
                      marginTop: "0.5rem",
                    }}
                  >
                    Requires immediate attention
                  </div>
                </div>

                <div
                  className="stat-card urgent-orders"
                  role="article"
                  aria-label={`Urgent orders: ${urgentOrders}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #e2e8f0",
                    borderLeft: "5px solid #ef4444",
                    position: "relative",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                      }}
                    >
                      Urgent
                      <br />
                      Orders
                    </div>
                    <div
                      className="stat-icon"
                      role="img"
                      aria-label="Urgent icon"
                      style={{
                        fontSize: "2rem",
                        opacity: "0.7",
                      }}
                    >
                      🚨
                    </div>
                  </div>
                  <div
                    className="stat-value"
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      margin: "0",
                    }}
                  >
                    {urgentOrders}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#ef4444",
                      fontWeight: "600",
                      marginTop: "0.5rem",
                    }}
                  >
                    Within 2 hours
                  </div>
                </div>

                <div
                  className="stat-card upcoming-orders"
                  role="article"
                  aria-label={`Upcoming orders: ${upcomingOrders}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #e2e8f0",
                    borderLeft: "5px solid #8b5cf6",
                    position: "relative",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="stat-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      className="stat-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                      }}
                    >
                      Upcoming
                      <br />
                      Orders
                    </div>
                    <div
                      className="stat-icon"
                      role="img"
                      aria-label="Upcoming icon"
                      style={{
                        fontSize: "2rem",
                        opacity: "0.7",
                      }}
                    >
                      📈
                    </div>
                  </div>
                  <div
                    className="stat-value"
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "800",
                      color: "#1e293b",
                      margin: "0",
                    }}
                  >
                    {upcomingOrders}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontStyle: "italic",
                      marginTop: "0.5rem",
                    }}
                  >
                    Future requirements
                  </div>
                </div>
              </div>

              <div
                className="orders-table-container"
                role="region"
                aria-label="Procurement orders data table"
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                }}
              >
                <table
                  className="orders-table"
                  role="table"
                  aria-label="List of procurement orders"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  }}
                >
                  <thead>
                    <tr
                      role="row"
                      style={{
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      }}
                    >
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Date
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Time
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Duration
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Meeting
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Organizer
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Room
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Attendees
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Items Required
                      </th>
                      <th
                        role="columnheader"
                        scope="col"
                        aria-sort="none"
                        style={{
                          padding: "1.25rem 1rem",
                          textAlign: "left",
                          fontWeight: "700",
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #e2e8f0",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => {
                      const orderStatus = getOrderStatus(order);
                      return (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.closest("tr").style.backgroundColor =
                              "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.target.closest("tr").style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              color: "#374151",
                            }}
                          >
                            {formatDate(order.date || order.startDate)}
                          </td>
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              color: "#64748b",
                            }}
                          >
                            {formatTime(order.time || order.startTime)}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: "#1e293b",
                                background: getPriorityColor(order.priority).bg,
                                border: `1px solid ${
                                  getPriorityColor(order.priority).border
                                }`,
                              }}
                            >
                              {order.duration}
                            </span>
                            {order.totalDays > 1 && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                  marginTop: "0.25rem",
                                }}
                              >
                                ({order.totalDays} days)
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#1e293b",
                            }}
                          >
                            {order.title}
                          </td>
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              color: "#64748b",
                            }}
                          >
                            {order.organizer}
                          </td>
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              color: "#64748b",
                            }}
                          >
                            <div>{order.roomName}</div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                marginTop: "0.25rem",
                              }}
                            >
                              {order.roomLocation}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1rem",
                              fontSize: "0.875rem",
                              textAlign: "center",
                              fontWeight: "500",
                              color: "#64748b",
                            }}
                          >
                            {order.attendeeCount || 1}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {order.procurementOrders.map((item, index) => {
                                const dailyQuantity = item.quantity;
                                const totalQuantity =
                                  dailyQuantity * order.totalDays;
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "0.5rem 0.75rem",
                                      background: "#f8fafc",
                                      borderRadius: "6px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "500",
                                        color: "#374151",
                                        flex: "1",
                                      }}
                                    >
                                      {item.itemName}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.875rem",
                                        fontWeight: "700",
                                        color: "#059669",
                                        marginLeft: "0.5rem",
                                      }}
                                    >
                                      ×{totalQuantity}
                                      {order.totalDays > 1 && (
                                        <span
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "#64748b",
                                            fontWeight: "400",
                                          }}
                                        >
                                          {" "}
                                          ({dailyQuantity}/day)
                                        </span>
                                      )}
                                    </span>
                                    {item.notes && (
                                      <div
                                        style={{
                                          fontSize: "0.75rem",
                                          color: "#64748b",
                                          marginTop: "0.25rem",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {item.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.375rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: getStatusColor(orderStatus).color,
                                backgroundColor: getStatusColor(orderStatus).bg,
                                border: `1px solid ${
                                  getStatusColor(orderStatus).border
                                }`,
                              }}
                            >
                              {orderStatus.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div
                    style={{
                      padding: "1.5rem",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                      }}
                    >
                      Page {currentPage} of {totalPages} •{" "}
                      {filteredOrders.length} total orders
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        style={{
                          padding: "0.5rem 1rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          background: currentPage <= 1 ? "#f9fafb" : "#ffffff",
                          color: currentPage <= 1 ? "#9ca3af" : "#374151",
                          cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        ← Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                padding: "0.5rem 0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                background:
                                  pageNum === currentPage
                                    ? "#3b82f6"
                                    : "#ffffff",
                                color:
                                  pageNum === currentPage
                                    ? "#ffffff"
                                    : "#374151",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight:
                                  pageNum === currentPage ? "600" : "400",
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        style={{
                          padding: "0.5rem 1rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          background:
                            currentPage >= totalPages ? "#f9fafb" : "#ffffff",
                          color:
                            currentPage >= totalPages ? "#9ca3af" : "#374151",
                          cursor:
                            currentPage >= totalPages
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MeetingSpaceSelectionModal = ({ rooms, onSelect, currentUser }) => {
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoomId) {
      onSelect(selectedRoomId);
    } else {
      alert("Please select a meeting space to continue.");
    }
  };

  const getLocationFromName = (name) => {
    if (name.toLowerCase().includes("ground floor")) return "Ground Floor";
    if (name.toLowerCase().includes("first floor")) return "First Floor";
    if (name.toLowerCase().includes("1st floor")) return "1st Floor";
    return "Main Building";
  };

  return (
    <div className="modal-overlay meeting-space-modal-overlay">
      <div className="modal-content meeting-space-modal">
        <div className="modal-header">
          <h3 className="modal-title">Select Your Meeting Space</h3>
          <div className="modal-subtitle">
            Welcome, {currentUser?.name}! Please choose a meeting space to
            continue.
          </div>
        </div>
        <form onSubmit={handleSubmit} className="meeting-space-form">
          <div className="form-group">
            <label className="form-label">Available Meeting Spaces</label>
            <div className="meeting-spaces-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`meeting-space-card ${
                    selectedRoomId === room.id.toString() ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRoomId(room.id.toString())}
                >
                  <div className="space-header">
                    <h4 className="space-name">{room.name}</h4>
                    <span className="space-location">
                      {getLocationFromName(room.name)}
                    </span>
                  </div>
                  <div className="space-details">
                    <div className="space-capacity">
                      <span className="capacity-icon">👥</span>
                      <span>Capacity: {room.capacity}</span>
                    </div>
                    <div className="space-amenities">
                      {room.amenities?.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="amenity-chip-small">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities?.length > 3 && (
                        <span className="amenity-more">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="selection-indicator">
                    {selectedRoomId === room.id.toString() && (
                      <span className="checkmark">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="form-button primary large"
              disabled={!selectedRoomId}
            >
              Continue to Dashboard
            </button>
          </div>
          <div className="modal-footer-note">
            You can only book and view the meeting space you select here.
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingBoard;
