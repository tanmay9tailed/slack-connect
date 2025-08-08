# SLACK-CONNECT

Slack Connect is an application that enables users to connect their Slack workspace and send messages, both instantly and scheduled as well.

---

## ✅ Core Requirements (Done)

### 1. Secure Slack Connection & Token Management

- Implement the OAuth 2.0 flow to connect to a Slack workspace.
- Your backend service must securely store both access and refresh tokens.
- Implement refresh token logic to automatically obtain new access tokens when old ones expire, ensuring continuous service without user re-authentication.

### 2. Message Sending (Immediate & Scheduled)

- Provide a UI to select a Slack channel and compose a message.
- Allow users to send the message immediately to a channel.
- Allow users to schedule the message for a specific future date and time. Your backend must persist scheduled messages and reliably send them at the designated time.

### 3. Scheduled Message Management

- Display a list of all currently scheduled messages.
- Enable users to cancel a scheduled message before its send time.

---

## 🛠️ Detailed Setup Instructions

### 🔁 Clone the Repository

```bash
git clone https://github.com/tanmay9tailed/slack-connect.git
```

### 🔧 Setup the Backend

1. Navigate to the backend folder:

```bash
cd slack-connect/slack-connect-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder with your Slack app credentials and database details:

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string

SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:5173/connect-slack
SLACK_SIGNING_SECRET=your_slack_signing_secret
```

