# Garage-Connect: Technical Specification

This document outlines the finalized architecture, API design, and validation results for the **Garage-Connect** full-stack system.

## 🏁 Implementation Status

- **Backend Architecture**: 100% Implemented (Node.js/TypeScript)
- **Database Schema**: Implemented & Pushed (PostgreSQL)
- **Runtime Validation**: Passed (Integration Test Suite)
- **Frontend Integration**: 100% Implemented (Auth & Dashboards)
- **Seed/Demo Data**: Implemented & Verified
- **Role-Based Access Control**: Verified (Admin/Owner/Customer)
- **Deployment Readiness**: Verified (Environment Aware)

---

## 🏗️ Implemented Architecture

### 1. Unified User & Role System
The system uses a single `User` model linked to role-specific profiles (`Customer`, `Garage Owner`, `Admin`).
- **Authentication**: JWT-based stateless auth with bcrypt hashing.
- **Payload Structure**:
  ```json
  {
    "token": "JWT_TOKEN",
    "user": { "id": "UUID", "role": "CUSTOMER", "fullName": "Shubham" }
  }
  ```

### 2. Location-Aware Garage Profile
Garages support detailed location tracking including city, state, and pincode for accurate search filtering.
- **Owner Payload**:
  ```json
  {
    "email": "owner@fastfix.com",
    "password": "...",
    "fullName": "...",
    "role": "GARAGE_OWNER",
    "garage": {
      "garageName": "FastFix Ahmedabad",
      "address": "Navrangpura",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "pincode": "380009",
      "contactNo": "9876543210"
    }
  }
  ```

### 3. Service & Booking Engine
- **Service CRUD**: Owners can define services with specific Pricing Types (Fixed/Inspection) and Vehicle Support (2W/4W).
- **Booking Lifecycle**: `PENDING` → `APPROVED` → `IN_PROGRESS` → `COMPLETED`.
- **Validation**:
  - `totalAmount` is calculated server-side based on selected service prices.
  - Reviews are restricted to `COMPLETED` bookings only.
  - `Garage.rating` is a derived average of linked reviews.

---

## 🛠️ API Specification (Key Endpoints)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register/customer` | Register a new customer | No |
| **POST** | `/auth/login` | Unified login for all roles | No |
| **GET** | `/garages` | Search garages (verified only by default) | Yes |
| **POST** | `/bookings` | Create a new service booking | Customer |
| **PATCH** | `/bookings/:id/status` | Update booking state | Owner |
| **POST** | `/reviews` | Submit rating & feedback | Customer |
| **GET** | `/admin/reports` | Platform-wide stats | Admin |

---

## ✅ Validation Summary

The system has been rigorously validated against a live PostgreSQL database hosted in Docker. 
Completed checks include:
- **Auth Flows**: Successful registration, login, and token-based protected routes.
- **Role Boundaries**: Verified that Owners cannot access Admin panels and Customers cannot manage Garage services.
- **Data Persistence**: Confirmed that `npx prisma db push` and `db seed` create a consistent environment.
- **Integration**: Verified that the frontend successfully handles 401/403 errors and redirects to login when sessions expire.

---

*This document serves as the Technical Reference for the Garage-Connect v1.0 release.*
