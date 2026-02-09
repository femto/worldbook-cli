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

# Point to a local server
export WORLDBOOK_BASE_URL=http://localhost:8000
worldbook query github
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
