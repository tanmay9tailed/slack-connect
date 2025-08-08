# SLACK-CONNECT

This application allows you to connect to Slack using OAuth. Once connected, you can directly send messages to channels, schedule messages for future delivery, and delete those scheduled messages.

---

## ✨ Core Requirements (DONE)

- **Secure Slack Connection & Token Management**:

  - Implement the OAuth 2.0 flow to connect to a Slack workspace.
  - The backend service must securely store both access and refresh tokens.
  - Implement refresh token logic to automatically obtain new access tokens when old ones expire, ensuring continuous service without user re-authentication.

- **Message Sending (Immediate & Scheduled)**:

  - Provide a UI to select a Slack channel and compose a message.
  - Allow users to send messages immediately to a channel.
  - Allow users to schedule messages for a specific future date and time. The backend must persist these messages and send them reliably at the designated time.

- **Scheduled Message Management**:
  - Display a list of all currently scheduled messages.
  - Enable users to cancel a scheduled message before its send time.

---

## 🚀 Detailed Setup Instructions

Instructions on how to clone, install, configure (e.g., Slack credentials), and run both the frontend and backend locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/tanmay9tailed/slack-connect.git
```

### 2️⃣ Setup the Backend

1.  Navigate to the backend folder:

    ```bash
    cd slack-connect/slack-connect-backend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the backend folder with your Slack app credentials and database details:

    ```ini
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    SLACK_CLIENT_ID=your_slack_client_id
    SLACK_CLIENT_SECRET=your_slack_client_secret
    SLACK_REDIRECT_URI=http://localhost:5173/connect-slack
    SLACK_SIGNING_SECRET=your_slack_signing_secret
    ```

4.  Run the backend server:
    ```bash
    npm run dev
    ```
    The backend should now be running at `http://localhost:5000`.

### 3️⃣ Setup the Frontend

1.  Open a new terminal and navigate to the frontend folder:

    ```bash
    cd ../slack-connect-frontend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the frontend folder:

    ```ini
    VITE_ClientID=your_slack_client_id
    VITE_RedirectURI=http://localhost:5173/connect-slack
    VITE_BackendURL=http://localhost:5000/api/v1
    ```

4.  Run the frontend:
    ```bash
    npm run dev
    ```
    The frontend should now be running at `http://localhost:5173`.

### 4️⃣ Configure Your Slack App (Required)

Before running the project, you must configure a Slack App in the Slack API Console.

**Step 1: Create a Slack App**

- Go to [Slack API: Your Apps](https://api.slack.com/apps).
- Click "Create New App".
- Choose "From scratch".
- Give it a name and select your development workspace.

**Step 2: Set Redirect URL**

- In your Slack App settings, go to `OAuth & Permissions`.
- Under Redirect URLs, add a new Redirect URL: `http://localhost:5173/connect-slack`
- Click "Save URLs".

**Step 3: Add Required OAuth Scopes**

- In `OAuth & Permissions` under **Bot Token Scopes**, add:
  - `channels:read` — to read the channel list
  - `chat:write` — to send messages
  - `chat:write.public` — to send messages in public channels without joining
  - `users:read` — to get user info
  - `team:read` — to get workspace info
- Under **User Token Scopes**, add:
  - `chat:write`
  - `channels:read`
  - `team:read`

**Step 4: Get Your Credentials**

- In **Basic Information**, copy your `Client ID`, `Client Secret`, and `Signing Secret`.
- Paste them into your `.env` files as shown above.

### 5️⃣ Test the Local Setup

- Open the frontend in your browser: `http://localhost:5173`.
- Click "Connect Slack" — it should redirect you to Slack's authorization page.
- Authorize the app — you should be redirected back to your app with your workspace connected.

---

## 🏗️ Architectural Overview

The application follows a **MERN + Slack API** architecture, integrating Slack OAuth for authentication, secure token storage, and backend-managed scheduled message delivery.

### Data Flow Diagram

```
Frontend (React + Vite)
   |  (User clicks "Connect Slack")
   v
Slack OAuth Page  <--->  Slack API
   | (Auth Code)
   v
Backend (Node.js + Express)
   | (Token Exchange & Storage)
   v
MongoDB (Stores tokens & scheduled messages)
   ^
   |
Scheduler (Node Cron/Interval)
   -> Checks DB -> Sends due messages -> Updates status
```

---

## 💡 Challenges & Key Learnings

This section details the challenges faced during development and the key implementation choices made.

### 1. State Management in React

Initially, managing state across different components was a challenge. Implementing **Redux** for global state management was new, and setting it up correctly in a full MERN stack project required learning about actions, reducers, and the store. Once the data flow in Redux was understood, state management became much more structured and predictable.

### 2. Implementing Slack OAuth

Slack OAuth was a new concept. The process began by reading the official Slack API documentation and creating a Slack App from scratch. This involved generating the **Client ID**, **Client Secret**, and **Signing Secret**, and configuring the **Redirect URL** in both the backend and frontend. Understanding the OAuth flow and setting the correct scopes (`channels:read`, `chat:write`, etc.) was initially confusing, but mapping out the process led to a successful integration.

### 3. Token Exchange & Refresh

By default, Slack can provide permanent access tokens, but to implement a more secure system, this project opted for **short-lived tokens with refresh tokens**. This involved:

- Enabling the token rotation option in the Slack App settings.
- Storing both access tokens and refresh tokens in MongoDB, along with their expiration times.
- Implementing a Node.js cron job that runs every 30 minutes to check if any user’s access token is about to expire. If so, it uses the refresh token to get a new access token and updates it in the database.

### 4. Custom Message Scheduling

While Slack provides a direct scheduling API, the project requirements called for a custom scheduling logic.

- When a message is scheduled, the system first checks if it’s due within the next 10 minutes.
  - If **yes**, a direct `setTimeout` is created to send the message at the exact time.
  - If **no**, it's stored in the database for a **Message Scheduler Job** (which runs every 10 minutes) to handle later.
- After a scheduled message is sent, it is deleted from the database to prevent unnecessary data growth.

### 5. Handling Server Restarts & Reliability

To ensure scheduled messages are sent even after a server restart, the scheduler checks the database on startup for any pending messages that are due in the next 10 minutes and sets timeouts for them accordingly. This ensures minimal disruption if the backend restarts.

### 6. Deleting Scheduled Messages

Deleting scheduled messages was a tricky part of the implementation.

- A `Map` was created to store the `messageId` and its corresponding `setTimeout` ID.
- If a user deletes a message before it is sent, the `setTimeout` is cleared using its ID, and the message entry is removed from the database.
- This approach provides a clean and reliable way to cancel scheduled messages without affecting other jobs.

---

## 🌐 Deployment

- **Live Link**: [https://slack-connect-omega.vercel.app/](https://slack-connect-omega.vercel.app/)
- **Frontend Deployed on Vercel**: [https://slack-connect-omega.vercel.app/](https://slack-connect-omega.vercel.app/)
- **Backend Deployed on Render**: [slack-connect-bv81.onrender.com/health](https://slack-connect-bv81.onrender.com/health)
  - _(Note: The backend is on a free tier and may take 50-60 seconds to start up if it has been inactive.)_
