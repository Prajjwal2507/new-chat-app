#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Environment variables configuration
const API_BASE_URL = process.env.BACKEND_URL || "https://new-chat-app-nx7q.onrender.com";
const API_KEY = process.env.CHAT_APP_API_KEY;

if (!API_KEY) {
  console.error("Error: CHAT_APP_API_KEY environment variable is required.");
  process.exit(1);
}

// Set up Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
  },
});

// Helper function to handle API responses and errors
async function handleApiCall(requestFn) {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || error.message;
      throw new McpError(ErrorCode.InternalError, `API request failed (${error.response.status}): ${message}`);
    }
    throw new McpError(ErrorCode.InternalError, `Network error: ${error.message}`);
  }
}

class ChatAppMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: "chat-app",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "auth_check_session",
          description: "Check whether the current session is valid and return the authenticated user.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "auth_update_profile",
          description: "Upload a new profile picture for the authenticated user.",
          inputSchema: {
            type: "object",
            properties: {
              profilePic: { type: "string", description: "Base64 encoded string of the image" },
            },
            required: ["profilePic"],
          },
        },
        {
          name: "messages_get_contacts",
          description: "Fetch all users except the currently authenticated user.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "messages_get_chats",
          description: "Fetch the list of chat partners for the authenticated user.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "messages_get_by_user",
          description: "Fetch conversation history between the authenticated user and the provided user ID.",
          inputSchema: {
            type: "object",
            properties: {
              user_id: { type: "string" },
            },
            required: ["user_id"],
          },
        },
        {
          name: "messages_send",
          description: "Send a message and immediately return the latest conversation state for the user pair.",
          inputSchema: {
            type: "object",
            properties: {
              receiver_id: { type: "string" },
              text: { type: "string" },
              image: { type: "string" },
            },
            required: ["receiver_id"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const args = request.params.arguments || {};
      let result;

      try {
        switch (request.params.name) {
          case "auth_check_session":
            result = await handleApiCall(() => apiClient.get("/api/auth/check"));
            break;

          case "auth_update_profile":
            if (!args.profilePic) throw new Error("profilePic is required");
            result = await handleApiCall(() =>
              apiClient.put("/api/auth/update-profile", { profilePic: args.profilePic })
            );
            break;

          case "messages_get_contacts":
            result = await handleApiCall(() => apiClient.get("/api/messages/contacts"));
            break;

          case "messages_get_chats":
            result = await handleApiCall(() => apiClient.get("/api/messages/chats"));
            break;

          case "messages_get_by_user":
            if (!args.user_id) throw new Error("user_id is required");
            result = await handleApiCall(() => apiClient.get(`/api/messages/${args.user_id}`));
            break;

          case "messages_send": {
            if (!args.receiver_id) throw new Error("receiver_id is required");
            if (!args.text && !args.image) throw new Error("At least one of 'text' or 'image' must be provided.");

            const payload = {};
            if (args.text) payload.text = args.text;
            if (args.image) payload.image = args.image;

            const sentMessage = await handleApiCall(() =>
              apiClient.post(`/api/messages/send/${args.receiver_id}`, payload)
            );
            const conversation = await handleApiCall(() =>
              apiClient.get(`/api/messages/${args.receiver_id}`)
            );

            result = {
              sent_message: sentMessage,
              conversation: conversation,
              message_count: Array.isArray(conversation) ? conversation.length : 0,
            };
            break;
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Chat App MCP server running on stdio");
  }
}

const server = new ChatAppMcpServer();
server.run().catch(console.error);
