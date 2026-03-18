# GK Fashion Jewellery - Tech Stack Analysis

This document provides a comprehensive overview of the technologies, tools, and architecture used in the GK Fashion Jewellery e-commerce platform.

---

## 🎨 Frontend (Client-Side)
The frontend is built using a high-performance, mobile-first **Vanilla Web Stack**, focusing on luxury aesthetics and fast loading times.

*   **Languages**: HTML5, CSS3, JavaScript (ES6+).
*   **Design System**: 
    *   **Theme**: A premium gold-themed UI (`#C9A84C`) with custom design tokens.
    *   **Typography**: *Playfair Display* for headings and *Inter* for body text (via Google Fonts).
*   **Key Features**:
    *   **Responsive Engine**: Fully optimized grid/flexbox layout for all screen sizes.
    *   **Shopping Cart**: Real-time cart system using `localStorage` for state persistence.
    *   **WhatsApp Checkout**: Itemized quote generator integrated with WhatsApp API.
    *   **PWA Support**: Offline-ready manifest for mobile installation.

---

## ⚙️ Backend (Server-Side)
The backend is a **Node.js** architecture designed for modularity and easy cloud deployment.

*   **Runtime**: Node.js.
*   **Framework**: Express.js.
*   **Security Architecture**: 
    *   `helmet`: Automated security headers.
    *   `cors`: Cross-Origin Resource Sharing control.
    *   `express-rate-limit`: Anti-abuse and brute-force protection.
*   **File Processing**: `multer` for secure, in-memory image buffer handling.
*   **Vercel Integration**: Optimized as a set of Serverless Functions (proxied via `/api`).

---

## 💾 Database & Cloud Services
A **Backend-as-a-Service (BaaS)** approach ensures scalability and minimal maintenance.

*   **Primary Database**: Supabase (PostgreSQL) for product management.
*   **Cloud Storage**: Supabase Storage Buckets for high-resolution product images.
*   **Environment Management**: `dotenv` for secure credential handling.

---

## 🚀 Deployment & Monitoring
The application is optimized for modern CI/CD workflows and performance tracking.

*   **Hosting Platform**: Vercel.
*   **Observability**: Integrated with Vercel Web Analytics and Speed Insights for real-time user metrics.
*   **Performance Optimization**: Centralized CSS variables and standard directory structure for fast deployments.

---
*Documented on: 2026-03-18*
