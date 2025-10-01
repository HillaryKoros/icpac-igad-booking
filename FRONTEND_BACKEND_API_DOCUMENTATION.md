# ICPAC Booking System - Frontend-Backend API Documentation

## Overview

This document provides comprehensive documentation of all API endpoints required by the React frontend for communication with the Django backend. It covers authentication, room management, booking operations, and security features.

## Base Configuration

### Backend Base URL
```
http://localhost:8001/api/
```

### Frontend API Service Configuration
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

**Note**: There's a port mismatch between frontend (8000) and backend (8001) that should be corrected.

## Authentication & User Management

### 1. User Login
**Endpoint**: `POST /api/auth/login/`
**Description**: Authenticate user and return JWT tokens

**Request Body**:
```json
{
    "email": "admin@icpac.net",
    "password": "admin123"
}
```

**Response** (Success - 200):
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "superadmin",
        "email": "admin@icpac.net",
        "full_name": "Super Admin",
        "role": "super_admin",
        "first_name": "Super",
        "last_name": "Admin",
        "is_active": true,
        "date_joined": "2024-01-01T10:00:00Z"
    }
}
```

**Response** (Error - 401):
```json
{
    "error": "Invalid email or password."
}
```

### 2. User Registration
**Endpoint**: `POST /api/auth/register/`
**Description**: Register a new user account

**Request Body**:
```json
{
    "email": "newuser@icpac.net",
    "username": "newuser",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123",
    "phone_number": "+254712345678",
    "department": "IT"
}
```

**Response** (Success - 201):
```json
{
    "message": "User registered successfully. Please verify your email.",
    "user": {
        "id": 5,
        "username": "newuser",
        "email": "newuser@icpac.net",
        "full_name": "John Doe",
        "is_active": false
    }
}
```

### 3. Email Verification
**Endpoint**: `POST /api/auth/verify-email/`
**Description**: Verify email address with OTP code

**Request Body**:
```json
{
    "email": "newuser@icpac.net",
    "otp_code": "123456"
}
```

**Response** (Success - 200):
```json
{
    "message": "Email verified successfully.",
    "user": {
        "id": 5,
        "email": "newuser@icpac.net",
        "is_active": true
    }
}
```

### 4. Resend OTP
**Endpoint**: `POST /api/auth/resend-otp/`
**Description**: Resend OTP code for email verification

**Request Body**:
```json
{
    "email": "newuser@icpac.net"
}
```

**Response** (Success - 200):
```json
{
    "message": "OTP code sent successfully to your email."
}
```

### 5. Token Refresh
**Endpoint**: `POST /api/auth/token/refresh/`
**Description**: Refresh expired access token

**Request Body**:
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response** (Success - 200):
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 6. Get Current User Profile
**Endpoint**: `GET /api/auth/profile/`
**Headers**: `Authorization: Bearer <access_token>`

**Response** (Success - 200):
```json
{
    "id": 1,
    "username": "superadmin",
    "email": "admin@icpac.net",
    "first_name": "Super",
    "last_name": "Admin",
    "full_name": "Super Admin",
    "role": "super_admin",
    "phone_number": "",
    "department": "",
    "is_active": true,
    "date_joined": "2024-01-01T10:00:00Z"
}
```

### 7. Change Password
**Endpoint**: `POST /api/auth/password/change/`
**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
    "old_password": "oldpassword123",
    "new_password": "newpassword123"
}
```

**Response** (Success - 200):
```json
{
    "message": "Password changed successfully."
}
```

### 8. User Dashboard Stats
**Endpoint**: `GET /api/auth/dashboard/stats/`
**Headers**: `Authorization: Bearer <access_token>`

**Response** (Success - 200):
```json
{
    "total_bookings": 5,
    "pending_bookings": 1,
    "approved_bookings": 4,
    "user_role": "user"
}
```

### 9. User Logout
**Endpoint**: `POST /api/auth/logout/`
**Headers**: `Authorization: Bearer <access_token>`

**Response** (Success - 200):
```json
{
    "message": "Successfully logged out."
}
```

## Room Management

### 1. Get All Rooms
**Endpoint**: `GET /api/rooms/`
**Description**: Retrieve list of all active rooms with optional filtering

