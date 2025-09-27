import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiService.login(email, password);
      setUser(userData.user);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.register(userData);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setRooms([]);
    setBookings([]);
  };

  // Data fetching functions
  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🚀 FETCHING ROOMS: Starting room data fetch...');
      const roomsData = await apiService.getRooms();
      console.log('🚀 FETCHING ROOMS: Raw API response:', roomsData);
      const finalRooms = roomsData.results || roomsData;
      console.log('🚀 FETCHING ROOMS: Final rooms to set:', finalRooms);
      console.log('🚀 FETCHING ROOMS: Room count:', finalRooms.length);
      console.log('🚀 FETCHING ROOMS: Room IDs loaded:', finalRooms.map(r => `${r.id}:${r.name}`));
      
      // Extra debug: Check if Room 16 is present
      const room16 = finalRooms.find(r => r.id === 16);
      console.log('🚀 FETCHING ROOMS: Room 16 found?', room16 ? `Yes: ${room16.name}` : 'NO - MISSING!');
      
      setRooms(finalRooms);
      console.log('🚀 FETCHING ROOMS: Rooms set in state successfully');
    } catch (error) {
      setError(error.message);
      console.error('🚀 FETCHING ROOMS: Failed to fetch rooms from Django API:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await apiService.getBookings();
      console.log('🔍 DEBUG: Raw API response for bookings:', bookingsData);
      console.log('🔍 DEBUG: Type of bookingsData:', typeof bookingsData);
      console.log('🔍 DEBUG: bookingsData.results:', bookingsData.results);
      const finalBookings = bookingsData.results || bookingsData;
      console.log('🔍 DEBUG: Final bookings to store:', finalBookings);
      setBookings(finalBookings);
    } catch (error) {
      setError(error.message);
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const newBooking = await apiService.createBooking(bookingData);
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (id, bookingData) => {
    try {
      setLoading(true);
      const updatedBooking = await apiService.updateBooking(id, bookingData);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      setLoading(true);
      await apiService.cancelBooking(id);
      setBookings(prev => prev.map(booking => 
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      ));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for when API is not available
  // Removed fallback data - all data must come from Django API

  // Removed localStorage functions - all data comes from Django API

  // Initialize data
  useEffect(() => {
    // Always fetch rooms data - it's public information
    fetchRooms();
    
    // Check if user is already logged in via JWT token
    console.log('🔍 DEBUG: Checking for existing user in localStorage...');
    const accessToken = localStorage.getItem('access_token');
    const userString = localStorage.getItem('user');
    console.log('🔍 DEBUG: Access token found:', !!accessToken);
    console.log('🔍 DEBUG: User string found:', !!userString);
    console.log('🔍 DEBUG: User string value:', userString);
    
    const currentUser = apiService.getCurrentUser();
    console.log('🔍 DEBUG: getCurrentUser() result:', currentUser);
    
    if (currentUser) {
      console.log('🔍 DEBUG: Setting user in context and fetching bookings...');
      setUser(currentUser);
      // Fetch user-specific data
      fetchBookings();
    } else {
      console.log('🔍 DEBUG: No user found, not fetching bookings');
    }
    // Note: No fallback data - all data must come from Django API
  }, []);

  const value = {
    // Data
    rooms,
    setRooms,
    bookings,
    setBookings,
    user,
    setUser,
    loading,
    error,
    setError,
    
    // Auth functions
    login,
    register,
    logout,
    
    // API functions
    fetchRooms,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    
    // All data comes from Django API
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};