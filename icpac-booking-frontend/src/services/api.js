// Use proxy or relative URL for API in Replit environment
const API_BASE_URL = '/api';

class APIService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Authentication required');
    }

    return response;
  }

  // Authentication
  async login(email, password) {
    console.log('🔍 DEBUG: Starting login process...');
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('🔍 DEBUG: Login response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 DEBUG: Login response data:', data);
      console.log('🔍 DEBUG: data.access:', data.access);
      console.log('🔍 DEBUG: data.refresh:', data.refresh);
      console.log('🔍 DEBUG: data.user:', data.user);
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('🔍 DEBUG: Saved to localStorage successfully');
      
      // Verify it was saved
      const savedToken = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      console.log('🔍 DEBUG: Verification - token saved:', !!savedToken);
      console.log('🔍 DEBUG: Verification - user saved:', !!savedUser);
      
      this.token = data.access;
      return data;
    }

    console.log('🔍 DEBUG: Login failed, response not ok');
    throw new Error('Login failed');
  }

  async register(userData) {
    const response = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return await response.json();
    }

    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  async verifyEmail(email, code) {
    const response = await this.request('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      this.token = data.access;
      return data;
    }

    const errorData = await response.json();
    throw new Error(errorData.message || 'Email verification failed');
  }

  async resendVerificationCode(email) {
    const response = await this.request('/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      return await response.json();
    }

    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to resend verification code');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.token = null;
    window.location.href = '/login';
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Rooms
  async getRooms() {
    const response = await this.request('/rooms/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch rooms');
  }

  async getRoom(id) {
    const response = await this.request(`/rooms/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch room');
  }

  async createRoom(roomData) {
    const response = await this.request('/rooms/', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create room');
  }

  async updateRoom(id, roomData) {
    const response = await this.request(`/rooms/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(roomData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update room');
  }

  async deleteRoom(id) {
    const response = await this.request(`/rooms/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
  }

  // Bookings
  async getBookings() {
    const response = await this.request('/bookings/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch bookings');
  }

  async getMyBookings() {
    const response = await this.request('/bookings/my/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch my bookings');
  }

  async createBooking(bookingData) {
    const response = await this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });

    if (response.ok) {
      return await response.json();
    }

    const errorData = await response.json();
    console.error('API Error Response:', errorData);

    // Handle validation errors
    if (errorData.non_field_errors) {
      throw new Error(errorData.non_field_errors[0]);
    }

    // Handle field-specific errors
    const fieldErrors = [];
    Object.keys(errorData).forEach(field => {
      if (Array.isArray(errorData[field])) {
        fieldErrors.push(`${field}: ${errorData[field][0]}`);
      }
    });

    if (fieldErrors.length > 0) {
      throw new Error(fieldErrors.join('; '));
    }

    throw new Error(errorData.message || errorData.detail || 'Failed to create booking');
  }

  async updateBooking(id, bookingData) {
    const response = await this.request(`/bookings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(bookingData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update booking');
  }

  async cancelBooking(id) {
    const response = await this.request(`/bookings/${id}/cancel/`, {
      method: 'POST',
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to cancel booking');
  }

  async approveBooking(id) {
    const response = await this.request(`/bookings/${id}/approve/`, {
      method: 'POST',
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to approve booking');
  }

  async rejectBooking(id, reason) {
    const response = await this.request(`/bookings/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to reject booking');
  }

  // Check room availability
  async checkAvailability(roomId, date, startTime, endTime) {
    const response = await this.request(`/rooms/${roomId}/availability/`, {
      method: 'POST',
      body: JSON.stringify({
        date,
        start_time: startTime,
        end_time: endTime,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to check availability');
  }

  // Dashboard stats
  async getDashboardStats() {
    const response = await this.request('/bookings/stats/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch dashboard stats');
  }
}

export default new APIService();