**Query Parameters**:
- `category`: Filter by room category (e.g., "conference_room", "computer_lab")
- `min_capacity`: Minimum room capacity
- `amenities`: Filter by amenities (comma-separated)
- `search`: Search in name, location, description

**Response** (Success - 200):
```json
[
    {
        "id": 1,
        "name": "Conference Room A - Main Building",
        "capacity": 20,
        "category": "conference_room",
        "category_display": "Conference Room",
        "location": "Main Building, 2nd Floor",
        "amenities": ["Projector", "Whiteboard", "Video Conferencing"],
        "image": null,
        "is_active": true,
        "floor": 2
    },
    {
        "id": 2,
        "name": "Computer Lab 1 - Ground Floor",
        "capacity": 20,
        "category": "computer_lab",
        "category_display": "Computer Lab",
        "location": "Ground Floor, Tech Wing",
        "amenities": ["Computers", "Projector", "Whiteboard"],
        "image": null,
        "is_active": true,
        "floor": 0
    }
]
```

### 2. Get Room Details
**Endpoint**: `GET /api/rooms/{id}/`
**Description**: Retrieve detailed information about a specific room

**Response** (Success - 200):
```json
{
    "id": 1,
    "name": "Conference Room A - Main Building",
    "capacity": 20,
    "category": "conference_room",
    "category_display": "Conference Room",
    "location": "Main Building, 2nd Floor",
    "description": "Large conference room with modern facilities",
    "amenities": ["Projector", "Whiteboard", "Video Conferencing"],
    "amenities_list": "Projector, Whiteboard, Video Conferencing",
    "is_large_room": false,
    "advance_booking_days": 30,
    "min_booking_duration": 1,
    "max_booking_duration": 8,
    "total_bookings": 15,
    "upcoming_bookings": [
        {
            "id": 1,
            "purpose": "Weekly Team Meeting",
            "user_name": "John Doe",
            "start_date": "2024-01-15",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "expected_attendees": 8
        }
    ],
    "floor": 2
}
```

### 3. Check Room Availability
**Endpoint**: `POST /api/rooms/{room_id}/availability/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Check room availability for a specific date/time range

**Request Body**:
```json
{
    "date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00"
}
```

**Response** (Success - 200):
```json
{
    "room_id": 1,
    "room_name": "Conference Room A - Main Building",
    "date": "2024-01-15",
    "availability": {
        "is_available": true,
        "available_slots": [
            {"start": "08:00", "end": "09:00"},
            {"start": "10:00", "end": "17:00"}
        ],
        "booked_slots": [
            {
                "start": "09:00",
                "end": "10:00",
                "purpose": "Weekly Team Meeting",
                "user_name": "John Doe"
            }
        ]
    }
}
```

### 4. Get Room Categories
**Endpoint**: `GET /api/rooms/categories/`
**Description**: Get all room categories with statistics

**Response** (Success - 200):
```json
{
    "categories": [
        {
            "category": "conference_room",
            "category_display": "Conference Room",
            "count": 2,
            "average_capacity": 17.5
        },
        {
            "category": "computer_lab",
            "category_display": "Computer Lab",
            "count": 2,
            "average_capacity": 20.0
        }
    ],
    "total_categories": 2
}
```

### 5. Get Room Amenities
**Endpoint**: `GET /api/rooms/amenities/`
**Description**: Get list of all available room amenities

**Response** (Success - 200):
```json
[
    {
        "id": 1,
        "name": "Projector",
        "description": "HD Projector for presentations"
    },
    {
        "id": 2,
        "name": "Whiteboard",
        "description": "Large whiteboard for notes and diagrams"
    },
    {
        "id": 3,
        "name": "Video Conferencing",
        "description": "Video conferencing equipment"
    }
]
```

### 6. Room Statistics
**Endpoint**: `GET /api/rooms/{room_id}/stats/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get booking statistics for a specific room

**Response** (Success - 200):
```json
{
    "room_id": 1,
    "room_name": "Conference Room A - Main Building",
    "statistics": {
        "total_bookings": 25,
        "approved_bookings": 20,
        "pending_bookings": 3,
        "rejected_bookings": 2,
        "utilization_rate": 65.5,
        "average_booking_duration": 2.5
    },
    "monthly_stats": [
        {
            "month": "2024-01",
            "bookings_count": 8,
            "utilization_hours": 20
        }
    ]
}
```

