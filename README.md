# Retriever's Essentials - UMBC Student Pantry Inventory Management System

## Overview
Retriever's Essentials is a comprehensive inventory management system designed for UMBC's student pantry. The application helps manage inventory, track vendors, and handle transactions efficiently. It features a modern web interface built with Next.js and a robust backend API using Express.js.

## Features

### Inventory Management
- Add, edit, and remove items from inventory
- Track item quantities and weights
- Categorize items by type (Grain, Lentil, Legume, Snack, etc.)
- View detailed item information including descriptions and prices

### Vendor Management
- Manage vendor information and contact details
- Track items associated with each vendor
- View vendor-specific inventory

### User Interface
- Modern, responsive design
- Intuitive navigation
- Real-time updates
- Error handling and success notifications
- Mobile-friendly layout

## Technical Stack

### Frontend
- Next.js 14 (React framework)
- CSS Modules for styling
- Context API for state management
- Fetch API for HTTP requests

### Backend
- Express.js
- MySQL database
- RESTful API architecture
- JWT authentication

## Project Structure

### Frontend (`/frontend`)
```
frontend/
├── app/                 # Next.js app directory
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── admin/          # Admin-specific pages
│   └── vendors/        # Vendor management pages
├── styles/             # CSS modules
└── public/             # Static assets
```

### Backend (`/backend`)
```
backend/
├── controllers/        # Request handlers
├── routes/            # API route definitions
├── middleware/        # Custom middleware
└── db.js             # Database connection
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- PowerShell (for Windows users)

### Database Setup
1. Create a MySQL database
2. Import the schema from `database/schema.sql`
3. Update the database credentials in `backend/.env`

### Backend Setup
```powershell
cd backend
npm install
npm start
```
The backend server will run on port 5000.

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
The frontend development server will run on port 3000.

## API Endpoints

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/update-quantity` - Update item quantity

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/:id/items` - Get vendor's items

```
