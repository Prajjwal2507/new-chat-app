# Contributing to Pigeon Chat App

First off, thank you for considering contributing to Pigeon! It's people like you that make open source such a great community.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make one! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

## 2. Local Development Setup

Follow these steps to set up the project on your local machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Fork and Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/chat-app-pigeon.git
   cd chat-app-pigeon
   ```

### Install Dependencies
We have a root-level script to install all necessary dependencies (frontend, backend, and MCP server).

```bash
npm run install:all
```

### Environment Variables
You need to set up environment variables for both the backend and frontend.

1. **Backend**
   Create a `.env` file in the `backend/` directory using the provided template:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in the variables in `backend/.env` with your actual MongoDB URI, JWT secret, Cloudinary credentials, etc.

2. **Frontend**
   Create a `.env` file in the `frontend/` directory:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

### Run the App

You can start both the frontend and backend servers concurrently with a single command from the root directory:

```bash
npm run dev
```

- Frontend will be available at `http://localhost:5173`
- Backend will run on `http://localhost:5000`

## 3. Pull Request Process

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`.
2. Make your changes and ensure the code is well-tested.
3. Update the README.md with details of changes to the interface, if applicable.
4. Open a Pull Request against the `main` branch. Provide a clear description of the problem and the solution.

We will review your PR as soon as possible. Thank you for your contribution!