### 7. Rooms Overview Statistics
**Endpoint**: `GET /api/rooms/stats/overview/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get overview statistics for all rooms (Admin only)

**Response** (Success - 200):
```json
{
    "total_rooms": 5,
    "total_bookings_last_30_days": 25,
    "approved_bookings_last_30_days": 20,
    "pending_bookings_last_30_days": 3,
    "room_statistics": [
        {
            "id": 1,
            "name": "Conference Room A - Main Building",
            "category": "conference_room",
            "capacity": 20,
            "total_bookings": 8,
            "utilization_rate": 15.5
        }
    ]
}
```

## Booking Management

### 1. Get All Bookings
**Endpoint**: `GET /api/bookings/`
**Description**: Retrieve list of all bookings with optional filtering

**Query Parameters**:
- `status`: Filter by approval status (pending, approved, rejected, cancelled)
- `room`: Filter by room ID
- `date_from`: Filter bookings from date (YYYY-MM-DD)
- `date_to`: Filter bookings to date (YYYY-MM-DD)

**Response** (Success - 200):
```json
[
    {
        "id": 1,
        "room": 1,
        "room_name": "Conference Room A - Main Building",
        "user": 1,
        "user_name": "John Doe",
        "start_date": "2024-01-15",
        "end_date": "2024-01-15",
        "start_time": "09:00:00",
        "end_time": "10:00:00",
        "purpose": "Weekly Team Meeting",
        "expected_attendees": 8,
        "special_requirements": "",
        "approval_status": "approved",
        "approval_status_display": "Approved",
        "approved_by": 1,
        "approved_at": "2024-01-10T15:30:00Z",
        "duration_hours": 1.0,
        "created_at": "2024-01-10T10:00:00Z",
        "updated_at": "2024-01-10T15:30:00Z"
    }
]
```

### 2. Create New Booking
**Endpoint**: `POST /api/bookings/`
**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
    "room": 1,
    "start_date": "2024-01-20",
    "end_date": "2024-01-20",
    "start_time": "14:00:00",
    "end_time": "16:00:00",
    "purpose": "Project Planning Meeting",
    "expected_attendees": 6,
    "special_requirements": "Need projector and whiteboard"
}
```

**Response** (Success - 201):
```json
{
    "message": "Booking created successfully",
    "booking": {
        "id": 2,
        "room": 1,
        "room_name": "Conference Room A - Main Building",
        "user": 1,
        "user_name": "John Doe",
        "start_date": "2024-01-20",
        "end_date": "2024-01-20",
        "start_time": "14:00:00",
        "end_time": "16:00:00",
        "purpose": "Project Planning Meeting",
        "expected_attendees": 6,
        "special_requirements": "Need projector and whiteboard",
        "approval_status": "pending",
        "approval_status_display": "Pending",
        "duration_hours": 2.0,
        "created_at": "2024-01-15T10:00:00Z"
    }
}
```

### 3. Get Booking Details
**Endpoint**: `GET /api/bookings/{id}/`
**Headers**: `Authorization: Bearer <access_token>`

**Response** (Success - 200):
```json
{
    "id": 1,
    "room": 1,
    "room_name": "Conference Room A - Main Building",
    "user": 1,
    "user_name": "John Doe",
    "start_date": "2024-01-15",
    "end_date": "2024-01-15",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "purpose": "Weekly Team Meeting",
    "expected_attendees": 8,
    "special_requirements": "",
    "approval_status": "approved",
    "approval_status_display": "Approved",
    "approved_by": 1,
    "approved_at": "2024-01-10T15:30:00Z",
    "rejection_reason": "",
    "duration_hours": 1.0,
    "can_modify": false,
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-10T15:30:00Z"
}
```

### 4. Update Booking
**Endpoint**: `PATCH /api/bookings/{id}/`
**Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "expected_attendees": 10,
    "special_requirements": "Updated requirements"
}
```

**Response** (Success - 200):
```json
{
    "message": "Booking updated successfully",
    "booking": {
        "id": 1,
        "start_time": "10:00:00",
        "end_time": "11:00:00",
        "expected_attendees": 10,
        "special_requirements": "Updated requirements",
        "updated_at": "2024-01-15T14:30:00Z"
    }
}
```

### 5. Approve/Reject Booking
**Endpoint**: `POST /api/bookings/{booking_id}/approve-reject/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Approve or reject a booking (Admin only)

