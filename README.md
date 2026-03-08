# SearchClaw MCP Server

The complete web data pipeline for AI agents. [Search, Extract, Crawl in One API](https://searchclaw.dev).

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server with **15 tools** covering web search, scraping, extraction, crawling, and autonomous data gathering via the [SearchClaw](https://searchclaw.dev) API.

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

### Claude Code

```bash
claude mcp add searchclaw -- npx -y searchclaw-mcp
```

Then set your API key in your environment:

```bash
export SEARCHCLAW_API_KEY="your-api-key"
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

## Available Tools (15)

### Search

| Tool | Description | Credits |
|------|-------------|---------|
| `search` | Web search — organic results | 1 |
| `search_ai` | RAG-ready search with context and sources (primary tool for AI agents) | 2 |
| `news` | Search recent news articles | 1 |
| `images` | Search for images with metadata | 1 |
| `suggest` | Autocomplete / query suggestions | 1 |

### Extract & Scrape

| Tool | Description | Credits |
|------|-------------|---------|
| `extract` | Extract structured data from a URL using a JSON schema | 5 |
| `markdown` | Convert any URL to clean markdown | 2 |
| `screenshot` | Capture a full-page screenshot of a URL | 2 |

### Crawl

| Tool | Description | Credits |
|------|-------------|---------|
| `crawl` | Async bulk crawl with optional structured extraction | 1/page |
| `job_status` | Check status of an async crawl job | 0 |
| `map` | Discover all URLs on a domain (sitemap alternative) | 2 |

### Pipeline & Agents

| Tool | Description | Credits |
|------|-------------|---------|
| `pipeline` | **Search + extract in one call** — the killer feature for RAG pipelines | 3+ |
| `browse` | Interactive browser actions (click, type, scroll) | 5 |
| `agent` | Autonomous data gathering from natural language prompts | variable |

### Utility

| Tool | Description | Credits |
|------|-------------|---------|
| `usage` | Check your remaining API credits | 0 |

## Why SearchClaw?

| Feature | SearchClaw | Firecrawl | Tavily |
|---------|-----------|-----------|--------|
| Web search | ✅ | ❌ | ✅ |
| AI search (RAG) | ✅ | ❌ | ✅ |
| Extract with schema | ✅ | ✅ | ❌ |
| Crawl | ✅ | ✅ | ❌ |
| Pipeline (search + extract) | ✅ | ❌ | ❌ |
| Autonomous agent | ✅ | ❌ | ❌ |
| Browser actions | ✅ | ❌ | ❌ |
| News & image search | ✅ | ❌ | ✅ |
| Screenshot | ✅ | ✅ | ❌ |
| MCP server | ✅ | ✅ | ✅ |
| Free tier | ✅ 500 credits/mo | ❌ | ✅ 1000 credits/mo |

Get started at [searchclaw.dev](https://searchclaw.dev).

## License

MIT
