"""
TidePilot MCP Server
Exposes TidePilot data and AI actions as MCP tools for Claude Desktop.

Setup:
  1. pip install mcp httpx python-dotenv   (or: uv pip install ...)
  2. Copy .env.mcp.example to .env and fill in TIDEPILOT_API_URL and MCP_API_KEY
  3. Run: python main.py
  4. In Claude Desktop config, add this server under mcpServers

Claude Desktop config (claude_desktop_config.json):
  {
    "mcpServers": {
      "tidepilot": {
        "command": "python",
        "args": ["C:/path/to/TidePilot/main.py"],
        "env": {
          "TIDEPILOT_API_URL": "http://localhost:3000",
          "MCP_API_KEY": "your-mcp-api-key"
        }
      }
    }
  }
"""

import asyncio
import json
import os
import sys
from typing import Any

import httpx
from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.lowlevel.server import NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

load_dotenv()

API_BASE = os.getenv("TIDEPILOT_API_URL", "http://localhost:3000")
MCP_API_KEY = os.getenv("MCP_API_KEY", "")

server = Server("tidepilot")


def api_headers() -> dict[str, str]:
    return {
        "x-mcp-api-key": MCP_API_KEY,
        "Content-Type": "application/json",
    }


async def fetch(path: str, method: str = "GET", body: dict | None = None) -> Any:
    url = f"{API_BASE}{path}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        if method == "GET":
            resp = await client.get(url, headers=api_headers())
        else:
            resp = await client.post(url, headers=api_headers(), json=body or {})
        resp.raise_for_status()
        return resp.json()


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_drafts",
            description=(
                "Retrieve the user's content drafts from TidePilot. "
                "Returns a list of drafts with their content, status (DRAFT/PUBLISHED/IDEA), "
                "and voice score. Use this to see what content the user has been working on."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["DRAFT", "PUBLISHED", "IDEA", "READY", "ARCHIVED", "all"],
                        "description": "Filter by draft status. Use 'all' to get all drafts.",
                    }
                },
                "required": [],
            },
        ),
        types.Tool(
            name="get_voice_profile",
            description=(
                "Retrieve the user's voice profile from TidePilot. "
                "Returns tone sliders (assertive, concise, empathetic on 0-1 scale), "
                "forbidden phrases to avoid, and signature moves that define their style."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        types.Tool(
            name="get_writing_samples",
            description=(
                "Retrieve the user's writing samples stored in TidePilot. "
                "These are the real text examples used to build the voice profile. "
                "Use these to understand the user's authentic writing style."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        types.Tool(
            name="get_engagement_items",
            description=(
                "Retrieve pending engagement items (LinkedIn comments/mentions) from TidePilot. "
                "Returns comments that need replies, sorted by relationship score. "
                "High relationship scores indicate high-value connections worth prioritizing."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["PENDING", "REPLIED", "SKIPPED", "all"],
                        "description": "Filter by engagement status. Defaults to PENDING.",
                    }
                },
                "required": [],
            },
        ),
        types.Tool(
            name="get_weekly_brief",
            description=(
                "Retrieve the latest weekly brief from TidePilot. "
                "The brief contains: insights from past week's content performance, "
                "recommended actions, post suggestions for next week, and people to engage with."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": [],
            },
        ),
        types.Tool(
            name="suggest_reply",
            description=(
                "Generate an AI reply suggestion for a specific engagement item. "
                "The reply will match the user's voice profile and communication style. "
                "Provide the engagement item ID from get_engagement_items."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "engagement_item_id": {
                        "type": "string",
                        "description": "The ID of the engagement item to reply to.",
                    }
                },
                "required": ["engagement_item_id"],
            },
        ),
        types.Tool(
            name="create_draft",
            description=(
                "Create a new draft in TidePilot from an idea or topic. "
                "The content will be saved to the user's Studio for editing and publishing."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The draft content to save.",
                    },
                    "title": {
                        "type": "string",
                        "description": "Optional title or topic for the draft.",
                    },
                },
                "required": ["content"],
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        if name == "get_drafts":
            status = arguments.get("status", "all")
            path = f"/api/mcp/drafts"
            if status and status != "all":
                path += f"?status={status}"
            data = await fetch(path)
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_voice_profile":
            data = await fetch("/api/mcp/voice-profile")
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_writing_samples":
            data = await fetch("/api/mcp/writing-samples")
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_engagement_items":
            status = arguments.get("status", "PENDING")
            path = f"/api/mcp/engagement"
            if status and status != "all":
                path += f"?status={status}"
            data = await fetch(path)
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "get_weekly_brief":
            data = await fetch("/api/mcp/weekly-brief")
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "suggest_reply":
            item_id = arguments.get("engagement_item_id", "")
            data = await fetch("/api/mcp/suggest-reply", method="POST", body={"engagementItemId": item_id})
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        elif name == "create_draft":
            content = arguments.get("content", "")
            title = arguments.get("title", "")
            data = await fetch("/api/mcp/drafts", method="POST", body={"content": content, "title": title})
            return [types.TextContent(type="text", text=json.dumps(data, indent=2))]

        else:
            return [types.TextContent(type="text", text=f"Unknown tool: {name}")]

    except httpx.HTTPStatusError as e:
        return [types.TextContent(type="text", text=f"API error {e.response.status_code}: {e.response.text}")]
    except Exception as e:
        return [types.TextContent(type="text", text=f"Error: {str(e)}")]


async def main_async():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="tidepilot",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


def run():
    asyncio.run(main_async())


if __name__ == "__main__":
    run()
