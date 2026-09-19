# Chat App MCP Server

This is the official Model Context Protocol (MCP) server for Chat App. It allows AI agents like Claude Desktop to connect to your chat account securely, read your messages, and send messages on your behalf.

## How to use in Claude Desktop

1. Go to your Chat App profile settings and generate an **API Key**.
2. Open your `claude_desktop_config.json` file.
3. Add the following configuration:

```json
{
  "mcpServers": {
    "chat-app": {
      "command": "npx",
      "args": ["-y", "chat-app-pegion-mcp"],
      "env": {
        "CHAT_APP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

*Optional*: If you are testing locally, you can also add `"BACKEND_URL": "http://localhost:5005"` to the `env` block.

## Publishing to npm (For Developers)

To publish this package to `npm` so anyone can install it via `npx`:

1. Open your terminal in this directory (`chat-app-mcp`).
2. Run `npm login` to log into your npm account.
3. Run `npm publish --access public`.

> Note: Make sure the package name in `package.json` is unique. If `chat-app-mcp` is already taken on npm, change it to something like `@yourusername/chat-app-mcp`.