> 📌 **How to get Slack credentials**
>
> - Go to [Slack API: Your Apps](https://api.slack.com/apps)
> - Create a new Slack app (or select an existing one)
> - Set Redirect URL to `http://localhost:5173/connect-slack`
> - Enable OAuth & Permissions
> - Copy Client ID, Client Secret, and Signing Secret from the Slack App settings.

4. Run the backend server:

```bash
npm run dev
```

> The backend should now be running at: `http://localhost:5000`

---

### 💻 Setup the Frontend

1. Open a new terminal and navigate to the frontend folder:

```bash
cd ../slack-connect-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend folder:

```ini
VITE_ClientID=your_slack_client_id
VITE_RedirectURI=http://localhost:5173/connect-slack
VITE_BackendURL=http://localhost:5000/api/v1
```

4. Run the frontend:

```bash
npm run dev
```

> The frontend should now be running at: `http://localhost:5173`

---

### ⚙️ Configure Your Slack App (Required)

#### Step 1: Create a Slack App

- Go to [Slack API: Your Apps](https://api.slack.com/apps)
- Click **"Create New App"**
- Choose **From scratch**
- Give it a name (e.g., Slack Connect App) and select your development workspace.

#### Step 2: Set Redirect URL

- In your Slack App settings, go to **OAuth & Permissions**
- Under **Redirect URLs**, click **Add a new Redirect URL** and enter:

```bash
http://localhost:5173/connect-slack
```

- Click **Save URLs**

#### Step 3: Add Required OAuth Scopes

##### Under **Bot Token Scopes**, add:

- `channels:read`
- `chat:write`
- `chat:write.public`
- `users:read`
- `team:read`

##### Under **User Token Scopes** (if your app uses them), add:

- `chat:write`
- `channels:read`
- `team:read`

#### Step 4: Get Your Credentials

- In **Basic Information**, copy:
  - Client ID
  - Client Secret
  - Signing Secret
- Paste them into your `.env` files as shown above.

---

### 🧪 Test the Local Setup

1. Open the frontend in your browser:  
   👉 [http://localhost:5173](http://localhost:5173)

2. Click **Connect Slack** — it should redirect you to Slack's authorization page.

3. Authorize the app — you should be redirected back to your app with your workspace connected.

---

### 📝 Notes

- **CORS issues** — Ensure the backend allows requests from `http://localhost:5173`.
- **Environment variables** — Never commit `.env` files to GitHub.
- **Slack App Scopes** — If your app needs additional functionality, update the scopes in Slack App settings.

---

## 🏗️ Architectural Overview

The Slack Connect application follows a **MERN + Slack API** architecture, integrating:

- Slack OAuth for authentication
- Secure token storage
- Backend-managed scheduled message delivery

### 🌐 Flow

1. User clicks **"Connect Slack"** in the frontend  
   → Redirects to Slack's OAuth page with `client_id`, `redirect_uri`, and scopes

2. Slack Authorization — User approves access for the app

3. Slack redirects to frontend with an **authorization code**

4. Frontend sends the code to backend via `/api/v1/slack/oauth`

5. Backend exchanges the code for an **Access Token and Refresh Token** using Slack's OAuth API

6. Backend stores the tokens securely in **MongoDB** along with:
   - Workspace info
   - User info
   - Expiration time

![Slack Connect Workflow](<https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.07%20PM%20(1).jpeg> "Slack Connect Workflow")

> 📌 Scopes Used:  
> `channels:read`, `chat:write`, `chat:write.public`, `users:read`, `team:read`

---

### ⌚ Token Refreshing

The app refreshes the slack access tokens before they expire using a cron job running every 30 minutes.
Slack access_tokens expire every 12 hours. They need to be refreshed before they expire.

#### Flow:

1. The Job checks the DB for tokens expiring in next 30 minutes.

2. Refresh requests are sent to Slack using the refresh_token for each access_token.

3. New access_token and refresh_token is saved in DB.

![Token Refresh Job](https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.07%20PM.jpeg "Logo Title Text 1")

---

### 🕐 Scheduled Task Handling

The app allows users to schedule Slack messages for future delivery using a cron job running 10 minutes.

#### Flow:

1. User schedules a message via the frontend (channel, text, time)

2. Frontend sends the request to backend (`api/v1/slack/schedule-message` endpoint)

3. Backend stores the message in MongoDB with:

   - Scheduled Message ID
   - Channel ID
   - Message text
   - Scheduled timestamp
   - Status (pending, scheduled)

4. **Scheduler Service (Node.js cron)**:

   - Runs in a fixed interval of 10 minutes.
   - Checks for due messages in the next 10 minutes.
   - Schedules them using `setTimeout`, which sends the message and deletes the scheduled message from DB.
   - Stores `setTimeout` ID in a in-memory map.
   - Updates status to `scheduled`.

5. **Restart Handling**:
   - In case the server restarts during deployments, the existing setTimeouts will be cleared from memory.
   - To tackle that, on server startup, we check DB for pending messages due now and process them.

![Schedule Message Job](https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.06%20PM.jpeg "Logo Title Text 1")

---

### 📊 Data Flow Diagram

```rust
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

Scheduler (Node Cron/Interval)
   -> Checks DB -> Sends due messages -> Updates status
```

---

## 🤯 Challenges & Learnings

### 1. State Management in React

- Faced challenges with global state management
- Learned and implemented Redux for predictable data flow

### 2. Implementing Slack OAuth

- Started from Slack's docs and learned the OAuth flow
- Integrated OAuth with custom scopes and redirect URI handling

### 3. Token Exchange & Refresh

- Used short-lived tokens with refresh tokens for security
- Stored tokens with expiration in MongoDB
- Setup a cron job to refresh tokens 30 mins before expiry

### 4. Custom Message Scheduling

- Built custom logic for Slack message scheduling
  - If <10 min: used `setTimeout`
  - Else: stored for cron job to handle
- Removed sent messages to reduce data bloat

### 5. Handling Server Restarts

- On startup, scheduler preloads near-due messages and reschedules them
- Ensures reliable delivery even after unexpected server shutdowns

### 6. Deleting Scheduled Messages

- Used a `Map` to store messageId with `setTimeout` reference
- Cleared timers and removed from DB on cancel

---

## 📚 Key Learnings

- Improved understanding of **OAuth 2.0** and Slack API integration
- Designed a robust scheduling system with **restart reliability**
- Hands-on experience with **Redux** for state management
- Learned token lifecycle management with **cron jobs**

---

## 🔗 Live Links

- **Frontend on Vercel:** [https://slack-connect-omega.vercel.app/](https://slack-connect-omega.vercel.app/)
- **Backend Health Check (Render):**  
  [https://slack-connect-bv81.onrender.com/health](https://slack-connect-bv81.onrender.com/health)
  > ⚠️ First request may take 50–60 sec due to Render's cold start

---

## ✨ Summary of Features

- Slack OAuth 2.0 login
- Secure token storage & refresh
- Message scheduling with custom logic
- Cancel scheduled messages
- Reliable job queueing & delivery
- Restart-resilient backend scheduler

---

## 📬 Contact

For questions or improvements, feel free to raise an issue or pull request.

---

**Happy Slacking! 🚀**# SLACK-CONNECT

Slack Connect is an application that enables users to connect their Slack workspace and send messages, both instantly and scheduled as well.

---

## ✅ Core Requirements (Done)

### 1. Secure Slack Connection & Token Management

- Implement the OAuth 2.0 flow to connect to a Slack workspace.
- Your backend service must securely store both access and refresh tokens.
- Implement refresh token logic to automatically obtain new access tokens when old ones expire, ensuring continuous service without user re-authentication.

### 2. Message Sending (Immediate & Scheduled)

- Provide a UI to select a Slack channel and compose a message.
- Allow users to send the message immediately to a channel.
- Allow users to schedule the message for a specific future date and time. Your backend must persist scheduled messages and reliably send them at the designated time.

### 3. Scheduled Message Management

- Display a list of all currently scheduled messages.
- Enable users to cancel a scheduled message before its send time.

---

## 🛠️ Detailed Setup Instructions

### 🔁 Clone the Repository

```bash
git clone https://github.com/tanmay9tailed/slack-connect.git
```

### 🔧 Setup the Backend

1. Navigate to the backend folder:

```bash
cd slack-connect/slack-connect-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder with your Slack app credentials and database details:

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string

SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:5173/connect-slack
SLACK_SIGNING_SECRET=your_slack_signing_secret
```

> 📌 **How to get Slack credentials**
>
> - Go to [Slack API: Your Apps](https://api.slack.com/apps)
> - Create a new Slack app (or select an existing one)
> - Set Redirect URL to `http://localhost:5173/connect-slack`
> - Enable OAuth & Permissions
> - Copy Client ID, Client Secret, and Signing Secret from the Slack App settings.

4. Run the backend server:

```bash
npm run dev
```

> The backend should now be running at: `http://localhost:5000`

---

### 💻 Setup the Frontend

1. Open a new terminal and navigate to the frontend folder:

```bash
cd ../slack-connect-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend folder:

```ini
VITE_ClientID=your_slack_client_id
VITE_RedirectURI=http://localhost:5173/connect-slack
VITE_BackendURL=http://localhost:5000/api/v1
```

4. Run the frontend:

```bash
npm run dev
```

> The frontend should now be running at: `http://localhost:5173`

---

### ⚙️ Configure Your Slack App (Required)

#### Step 1: Create a Slack App

- Go to [Slack API: Your Apps](https://api.slack.com/apps)
- Click **"Create New App"**
- Choose **From scratch**
- Give it a name (e.g., Slack Connect App) and select your development workspace.

#### Step 2: Set Redirect URL

- In your Slack App settings, go to **OAuth & Permissions**
- Under **Redirect URLs**, click **Add a new Redirect URL** and enter:

```bash
http://localhost:5173/connect-slack
```

- Click **Save URLs**

#### Step 3: Add Required OAuth Scopes

##### Under **Bot Token Scopes**, add:

- `channels:read`
- `chat:write`
- `chat:write.public`
- `users:read`
- `team:read`

##### Under **User Token Scopes** (if your app uses them), add:

- `chat:write`
- `channels:read`
- `team:read`

#### Step 4: Get Your Credentials

- In **Basic Information**, copy:
  - Client ID
  - Client Secret
  - Signing Secret
- Paste them into your `.env` files as shown above.

---

### 🧪 Test the Local Setup

1. Open the frontend in your browser:  
   👉 [http://localhost:5173](http://localhost:5173)

2. Click **Connect Slack** — it should redirect you to Slack's authorization page.

3. Authorize the app — you should be redirected back to your app with your workspace connected.

---

### 📝 Notes

- **CORS issues** — Ensure the backend allows requests from `http://localhost:5173`.
- **Environment variables** — Never commit `.env` files to GitHub.
- **Slack App Scopes** — If your app needs additional functionality, update the scopes in Slack App settings.

---

## 🏗️ Architectural Overview

The Slack Connect application follows a **MERN + Slack API** architecture, integrating:

- Slack OAuth for authentication
- Secure token storage
- Backend-managed scheduled message delivery

### 🌐 Flow

1. User clicks **"Connect Slack"** in the frontend  
   → Redirects to Slack's OAuth page with `client_id`, `redirect_uri`, and scopes

2. Slack Authorization — User approves access for the app

3. Slack redirects to frontend with an **authorization code**

4. Frontend sends the code to backend via `/api/v1/slack/oauth`

5. Backend exchanges the code for an **Access Token and Refresh Token** using Slack's OAuth API

6. Backend stores the tokens securely in **MongoDB** along with:
   - Workspace info
   - User info
   - Expiration time

![Slack Connect Workflow](<https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.07%20PM%20(1).jpeg> "Slack Connect Workflow")

> 📌 Scopes Used:  
> `channels:read`, `chat:write`, `chat:write.public`, `users:read`, `team:read`

---

### ⌚ Token Refreshing

The app refreshes the slack access tokens before they expire using a cron job running every 30 minutes.
Slack access_tokens expire every 12 hours. They need to be refreshed before they expire.

#### Flow:

1. The Job checks the DB for tokens expiring in next 30 minutes.

2. Refresh requests are sent to Slack using the refresh_token for each access_token.

3. New access_token and refresh_token is saved in DB.

![Token Refresh Job](https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.07%20PM.jpeg "Logo Title Text 1")

---

### 🕐 Scheduled Task Handling

The app allows users to schedule Slack messages for future delivery using a cron job running 10 minutes.

#### Flow:

1. User schedules a message via the frontend (channel, text, time)

2. Frontend sends the request to backend (`api/v1/slack/schedule-message` endpoint)

3. Backend stores the message in MongoDB with:

   - Scheduled Message ID
   - Channel ID
   - Message text
   - Scheduled timestamp
   - Status (pending, scheduled)

4. **Scheduler Service (Node.js cron)**:

   - Runs in a fixed interval of 10 minutes.
   - Checks for due messages in the next 10 minutes.
   - Schedules them using `setTimeout`, which sends the message and deletes the scheduled message from DB.
   - Stores `setTimeout` ID in a in-memory map.
   - Updates status to `scheduled`.

5. **Restart Handling**:
   - In case the server restarts during deployments, the existing setTimeouts will be cleared from memory.
   - To tackle that, on server startup, we check DB for pending messages due now and process them.

![Schedule Message Job](https://raw.githubusercontent.com/tanmay9tailed/slack-connect/refs/heads/main/docs/WhatsApp%20Image%202025-08-08%20at%202.20.06%20PM.jpeg "Logo Title Text 1")

---

### 📊 Data Flow Diagram

```rust
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

Scheduler (Node Cron/Interval)
   -> Checks DB -> Sends due messages -> Updates status
```

---

## 🤯 Challenges & Learnings

### 1. State Management in React

- Faced challenges with global state management
- Learned and implemented Redux for predictable data flow

### 2. Implementing Slack OAuth

- Started from Slack's docs and learned the OAuth flow
- Integrated OAuth with custom scopes and redirect URI handling

### 3. Token Exchange & Refresh

- Used short-lived tokens with refresh tokens for security
- Stored tokens with expiration in MongoDB
- Setup a cron job to refresh tokens 30 mins before expiry

### 4. Custom Message Scheduling

- Built custom logic for Slack message scheduling
  - If <10 min: used `setTimeout`
  - Else: stored for cron job to handle
- Removed sent messages to reduce data bloat

### 5. Handling Server Restarts

- On startup, scheduler preloads near-due messages and reschedules them
- Ensures reliable delivery even after unexpected server shutdowns

### 6. Deleting Scheduled Messages

- Used a `Map` to store messageId with `setTimeout` reference
- Cleared timers and removed from DB on cancel

---

## 📚 Key Learnings

- Improved understanding of **OAuth 2.0** and Slack API integration
- Designed a robust scheduling system with **restart reliability**
- Hands-on experience with **Redux** for state management
- Learned token lifecycle management with **cron jobs**

---

## 🔗 Live Links

- **Frontend on Vercel:** [https://slack-connect-omega.vercel.app/](https://slack-connect-omega.vercel.app/)
- **Backend Health Check (Render):**  
  [https://slack-connect-bv81.onrender.com/health](https://slack-connect-bv81.onrender.com/health)
  > ⚠️ First request may take 50–60 sec due to Render's cold start

---

## ✨ Summary of Features

- Slack OAuth 2.0 login
- Secure token storage & refresh
- Message scheduling with custom logic
- Cancel scheduled messages
- Reliable job queueing & delivery
- Restart-resilient backend scheduler

---

## 📬 Contact

For questions or improvements, feel free to raise an issue or pull request.

---

**Happy Slacking! 🚀**