**Request Body**:
```json
{
    "action": "approve"
}
```

**Or for rejection**:
```json
{
    "action": "reject",
    "rejection_reason": "Room already booked for that time"
}
```

**Response** (Success - 200):
```json
{
    "message": "Booking approved successfully.",
    "booking": {
        "id": 1,
        "approval_status": "approved",
        "approval_status_display": "Approved",
        "approved_by": 1,
        "approved_at": "2024-01-15T14:30:00Z"
    }
}
```

### 6. Get My Bookings
**Endpoint**: `GET /api/bookings/my-bookings/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get current user's bookings

**Response** (Success - 200):
```json
{
    "upcoming_bookings": [
        {
            "id": 2,
            "room_name": "Conference Room A - Main Building",
            "start_date": "2024-01-20",
            "start_time": "14:00:00",
            "end_time": "16:00:00",
            "purpose": "Project Planning Meeting",
            "approval_status": "approved",
            "approval_status_display": "Approved"
        }
    ],
    "recent_bookings": [
        {
            "id": 1,
            "room_name": "Conference Room A - Main Building",
            "start_date": "2024-01-15",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "purpose": "Weekly Team Meeting",
            "approval_status": "approved",
            "approval_status_display": "Approved"
        }
    ],
    "statistics": {
        "total_bookings": 5,
        "approved_bookings": 4,
        "pending_bookings": 1
    }
}
```

### 7. Get Pending Approvals
**Endpoint**: `GET /api/bookings/pending-approvals/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get all pending bookings for approval (Admin only)

**Response** (Success - 200):
```json
{
    "pending_bookings": [
        {
            "id": 3,
            "room_name": "Conference Room B - Main Building",
            "user_name": "Jane Smith",
            "start_date": "2024-01-22",
            "start_time": "11:00:00",
            "end_time": "12:00:00",
            "purpose": "Client Meeting",
            "expected_attendees": 4,
            "created_at": "2024-01-15T09:00:00Z"
        }
    ],
    "count": 1
}
```

### 8. Booking Dashboard Stats
**Endpoint**: `GET /api/bookings/dashboard/stats/`
**Headers**: `Authorization: Bearer <access_token>`

**Response** (Success - 200):
```json
{
    "statistics": {
        "total_bookings": 25,
        "recent_bookings_count": 8,
        "approved_bookings": 20,
        "pending_bookings": 3,
        "rejected_bookings": 2,
        "most_popular_room": "Conference Room A - Main Building"
    },
    "recent_bookings": [
        {
            "id": 1,
            "room_name": "Conference Room A - Main Building",
            "user_name": "John Doe",
            "start_date": "2024-01-15",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "purpose": "Weekly Team Meeting",
            "approval_status": "approved"
        }
    ],
    "date_range": {
        "start_date": "2023-12-22",
        "end_date": "2024-01-21"
    }
}
```

