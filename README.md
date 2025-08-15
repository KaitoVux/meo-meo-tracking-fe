# Business Expense Tracking System - Frontend

A modern React frontend application for managing business expenses with dark mode support, built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Dark Mode**: Default dark theme with light mode toggle
- **Authentication**: JWT-based authentication with role-based access control
- **State Management**: Zustand for efficient state management
- **Routing**: React Router with protected routes
- **Responsive Design**: Mobile-first responsive design
- **TypeScript**: Full TypeScript support for type safety

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **React Router** - Client-side routing
- **Zustand** - State management
- **Lucide React** - Icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── ui/              # Reusable UI components (Shadcn/ui)
├── lib/
│   └── utils.ts         # Utility functions
├── pages/               # Page components
├── store/               # Zustand stores
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## 🎨 UI Components

This project uses Shadcn/ui components with Tailwind CSS. Components are located in `src/components/ui/` and can be customized via the `components.json` configuration.

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🌙 Dark Mode

The application defaults to dark mode as per requirements. Users can toggle between light and dark themes using the theme switcher in the header.

## 🔐 Authentication

The frontend includes:

- JWT token management
- Role-based access control (Accountant/User roles)
- Protected routes
- Persistent authentication state

## 📱 Responsive Design

The application is built with a mobile-first approach and works seamlessly across:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

The application can be deployed to any static hosting service:

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## 📋 Requirements Fulfilled

This frontend implementation satisfies:

- ✅ Dark mode interface (Requirement 7.1)
- ✅ Copilot-style design patterns (Requirement 7.2)
- ✅ Drag-and-drop functionality support (Requirement 7.3)
- ✅ Modern responsive interface (Requirement 7.5)
- ✅ Role-based access control (Requirement 6.3)

## 🔗 Related

- [Backend API Documentation](../backend/README.md)
- [Project Requirements](../.kiro/specs/business-expense-tracking/requirements.md)
- [Design Document](../.kiro/specs/business-expense-tracking/design.md)# Linting and Code Quality

This project uses ESLint, Prettier, and Husky for code quality enforcement.

## Pre-commit Hooks

- Linting and formatting are automatically applied
- Commit messages must follow conventional commit format

## Available Scripts

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix auto-fixable linting errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
