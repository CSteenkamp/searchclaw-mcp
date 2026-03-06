#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://api.searchclaw.dev/v1";
const API_KEY = process.env.SEARCHCLAW_API_KEY;

if (!API_KEY) {
  console.error("Error: SEARCHCLAW_API_KEY environment variable is required");
  process.exit(1);
}

const headers = {
  "X-API-Key": API_KEY,
  "Accept": "application/json",
};

async function apiGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SearchClaw API error ${response.status}: ${text}`);
  }
  return response.json();
}

const server = new McpServer({
  name: "searchclaw",
  version: "1.0.0",
});

server.tool(
  "search",
  "Search the web using SearchClaw. Returns organic web results. Costs 1 credit.",
  { q: z.string().describe("Search query") },
  async ({ q }) => {
    const data = await apiGet("/search", { q });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "search_ai",
  "RAG-ready web search with context and sources. Primary tool for AI agents — returns structured context optimized for LLM consumption. Costs 2 credits.",
  { q: z.string().describe("Search query") },
  async ({ q }) => {
    const data = await apiGet("/search/ai", { q });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "news",
  "Search for recent news articles using SearchClaw. Costs 1 credit.",
  { q: z.string().describe("News search query") },
  async ({ q }) => {
    const data = await apiGet("/news", { q });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "images",
  "Search for images using SearchClaw. Returns image URLs and metadata. Costs 1 credit.",
  { q: z.string().describe("Image search query") },
  async ({ q }) => {
    const data = await apiGet("/images", { q });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "suggest",
  "Get autocomplete suggestions for a search query using SearchClaw. Costs 1 credit.",
  { q: z.string().describe("Partial query for autocomplete suggestions") },
  async ({ q }) => {
    const data = await apiGet("/suggest", { q });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "usage",
  "Check your SearchClaw API credit balance. Costs 0 credits.",
  {},
  async () => {
    const data = await apiGet("/usage");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
