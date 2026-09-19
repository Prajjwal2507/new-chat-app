# 🕊️ Pigeon — Real-Time Chat App & MCP Server

A full-stack real-time chat application built with the MERN stack and Socket.io, now tightly integrated with a **Model Context Protocol (MCP) server**. This setup allows AI agents (like Claude Desktop) to authenticate, read message history, fetch contacts, and send messages—all in real-time.

**Live Demo UI:** [new-chat-app-inky.vercel.app](https://new-chat-app-inky.vercel.app/)

---

## 🚀 Features

### Chat Application (Frontend & Backend)
- 🔐 **Secure Authentication:** JWT-based auth with secure HTTP-only cookies.
- 🔑 **API Key Generation:** Users can generate API keys to provide AI agents secure, token-based access without sharing passwords.
- 💬 **Real-time Messaging:** Private messaging via WebSockets (Socket.io).
- 🖼️ **Media Sharing:** Image sharing in chats via Cloudinary.
- 📧 **Email Notifications:** Automatic Welcome emails powered by Resend.
- 🟢 **Presence Tracking:** Online/offline indicators.
- 🔔 **Interactive UI:** Keyboard sound effects (with toggle) and animated gradient borders.
- 🖼️ **Profile Management:** Profile picture upload and custom API Key management.
- 📱 **Responsive Design:** Fully optimized for mobile and desktop views.

### MCP Server Integration
- 🤖 **AI Agent Bridge:** Connects Claude Desktop (or other AI agents) to your chat backend using secure API Keys.
- 🛠️ **Available Tools for AI:**
  - `auth_check_session` / `auth_update_profile`
  - `messages_get_contacts` / `messages_get_chats` / `messages_get_by_user`
  - `messages_send` (Send texts or images directly from Claude!)
- ⚡ **Real-time Sync:** AI agents can interact with the live WebSocket broadcasting system.

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React (Vite), Tailwind CSS, DaisyUI, Zustand, Axios, Socket.io Client, React-Hot-Toast |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, Cloudinary, Resend (Emails) |
| **MCP Server** | Node.js, @modelcontextprotocol/sdk, Axios |
| **Security** | Arcjet (rate-limiting & bot protection), HTTP-only Secure Cookies, SHA-256 API Key Hashing |
| **Deployment** | Vercel (Frontend), Render (Backend + MCP), UptimeRobot (Keep-alive) |

---

## 📂 Project Structure

```text
chat-app-combined/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # LoginPage, SignUpPage, ChatPage
│   │   ├── store/          # Zustand stores (auth, chat)
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # axios instance
│   └── .env                # Frontend environment variables
│
├── backend/                # Express + Node.js API
│   └── src/
│       ├── controllers/    # Auth, message controllers
│       ├── routes/         # API routes
│       ├── models/         # Mongoose models
│       ├── middleware/     # Auth middleware
│       └── lib/            # DB, socket, env config
│
└── chat-app-mcp/           # Model Context Protocol Server (Node.js)
    ├── index.js            # Main MCP server implementation
    ├── package.json        # NPM dependencies
    └── README.md           # MCP documentation
```

---

## 📦 How to Configure Claude Desktop for MCP

> **TL;DR** – Generate an API Key from your Chat App profile, add the JSON snippet below to your Claude Desktop configuration, and restart the app.

### 1️⃣ Generate an API Key
1. Log in to your Chat App account.
2. Go to your **Profile settings**.
3. Generate a new **API Key** and copy it to your clipboard.

### 2️⃣ Open the Config File

1. Open **Claude Desktop**.
2. Click the **hamburger menu (☰)** → **Settings**.
3. Go to **Developer** (under *Desktop app*).
4. Click **Edit Config** to open your `claude_desktop_config.json`.

### 3️⃣ Paste the MCP Server Entry

Add the `"chat-app"` object inside your `"mcpServers"` dictionary:

```json
{
  "mcpServers": {
    "chat-app": {
      "command": "npx",
      "args": ["-y", "chat-app-pigeon-mcp"],
      "env": {
        "CHAT_APP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```
*Note: Replace `YOUR_API_KEY_HERE` with the key you generated in step 1.*

### 4️⃣ Kill & Restart Claude Desktop

Fully quit Claude (do not just close the window) so it reloads the config:

**Windows (PowerShell):**
```powershell
Stop-Process -Name "Claude" -Force
```

**Windows (CMD):**
```cmd
taskkill /IM Claude.exe /F
```

**macOS (Terminal):**
```bash
pkill -x "Claude"
```

### 5️⃣ Verify & Use

The plug icon 🔌 will now show the available tools in Claude Desktop. Because you configured your API Key, you **do not** need to provide your email and password to Claude! Just start chatting. Try prompting:
- *"Claude, **list my chat contacts**."*
- *"Claude, check my messages with Keshav."*
- *"Claude, **send** a message to Keshav saying 'Hey, how are you?'"*

---

## 🔌 REST API Endpoints

Base URL: `http://localhost:5000` (Local)
Authentication: JWT-based via HTTP-only cookie (`jwt`)

### 1. Authentication Endpoints
- **`POST /api/auth/signup`** – Registers a new user.
- **`POST /api/auth/login`** – Logs in an existing user.
- **`POST /api/auth/logout`** – Logs out current user.
- **`PUT /api/auth/update-profile`** – Updates the authenticated user’s profile picture (requires Auth).
- **`GET /api/auth/check`** – Validates session and returns user data (requires Auth).
- **`POST /api/auth/generate-api-key`** – Generates a new API Key for the user (requires Auth).
- **`DELETE /api/auth/api-key`** – Revokes the user's current API Key (requires Auth).

### 2. Message Endpoints (Auth Required)
- **`GET /api/messages/contacts`** – Returns all users except the logged-in user.
- **`GET /api/messages/chats`** – Returns all unique chat partners for the current user.
- **`GET /api/messages/:id`** – Returns message history between the logged-in user and another user (`id`).
- **`POST /api/messages/send/:id`** – Sends a new message (text or image) to another user.

---

## 🛡️ Access Control & Security

- **`protectRoute` Middleware:** Verifies the `jwt` cookie using `ENV.JWT_SECRET`.
- **Cookie Settings:** `httpOnly: true`, `secure: true`, `sameSite: "none"` for cross-site cookie behavior.
- **Arcjet Integration:** Rate-limiting and bot protection applied to prevent abuse.

---

## 👨‍💻 Author

**Prajjwal** — [github.com/Prajjwal2507](https://github.com/Prajjwal2507)
