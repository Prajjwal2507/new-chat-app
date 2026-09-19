# Chat App REST API Endpoints for MCP Server

This document lists all REST API endpoints exposed by the backend of the chat application, along with request details, auth requirements, and expected payloads.

Base URL:
- Local: `http://localhost:5000`

Authentication:
- The app uses JWT-based authentication via a cookie named `jwt`.
- Protected routes are guarded by the `protectRoute` middleware.
- The cookie is set during signup and login and cleared during logout.

---

## 1. Authentication Endpoints

### 1.1 POST /api/auth/signup

Registers a new user.

- Method: `POST`
- Path: `/api/auth/signup`
- Auth required: No
- Request body:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "123456"
  }
  ```
- Validation:
  - `fullName`, `email`, and `password` are required
  - `password` must be at least 6 characters
  - email must be in valid format
  - email must not already exist
- Success response: `201 Created`
  ```json
  {
    "_id": "mongo_object_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": ""
  }
  ```
- Error responses:
  - `400 Bad Request` if missing/invalid data or duplicate email
  - `500 Internal Server Error`
- Notes:
  - Sets the `jwt` authentication cookie.
  - Sends a welcome email in the background if email sending succeeds.

---

### 1.2 POST /api/auth/login

Logs in an existing user.

- Method: `POST`
- Path: `/api/auth/login`
- Auth required: No
- Request body:
  ```json
  {
    "email": "john@example.com",
    "password": "123456"
  }
  ```
- Validation:
  - `email` and `password` are required
- Success response: `200 OK`
  ```json
  {
    "_id": "mongo_object_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": ""
  }
  ```
- Error responses:
  - `400 Bad Request` for invalid credentials
  - `500 Internal Server Error`
- Notes:
  - Sets the `jwt` authentication cookie.

---

### 1.3 POST /api/auth/logout

Logs out the current user.

- Method: `POST`
- Path: `/api/auth/logout`
- Auth required: No
- Success response: `200 OK`
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- Notes:
  - Clears the `jwt` cookie.

---

### 1.4 PUT /api/auth/update-profile

Updates the authenticated user’s profile picture.

- Method: `PUT`
- Path: `/api/auth/update-profile`
- Auth required: Yes
- Request body:
  ```json
  {
    "profilePic": "data:image/jpeg;base64,..." 
  }
  ```
- Validation:
  - `profilePic` is required
- Success response: `200 OK`
  - Returns the updated user object
- Error responses:
  - `400 Bad Request` if `profilePic` missing
  - `500 Internal Server Error`
- Notes:
  - Uploads the image to Cloudinary.
  - Updates the `profilePic` field in the user record.

---

### 1.5 GET /api/auth/check

Returns the authenticated user data for session validation.

- Method: `GET`
- Path: `/api/auth/check`
- Auth required: Yes
- Success response: `200 OK`
  ```json
  {
    "_id": "mongo_object_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": "",
    "createdAt": "2026-08-13T12:00:00.000Z",
    "updatedAt": "2026-08-13T12:00:00.000Z"
  }
  ```
- Error responses:
  - `401 Unauthorized` if token missing/invalid
  - `404 Not Found` if user not found
  - `500 Internal Server Error`

---

## 2. Message Endpoints

### 2.1 GET /api/messages/contacts

Returns all users except the logged-in user.

- Method: `GET`
- Path: `/api/messages/contacts`
- Auth required: Yes
- Success response: `200 OK`
  ```json
  [
    {
      "_id": "mongo_object_id",
      "fullName": "Alice",
      "email": "alice@example.com",
      "profilePic": "",
      "createdAt": "2026-08-13T12:00:00.000Z",
      "updatedAt": "2026-08-13T12:00:00.000Z"
    }
  ]
  ```
- Error responses:
  - `500 Internal Server Error`

---

### 2.2 GET /api/messages/chats

Returns all unique chat partners for the current user.

- Method: `GET`
- Path: `/api/messages/chats`
- Auth required: Yes
- Success response: `200 OK`
  ```json
  [
    {
      "_id": "mongo_object_id",
      "fullName": "Alice",
      "email": "alice@example.com",
      "profilePic": "",
      "createdAt": "2026-08-13T12:00:00.000Z",
      "updatedAt": "2026-08-13T12:00:00.000Z"
    }
  ]
  ```
- Behavior:
  - Reads all messages involving the logged-in user
  - Extracts unique counterpart IDs
  - Fetches the related user documents
- Error responses:
  - `500 Internal Server Error`

---

### 2.3 GET /api/messages/:id

Returns message history between the logged-in user and another user.

- Method: `GET`
- Path: `/api/messages/:id`
- Auth required: Yes
- Path parameter:
  - `id`: the other user’s Mongo ObjectId
- Success response: `200 OK`
  ```json
  [
    {
      "_id": "mongo_object_id",
      "senderId": "user_a_id",
      "receiverId": "user_b_id",
      "text": "Hello",
      "image": "",
      "createdAt": "2026-08-13T12:00:00.000Z",
      "updatedAt": "2026-08-13T12:00:00.000Z"
    }
  ]
  ```
- Error responses:
  - `500 Internal Server Error`

---

### 2.4 POST /api/messages/send/:id

Sends a new message to another user.

- Method: `POST`
- Path: `/api/messages/send/:id`
- Auth required: Yes
- Path parameter:
  - `id`: receiver user ID
- Request body:
  ```json
  {
    "text": "Hi there",
    "image": "data:image/jpeg;base64,..."
  }
  ```
- Validation:
  - at least one of `text` or `image` must be provided
  - user cannot message themselves
  - receiver must exist
- Success response: `201 Created`
  ```json
  {
    "_id": "mongo_object_id",
    "senderId": "user_a_id",
    "receiverId": "user_b_id",
    "text": "Hi there",
    "image": "https://res.cloudinary.com/....jpg",
    "createdAt": "2026-08-13T12:00:00.000Z",
    "updatedAt": "2026-08-13T12:00:00.000Z"
  }
  ```
- Error responses:
  - `400 Bad Request` if no message content or self-message attempt
  - `404 Not Found` if receiver does not exist
  - `500 Internal Server Error`
- Notes:
  - Uploads image to Cloudinary if `image` is present.
  - Emits a Socket.IO `newMessage` event to the receiver if online.

---

## 3. Middleware / Access Control

### `protectRoute`

Used to protect routes that require authentication.

- Reads the JWT from the `jwt` cookie.
- Verifies the token using `ENV.JWT_SECRET`.
- Loads the user by `userId`.
- Attaches the user object to `req.user`.
- If invalid or missing, it responds with:
  ```json
  {
    "message": "Unauthorized - No token provided"
  }
  ```
  or
  ```json
  {
    "message": "Unauthorized - Invalid token provided"
  }
  ```

---

## 4. JWT Cookie Settings

The token is generated in `generateToken` and stored in the cookie as:

```js
res.cookie("jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none",
  secure: true,
});
```

This means the app expects secure cross-site cookie behavior.

---

## 5. MCP Server Mapping Suggestions

For an MCP server, the endpoints can be mapped to tools like:

- `auth_signup`
- `auth_login`
- `auth_logout`
- `auth_update_profile`
- `auth_check_session`
- `messages_get_contacts`
- `messages_get_chats`
- `messages_get_by_user`
- `messages_send`

Recommended tool metadata:
- Name: unique function name
- Description: endpoint purpose
- Arguments: request body or path params
- Auth: `cookie` based, session required
- Output: response JSON as described in each section

---

## 6. Summary

The backend has:
- 5 auth routes
- 4 message routes
- total of 9 REST endpoints

This is the list you can directly use as a specification for building your MCP server.
