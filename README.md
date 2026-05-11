# Worldbook CLI

> "Human uses GUI, We uses CLI."

CLI tool for AI agents to access world knowledge.

## Install

```bash
# PyPI
pip install worldbook

# npm (global install)
npm i -g worldbook
```

## Usage

```bash
# Show manifesto
worldbook manifesto

# Check status
worldbook status
worldbook --json status

# Search worldbooks
worldbook query github
worldbook --json query github

# Get a worldbook
worldbook get github
worldbook --json get github

# Discover browser-page WebMCP tools for a URL
worldbook webmcp get "https://www.google.com/search?q=worldbook"
worldbook --json webmcp get "https://www.google.com/search?q=worldbook"

# Print agent setup instructions for Claude Code, Codex, or other agents
worldbook webmcp instructions

# Point to a local server
export WORLDBOOK_BASE_URL=http://localhost:8000
worldbook query github
```

## WebMCP for Third-Party Agents

WebMCP lets an agent discover browser-page tools from the current URL without installing `mcp-chrome`.

```bash
worldbook --json webmcp get "<current-page-url>"
```

The command calls the existing Worldbook endpoint:

```text
GET /api/webmcp/match?url=<current-page-url>
```

If a site matches, the response includes `tools`. Each tool has:

- `name`
- `description`
- `inputSchema`
- `handler`

The `handler` is JavaScript function source. A third-party agent should execute `handler(params)` in the matched browser page context using its own browser automation runtime, then return the JSON-serializable result.

For Claude Code, Codex, or any other agent with custom instructions, use:

```bash
worldbook webmcp instructions
```


## The Dual Protocol Manifesto

We believe in a web that serves all intelligence.

**GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.**

- Skills? → Vendor lock-in, complex schemas, approval queues
- MCP? → Protocol overhead, server setup, configuration hell
- CLI? → Just works. stdin/stdout. Every agent understands.

A worldbook is just a text file that tells us how to use your service.
No SDK. No protocol. No ceremony. Just instructions.

## License

MIT