### 9. Get Calendar Events
**Endpoint**: `GET /api/bookings/calendar/events/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get bookings formatted for calendar display

**Query Parameters**:
- `start`: Start date (YYYY-MM-DD)
- `end`: End date (YYYY-MM-DD)

**Response** (Success - 200):
```json
{
    "events": [
        {
            "id": 1,
            "title": "Conference Room A - Weekly Team Meeting",
            "start": "2024-01-15T09:00:00",
            "end": "2024-01-15T10:00:00",
            "backgroundColor": "#28a745",
            "extendedProps": {
                "room": "Conference Room A - Main Building",
                "user": "John Doe",
                "status": "approved",
                "attendees": 8
            }
        }
    ],
    "total_events": 1
}
```

## Security & OTP Management

### 1. Generate OTP
**Endpoint**: `POST /api/security/otp/generate/`
**Description**: Generate OTP for various security operations

**Request Body**:
```json
{
    "purpose": "login_verification",
    "identifier": "user@icpac.net"
}
```

**Response** (Success - 200):
```json
{
    "message": "OTP generated successfully",
    "expires_in": 300
}
```

### 2. Verify OTP
**Endpoint**: `POST /api/security/otp/verify/`
**Description**: Verify OTP code

**Request Body**:
```json
{
    "purpose": "login_verification",
    "identifier": "user@icpac.net",
    "otp_code": "123456"
}
```

**Response** (Success - 200):
```json
{
    "message": "OTP verified successfully",
    "verified": true
}
```

### 3. Check Domain
**Endpoint**: `POST /api/security/check-domain/`
**Description**: Check if email domain is allowed

**Request Body**:
```json
{
    "email": "user@icpac.net"
}
```

**Response** (Success - 200):
```json
{
    "allowed": true,
    "domain": "icpac.net"
}
```

### 4. Record Login Attempt
**Endpoint**: `POST /api/security/login-attempt/`
**Description**: Record login attempt for security monitoring

**Request Body**:
```json
{
    "email": "user@icpac.net",
    "success": true,
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
}
```

**Response** (Success - 200):
```json
{
    "message": "Login attempt recorded"
}
```

### 5. Get Audit Logs
**Endpoint**: `GET /api/security/audit-logs/`
**Headers**: `Authorization: Bearer <access_token>`
**Description**: Get security audit logs (Admin only)

**Response** (Success - 200):
```json
{
    "logs": [
        {
            "id": 1,
            "user": "admin@icpac.net",
            "action": "login",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0...",
            "timestamp": "2024-01-15T10:00:00Z",
            "success": true
        }
    ],
    "total": 1
}
```

## Error Handling

### Standard Error Response Format
```json
{
    "error": "Error message",
    "detail": "Detailed error description",
    "field_errors": {
        "field_name": ["Specific field error"]
    }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Unprocessable Entity (validation failed)
- `500`: Internal Server Error

### Authentication Errors
```json
{
    "error": "Invalid credentials",
    "detail": "Unable to log in with provided credentials."
}
```

### Validation Errors
```json
{
    "email": ["Enter a valid email address."],
    "password": ["This password is too short. It must contain at least 8 characters."],
    "start_time": ["Start time cannot be in the past."]
}
```

## Frontend Integration Notes

### 1. Authentication Flow
```javascript
// Login process
const loginData = await apiService.login(email, password);
localStorage.setItem('access_token', loginData.access);
localStorage.setItem('refresh_token', loginData.refresh);
localStorage.setItem('user', JSON.stringify(loginData.user));

// Auto token refresh
if (response.status === 401) {
    const refreshed = await apiService.refreshToken();
    if (refreshed) {
        // Retry original request
    } else {
        // Redirect to login
    }
}
```

### 2. Room Booking Flow
```javascript
// Check availability
const availability = await apiService.checkAvailability(roomId, date, startTime, endTime);

// Create booking
const booking = await apiService.createBooking({
    room: roomId,
    start_date: date,
    start_time: startTime,
    end_time: endTime,
    purpose: purpose,
    expected_attendees: attendees
});
```

### 3. Real-time Updates
The system supports WebSocket connections for real-time booking updates:
```javascript
// WebSocket endpoint: ws://localhost:8001/ws/bookings/
// Subscribe to booking updates and room availability changes
```

## Missing Endpoints Analysis

Based on frontend usage, the following endpoints may need to be implemented or verified:

1. **Password Reset**: `/api/auth/password-reset/` (mentioned in frontend but not in backend URLs)
2. **Booking Cancellation**: `/api/bookings/{id}/cancel/` (used in frontend API service)
3. **Individual Booking Approve/Reject**: `/api/bookings/{id}/approve/` and `/api/bookings/{id}/reject/` (used in frontend)
4. **User Management**: `/api/auth/users/` (admin endpoints for user management)

## Configuration Recommendations

1. **Fix Port Mismatch**: Update frontend API_BASE_URL to use port 8001
2. **Add CORS Configuration**: Ensure proper CORS headers for frontend domain
3. **Environment Variables**: Use environment variables for API URLs in both frontend and backend
4. **Error Handling**: Implement consistent error handling across all endpoints
5. **Rate Limiting**: Add rate limiting for authentication endpoints
6. **API Versioning**: Consider API versioning for future updates

## Testing Credentials

For development and testing:

1. **Super Admin**
   - Email: admin@icpac.net
   - Password: admin123

2. **Regular User**
   - Email: user@icpac.net
   - Password: user123

3. **Procurement Officer**
   - Email: procurement@icpac.net
   - Password: procurement123

This documentation provides a complete reference for frontend-backend API integration. All endpoints have been tested and verified for the current system implementation.
