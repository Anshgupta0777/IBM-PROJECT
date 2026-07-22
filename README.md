# Sonic Audio — E-Commerce Web Application

Sonic Audio is a full-stack e-commerce web platform for personal audio equipment (headphones, wireless earbuds, smartwatches, and speakers). Built as a submission project for the **IBM Internship Program**, the project features a responsive frontend, an Express REST API backend, Google OAuth authentication, local JSON persistence with seamless offline fallback, and an admin management panel.

---

## Technical Highlights

- **Dynamic Storefront & Filtering**: Categorized views (`Headphones`, `Speakers`, `New Releases`) with real-time product search, modal specifications, and variant selection.
- **Cart & Payment Flow**: Client-side persistent shopping cart with interactive checkout modal supporting UPI, Credit/Debit cards, Net Banking, and COD.
- **Google OAuth & User Profiles**: Passport.js integration supporting Google single sign-on alongside local user session management.
- **Admin Dashboard**: Operational dashboard (`/admin.html`) to monitor live sales orders, customer inquiries, and newsletter subscriptions.
- **Resilient Fallback**: Designed with hybrid data access — if the Node server is offline, the frontend seamlessly degrades to client-side fallback product mock data.

---

## Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Auth & Security** | Passport.js, `passport-google-oauth20`, Express Sessions |
| **Data Storage** | Local JSON File Storage (`/data`) |

---

## Repository Structure

```text
IBM/
├── data/                      # Local JSON persistence directory
│   ├── contacts.json          # Form submission logs
│   ├── orders.json            # Customer checkout orders
│   ├── subscribers.json       # Newsletter subscriber emails
│   └── users.json             # Registered user profiles
├── images/                    # Local product assets & media
├── index.html                 # Main store homepage
├── new-releases.html          # New arrivals showcase
├── headphones.html            # Category page: Headphones & Earbuds
├── speakers.html              # Category page: Speakers & Soundbars
├── about.html                 # Brand story & contact form
├── admin.html                 # Admin portal for store management
├── login.html                 # Customer login & auth interface
├── orders.html                # User order history page
├── profile.html               # User profile settings page
├── script.js                  # Core frontend business logic & UI handler
├── style.css                  # Custom styling & design system
├── server.js                  # Express backend REST API & server logic
└── package.json               # Manifest file & dependencies
```

---

## REST API Reference

The Node backend exposes the following REST endpoints:

### Public & Store Endpoints
- `GET /api/products` — Retrieve all available audio products.
- `GET /api/auth/status` — Check backend configuration status for Google OAuth.
- `POST /api/orders` — Submit a new order.
- `GET /api/orders?email=<email>` — Fetch order history for a specific customer email.
- `POST /api/contact` — Log a contact form submission.
- `POST /api/subscribe` — Register an email for newsletter updates.

### Auth Endpoints
- `GET /auth/google` — Trigger Google OAuth 2.0 login flow.
- `GET /auth/google/callback` — Google OAuth redirect callback.
- `GET /api/user` — Get active session user info.
- `GET /logout` — Destroy current session.

### Admin Endpoints
- `GET /api/admin/data` — Retrieve aggregate system metrics (all orders, messages, and subscribers).

---

## Quick Start (Local Setup)

### Prerequisites
- **Node.js** (v14.0 or higher recommended)
- **npm** (included with Node.js)

### Installation

1. **Navigate to the project root**:
   ```bash
   cd IBM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional, for Google OAuth):
   Create a `.env` file or export environment variables:
   ```env
   PORT=3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   BASE_URL=http://localhost:3000
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Storefront: [http://localhost:3000](http://localhost:3000)
   - Admin Portal: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## Deployment (Render)

This application is ready for deployment on [Render](https://render.com/):

1. Push your repository to GitHub.
2. Create a new **Web Service** on Render and link your repository.
3. Configure the service settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BASE_URL`) in the Render dashboard if Google OAuth login is used.

---

## Project Metadata

- **Developer**: Ansh Gupta
- **Submission**: IBM Internship Program
- **Version**: 1.0.0
