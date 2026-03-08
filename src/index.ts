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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url.toString(), { headers, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SearchClaw API error ${response.status}: ${text}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SearchClaw API error ${response.status}: ${text}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function jsonResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({
  name: "searchclaw",
  version: "2.0.0",
});

// --- Search tools ---

server.tool(
  "search",
  "Search the web using SearchClaw. Returns organic web results. Costs 1 credit.",
  { q: z.string().describe("Search query") },
  async ({ q }) => jsonResult(await apiGet("/search", { q }))
);

server.tool(
  "search_ai",
  "RAG-ready web search with context and sources. Primary tool for AI agents — returns structured context optimized for LLM consumption. Costs 2 credits.",
  { q: z.string().describe("Search query") },
  async ({ q }) => jsonResult(await apiGet("/search/ai", { q }))
);

server.tool(
  "news",
  "Search for recent news articles using SearchClaw. Costs 1 credit.",
  { q: z.string().describe("News search query") },
  async ({ q }) => jsonResult(await apiPost("/search/news", { q }))
);

server.tool(
  "images",
  "Search for images using SearchClaw. Returns image URLs and metadata. Costs 1 credit.",
  { q: z.string().describe("Image search query") },
  async ({ q }) => jsonResult(await apiPost("/search/images", { q }))
);

server.tool(
  "suggest",
  "Get autocomplete suggestions for a search query using SearchClaw. Costs 1 credit.",
  { q: z.string().describe("Partial query for autocomplete suggestions") },
  async ({ q }) => jsonResult(await apiGet("/suggest", { q }))
);

// --- Extract & scrape tools ---

server.tool(
  "extract",
  "Extract structured data from a URL using a JSON schema. Costs 5 credits.",
  {
    url: z.string().describe("URL to extract data from"),
    schema: z.record(z.unknown()).optional().describe("JSON schema defining the structure to extract"),
    prompt: z.string().optional().describe("Natural language instruction for extraction"),
  },
  async ({ url, schema, prompt }) => {
    const body: Record<string, unknown> = { url };
    if (schema) body.schema = schema;
    if (prompt) body.prompt = prompt;
    return jsonResult(await apiPost("/extract", body));
  }
);

server.tool(
  "markdown",
  "Convert a URL to clean markdown. Costs 2 credits.",
  { url: z.string().describe("URL to convert to markdown") },
  async ({ url }) => jsonResult(await apiPost("/markdown", { url }))
);

server.tool(
  "screenshot",
  "Capture a screenshot of a URL. Costs 2 credits.",
  {
    url: z.string().describe("URL to screenshot"),
    full_page: z.boolean().optional().default(true).describe("Capture full page (default: true)"),
  },
  async ({ url, full_page }) => jsonResult(await apiPost("/screenshot", { url, full_page }))
);

// --- Crawl tools ---

server.tool(
  "crawl",
  "Start an async bulk crawl with optional extraction. Returns a job ID to poll with job_status. Costs 1 credit per page.",
  {
    url: z.string().describe("Starting URL to crawl"),
    max_pages: z.number().optional().default(10).describe("Maximum pages to crawl (default: 10)"),
    schema: z.record(z.unknown()).optional().describe("JSON schema for structured extraction per page"),
  },
  async ({ url, max_pages, schema }) => {
    const body: Record<string, unknown> = { url, max_pages };
    if (schema) body.schema = schema;
    return jsonResult(await apiPost("/crawl", body));
  }
);

server.tool(
  "job_status",
  "Check the status of an async job (e.g. crawl). Costs 0 credits.",
  { job_id: z.string().describe("Job ID returned by crawl or other async endpoints") },
  async ({ job_id }) => jsonResult(await apiGet(`/jobs/${job_id}`))
);

server.tool(
  "map",
  "Discover all URLs on a domain. Returns a sitemap-like list. Costs 2 credits.",
  {
    url: z.string().describe("Domain or URL to map"),
    max_pages: z.number().optional().default(100).describe("Maximum URLs to discover (default: 100)"),
    search: z.string().optional().describe("Filter URLs matching this keyword"),
  },
  async ({ url, max_pages, search }) => {
    const body: Record<string, unknown> = { url, max_pages };
    if (search) body.search = search;
    return jsonResult(await apiPost("/map", body));
  }
);

// --- Pipeline & agent tools ---

server.tool(
  "pipeline",
  "Search + extract in one call. The killer feature — find pages via search, then extract structured data from top results. Costs 3+ credits.",
  {
    query: z.string().describe("Search query to find relevant pages"),
    schema: z.record(z.unknown()).describe("JSON schema defining data to extract from results"),
    max_results: z.number().optional().default(10).describe("Max search results (default: 10)"),
    extract_from: z.number().optional().default(5).describe("Number of top results to extract from (default: 5)"),
  },
  async ({ query, schema, max_results, extract_from }) =>
    jsonResult(await apiPost("/pipeline", { query, schema, max_results, extract_from }))
);

server.tool(
  "browse",
  "Interactive browser actions on a URL. Perform clicks, form fills, scrolling, and more. Costs 5 credits.",
  {
    url: z.string().describe("URL to browse"),
    actions: z.array(z.record(z.unknown())).describe("Array of browser action objects (click, type, scroll, etc.)"),
  },
  async ({ url, actions }) => jsonResult(await apiPost("/browse", { url, actions }))
);

server.tool(
  "agent",
  "Autonomous data gathering agent. Describe what you need in natural language and the agent will search, browse, and extract data. Costs variable credits.",
  {
    prompt: z.string().describe("Natural language description of data to gather"),
    schema: z.record(z.unknown()).optional().describe("JSON schema for structured output"),
    max_credits: z.number().optional().default(10).describe("Max credits to spend (default: 10)"),
    max_sources: z.number().optional().default(5).describe("Max sources to consult (default: 5)"),
  },
  async ({ prompt, schema, max_credits, max_sources }) => {
    const body: Record<string, unknown> = { prompt, max_credits, max_sources };
    if (schema) body.schema = schema;
    return jsonResult(await apiPost("/agent", body));
  }
);

// --- Utility ---

server.tool(
  "usage",
  "Check your SearchClaw API credit balance. Costs 0 credits.",
  {},
  async () => jsonResult(await apiGet("/usage"))
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
