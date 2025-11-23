# Deployment Guide (Render.com)

This guide explains how to deploy your Stock Management System to **Render.com** for free.

## Prerequisites
1.  A GitHub account.
2.  Your code pushed to a GitHub repository.

## Steps

### 1. Create a Database (MongoDB Atlas)
Since Render doesn't provide a free MongoDB database, we'll use **MongoDB Atlas**.
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2.  Create a **FREE** cluster.
3.  Create a database user (username/password). **Remember these!**
4.  Allow access from anywhere (IP `0.0.0.0/0`) in Network Access.
5.  Get your connection string (Driver: Node.js). It looks like:
    `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    *Replace `<password>` with your actual password.*

### 2. Deploy to Render
1.  Go to [Render.com](https://render.com/) and sign up/login.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `stock-management-app` (or any name)
    *   **Region**: Frankfurt (or nearest to you)
    *   **Branch**: `main` (or master)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Plan**: Free

### 3. Environment Variables
Scroll down to **Environment Variables** and add:
*   `MONGO_URI`: Paste your MongoDB Atlas connection string here.
*   `JWT_SECRET`: Enter a long random string (e.g., `mysecretkey123`).
*   `NODE_ENV`: `production`

### 4. Deploy
Click **Create Web Service**. Render will start building your app.
Once finished, you will get a URL like `https://stock-management-app.onrender.com`.

## Verification
1.  Open the URL.
2.  Login with your manager account.
3.  Test adding products and suppliers.

## Troubleshooting
*   **Logs**: Check the "Logs" tab in Render if the app fails to start.
*   **Database Connection**: Ensure your MongoDB user password doesn't have special characters that break the URL (or URL-encode them).
