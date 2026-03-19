# GK Fashion Jewellery - Elegant Artificial Jewellery

A premium, high-performance e-commerce web application for artificial jewellery. This project features a modern UI with a luxurious gold theme, a fully functional shopping cart with WhatsApp integration, and a secure administrative backend for product management.

> [!IMPORTANT]
> **Project Description (for GitHub):**
> A modern, responsive e-commerce platform for premium artificial jewellery. Built with a Node.js/Express backend and a vanilla JS frontend, it features automated WhatsApp quote generation, a secure Supabase-powered product gallery, and 100% mobile optimization. Designed for elegance and seamless user experience.

## ✨ Key Features

- **💎 Premium UI/UX**: Luxurious Gold (`#C9A84C`) theme with Playfair Display typography, smooth animations, and warm hero overlays.
- **📱 Advanced Mobile-First Design**: Fully optimized responsive layout with hamburger navigation, `100svh` hero, 2-column product grid, and small-phone breakpoint support.
- **🛒 Smart Shopping Cart**: Real-time total calculation with persistent localStorage state and automatic product sync.
- **📲 WhatsApp Checkout**: Generates detailed itemized quotes sent directly to `+91 94877 24818`.
- **🛠️ Advanced Admin Dashboard**: Secure management of products (name, price, category, description) with:
  - **Soft Delete**: Move items to "Recently Removed" section for temporary archival.
  - **Bulk Actions**: Select multiple removed items for restoration or permanent deletion.
  - **Security**: Password-protected permanent deletion for increased safety.
  - **Custom Notification System**: Transition-based in-app toasts and modal dialogs replacing native browser alerts.
  - **PWA Ready**: Installable as a standalone app on mobile (GK Admin).
- **🎨 Polished Interactions**: Gold hover underline animations, gradient hero-to-section fade, custom animated cursor, and success/error toasts.
- **🚀 Optimized Performance**: Refined CSS with centralized design tokens, zero layout shifts, and SEO-friendly structure.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Properties / Design Tokens), JavaScript (ES6+)
- **Backend**: Node.js, Express.js (Serverless Ready)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage Buckets
- **Deployment**: Vercel (Configured via `vercel.json`)

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Supabase](https://supabase.com/) Account

### 2. Installation
```bash
git clone https://github.com/akx-vishnu/Gk-Fashion-jewellery.git
cd Gk-Fashion-jewellery/backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
ADMIN_USER=your_admin_email
ADMIN_PASS=your_admin_password
```

### 4. Database Setup
Run this SQL in your Supabase SQL Editor:
```sql
create table products (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  name text not null,
  price numeric not null,
  category text,
  description text,
  image text,
  deleted_at timestamptz default null
);
```
Create a **Public** storage bucket named `product-images`.

### 5. Running Locally
```bash
# In the backend folder
npm start
```
Then open `index.html` in your browser, or visit `http://localhost:5000`.

## ☁️ Deployment

### Vercel Deployment
1. Import your repository to Vercel.
2. The `vercel.json` is already configured for the backend functions.
3. In Vercel Project Settings, add all variables from your `.env` to the **Environment Variables** section.
4. Deploy!

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `@supabase/supabase-js` | Database & storage client |
| `multer` | Image upload handling |
| `cors` | Cross-origin resource sharing |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `dotenv` | Environment variable management |

## 📄 License
This project is licensed under the ISC License.

---
*Crafted for GK Fashion Jewellery. All rights reserved.*
