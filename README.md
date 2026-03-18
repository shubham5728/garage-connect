# 🚗 Garage-Connect

**Garage-Connect** is a comprehensive, full-stack ecosystem designed to bridge the gap between vehicle owners and local garages. This platform streamlines the entire automotive service lifecycle—from discovery and booking to status tracking and review management.

## 🚦 Project Status: Core MVP Complete
> **Garage Connect is a live, demo-ready MVP with verified end-to-end customer booking flow and key garage-owner booking actions.** Advanced features such as reviews, admin workflows, and full owner management are implemented but pending production verification.
> 
> * **Backend API**: Verified for core MVP flows (Auth, Garage Search, Bookings, Vehicles)
> * **Frontend Natural Flow**: Verified (Signup → Login → Search → Book → See Bookings → Logout)
> * **Production Environment**: Live on Vercel (Frontend) and Render (Backend)

---

## 🏗️ System Architecture

The application follows a **Decoupled Client-Server Architecture**, ensuring scalability and clear separation of concerns.

```mermaid
graph TD
    subgraph Frontend [Client Layer]
        A[Vanilla HTML/CSS/JS] --> B[API Utility - fetch]
    end

    subgraph Backend [Server Layer]
        C[Node.js / Express] --> D[TypeScript]
        D --> E[Prisma ORM]
        E --> F[PostgreSQL]
    end

    subgraph Security [Security & Middleware]
        G[JWT Authentication]
        H[bcrypt Hashing]
        I[Zod Validation]
        J[Role-Based Access Control]
    end

    B <--> C
    C --- G
    C --- I
    C --- J
```

### 🗄️ Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o| CUSTOMER : "is"
    USER ||--o| ADMIN : "is"
    USER ||--o| GARAGE : "owns"
    
    CUSTOMER ||--o{ VEHICLE : "owns"
    CUSTOMER ||--o{ BOOKING : "makes"
    CUSTOMER ||--o{ REVIEW : "writes"
    
    GARAGE ||--o{ SERVICE : "offers"
    GARAGE ||--o{ BOOKING : "receives"
    GARAGE ||--o{ REVIEW : "receives"
    
    BOOKING ||--o{ BOOKING_ITEM : "contains"
    SERVICE ||--o{ BOOKING_ITEM : "included_in"
    
    VEHICLE ||--o{ BOOKING : "booked"
```

### 🔄 System Flow (Booking Process)

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant O as Garage Owner

    C->>F: Search & Select Garage
    F->>B: GET /api/garages/:id
    B->>D: Fetch Details
    D-->>B: Data
    B-->>F: Garage JSON
    F-->>C: Display Details

    C->>F: Select Services & Date
    C->>F: Confirm Booking
    F->>B: POST /api/bookings
    B->>D: Create PENDING Booking
    D-->>B: Success
    B-->>F: Booking Created
    F-->>C: Success Message

    O->>F: View Dashboard
    F->>B: GET /api/bookings/garage/:id
    B-->>F: Bookings List
    O->>F: Click Approve
    F->>B: PATCH /api/bookings/:id/status (APPROVED)
    B->>D: Update Status
    B-->>F: Success
```

---

## 🚀 Key Features

### 👤 For Customers (Vehicle Owners)
- **Smart Search**: Find garages based on location, ratings, or specific services.
- **Booking Engine**: Schedule appointments, select multiple services, and track status.
- **Vehicle Management**: Maintain a virtual garage of your owned vehicles (2-wheelers & 4-wheelers).
- **Review System**: Rate and review services after a job is completed.

### 🛠️ For Garage Owners
- **Service Management**: Define your menu of services with custom pricing and vehicle support.
- **Dashboard Analytics**: Track revenue, daily booking counts, and average ratings.
- **Booking Queue**: Approve, cancel, or update the status of incoming service requests.
- **Profile Customization**: Update garage details, contact info, and branding.

### 🛡️ For Administrators
- **Moderation**: Monitor and manage all users, garages, and activities across the platform.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3, Modern JavaScript (ES6+), FontAwesome |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Validation** | Zod |
| **Security** | JSON Web Tokens (JWT), bcrypt.js |

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via Docker)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/garage_connect"
JWT_SECRET="your_secure_random_secret"
NODE_ENV=development
```

Push the database schema & seed demo data:
```bash
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Frontend Setup
Simply open `index.html` in your favorite browser or use a VS Code extension like **Live Server**.

---

## 🔑 Demo Accounts
Use these credentials to explore the platform after seeding:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@test.com` | `password123` |
| **Garage Owner** | `owner@fastfix.com` | `password123` |
| **Admin** | `admin@garageconnect.com` | `password123` |

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed with ❤️ as a Comprehensive Automotive Solution.*
