# SearchClaw MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that provides web search, news, images, and AI-powered search tools via the [SearchClaw](https://searchclaw.dev) API.

## Installation

```bash
npx searchclaw-mcp
```

Or install globally:

```bash
npm install -g searchclaw-mcp
```

## Configuration

Get your API key from [searchclaw.dev](https://searchclaw.dev) and add the server to your MCP client config.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "searchclaw": {
      "command": "npx",
      "args": ["-y", "searchclaw-mcp"],
      "env": {
        "SEARCHCLAW_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "searchclaw": {
      "command": "npx",
      "args": ["-y", "searchclaw-mcp"],
      "env": {
        "SEARCHCLAW_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "searchclaw": {
      "command": "npx",
      "args": ["-y", "searchclaw-mcp"],
      "env": {
        "SEARCHCLAW_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `search` | Web search | 1 |
| `search_ai` | RAG-ready search with context and sources (primary tool for AI agents) | 2 |
| `news` | News search | 1 |
| `images` | Image search | 1 |
| `suggest` | Autocomplete suggestions | 1 |
| `usage` | Check remaining credits | 0 |

## License

MIT
