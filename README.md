# Sonic Audio - E-Commerce Store

This is a full-stack e-commerce web application for audio products (headphones, speakers, earbuds). It was developed as a submission project for the IBM Internship Program.

## Features

- **Product Categories**: View different categories of products like Headphones, Speakers, and New Releases.
- **Product Details & Specs**: Click on any product to view its technical specifications, color options, and description.
- **Shopping Cart**: Add products to the cart and view the real-time subtotal in a slide-out panel.
- **Payment Gateway Simulation**: Interactive checkout form with credit card, UPI, net banking, and COD options.
- **Admin Dashboard**: A dashboard page (`admin.html`) to view order logs, newsletter subscribers, and customer feedback messages.
- **Offline Support**: The app has local fallback data so the frontend can function even if the backend server is not running.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Node.js, Express.js
- **Database**: Local JSON files (`data/orders.json`, `data/contacts.json`, `data/subscribers.json`)

## Folder Structure

```text
IBM/
├── data/
│   ├── contacts.json         # Stored contact form submissions
│   ├── orders.json           # Stored checkout orders
│   └── subscribers.json      # Stored newsletter emails
├── index.html                # Homepage
├── new-releases.html         # New releases page
├── headphones.html           # Headphones category page
├── speakers.html             # Speakers category page
├── about.html                # About us page & contact form
├── admin.html                # Admin dashboard page
├── script.js                 # Frontend JavaScript logic
├── style.css                 # Custom CSS stylesheet
├── server.js                 # Node.js backend server script
├── package.json              # Project dependencies & startup scripts
└── README.md                 # Project documentation
```

## How to Run Locally

### Prerequisites

Make sure you have **Node.js** installed on your system.

### Steps to Run

1. Open your terminal or command prompt inside the project folder (`IBM/`).
2. Install the required Node packages:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your browser and go to:
   ```text
   http://localhost:3000
   ```
5. You can open the admin dashboard by visiting:
   ```text
   http://localhost:3000/admin.html
   ```

## Deploying to Render.com

This application can be deployed for free on Render:

1. Push the project code (excluding `node_modules`) to a GitHub repository.
2. Log in to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following options:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Deploy Web Service**.

## Project Info

- **Developer**: Ansh Gupta
- **Internship**: IBM Internship Program Submission
- **Version**: 1.0.0
