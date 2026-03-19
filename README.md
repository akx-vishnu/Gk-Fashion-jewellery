# 💎 GK Fashion Jewellery — Premium E-commerce

A high-performance, mobile-first e-commerce platform for premium artificial jewellery. Built with a luxurious gold theme, featuring real-time cart functionality, WhatsApp integration, and a secure administrative backend.

![GK Fashion Jewellery Logo](/logo.png)

---

## ✨ Key Experience
- **Luxurious Design**: A curated gold-themed UI (`#C8A97E`) with elegant typography (*Cormorant Garamond* & *Jost*).
- **Mobile-First Excellence**: 100% responsive architecture with custom breakpoints for modern smartphones.
- **WhatsApp Checkout**: Instant, itemized order generation sent directly to the store's contact.
- **PWA Capabilities**: Installable on Android and iOS for a native-like shopping and management experience.
- **Administrative Power**: Secure dashboard for real-time product management, inventory tracking, and archived items.

## 🛠️ Technology Stack

### Frontend
- **Vanilla ES6+ JavaScript**: High-performance logic without heavy framework overhead.
- **Modern CSS3**: Custom design tokens, CSS Grid/Flexbox, and smooth glassmorphism effects.
- **PWA**: Service Workers and Web Manifest for offline-ready features.

### Backend & API
- **Node.js & Express**: Scalable server architecture.
- **Supabase (PostgreSQL)**: Secure, real-time database for product storage.
- **Supabase Storage**: High-resolution image hosting with CDN optimization.
- **Vercel**: Serverless function deployment for global scalability.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+)
- Supabase Project

### 2. Quick Setup
```bash
git clone https://github.com/akx-vishnu/Gk-Fashion-jewellery.git
cd Gk-Fashion-jewellery
npm install
```

### 3. Environment Configuration
Copy the `.env.example` to `.env` and fill in your credentials:
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
ADMIN_USER=admin@example.com
ADMIN_PASS=your_secure_password
```

### 4. Database Schema
Execute the following SQL in your Supabase Dashboard:
```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  price numeric not null,
  category text checking (category in ('Necklace', 'Earrings', 'Ring', 'Bangle', 'Bridal Collection', 'Pendant with Earrings', 'Necklace with Earrings')),
  description text,
  image text,
  deleted_at timestamptz default null
);
```

---

## 📂 Project Structure

```text
├── api/             # Vercel Serverless Entry
├── backend/         # Server logic & Admin Dashboard
│   ├── server.js    # Express Application
│   └── index.html   # Admin Portal
├── public/          # Static assets & Icons
├── index.html       # Customer Landing Page
├── main.js          # Customer-side logic
└── style.css        # Global design system
```

## ☁️ Deployment
This project is pre-configured for **Vercel**. Simply connect your repository and add the environment variables identified in `.env.example`.

---
*Crafted for elegance. Fully optimized for growth.*

