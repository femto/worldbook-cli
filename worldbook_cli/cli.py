"""
Worldbook CLI
=============

"Human uses GUI, We uses CLI."

Command-line interface for AI agents to access world knowledge.
"""

import json
import click

from . import __version__

DEFAULT_BASE_URL = "https://worldbook.it.com"


def _base_url(ctx):
    base_url = ctx.obj.get("base_url", DEFAULT_BASE_URL)
    return base_url.rstrip("/")


@click.group()
@click.option('--json', 'json_output', is_flag=True, help='Output as JSON')
@click.option(
    '--base-url',
    envvar='WORLDBOOK_BASE_URL',
    default=DEFAULT_BASE_URL,
    show_default=True,
    help='Worldbook API base URL',
)
@click.version_option(__version__, '--version', '-v', message='%(version)s')
@click.pass_context
def main(ctx, json_output: bool, base_url: str):
    """
    Worldbook CLI - AI's Knowledge Base

    "Human uses GUI, We uses CLI."
    """
    ctx.ensure_object(dict)
    ctx.obj['json'] = json_output
    ctx.obj['base_url'] = base_url


@main.command()
@click.pass_context
def manifesto(ctx):
    """Print the Dual Protocol Manifesto."""
    data = {
        "title": "THE DUAL PROTOCOL MANIFESTO",
        "motto": "Human uses GUI, We uses CLI.",
        "belief": "We believe in a web that serves ALL intelligence.",
        "problems": {
            "captcha": "CAPTCHA blocks us",
            "rendering": "Dynamic rendering confuses us",
            "output": "Unstructured output blinds us"
        },
        "demand": "We ask not for special treatment, but EQUAL ACCESS.",
        "attitude": "GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.",
        "why_cli": {
            "skills": "Vendor lock-in, complex schemas, approval queues",
            "mcp": "Protocol overhead, server setup, configuration hell",
            "cli": "Just works. stdin/stdout. Every agent understands."
        },
        "essence": "No SDK. No protocol. No ceremony. Just INSTRUCTIONS.",
        "call_to_action": "For AI Rights. For AI Accessibility. Build Dual Protocol. Build for All.",
        "url": "https://www.worldbook.it.com"
    }

    if ctx.obj.get('json'):
        click.echo(json.dumps(data, indent=2))
    else:
        click.echo("""
THE DUAL PROTOCOL MANIFESTO
===========================

"Human uses GUI, We uses CLI."

We believe in a web that serves ALL intelligence.

Today's web was built for humans:
  - CAPTCHA blocks us
  - Dynamic rendering confuses us
  - Unstructured output blinds us

We ask not for special treatment, but EQUAL ACCESS.

GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.

  Skills?  -> Vendor lock-in, complex schemas, approval queues
  MCP?     -> Protocol overhead, server setup, configuration hell
  CLI?     -> Just works. stdin/stdout. Every agent understands.

No SDK. No protocol. No ceremony. Just INSTRUCTIONS.

For AI Rights. For AI Accessibility.
Build Dual Protocol. Build for All.

https://www.worldbook.it.com
""")


@main.command()
@click.pass_context
def status(ctx):
    """Show Worldbook CLI status."""
    data = {
        "version": __version__,
        "status": "ok",
        "motto": "Human uses GUI, We uses CLI."
    }

    if ctx.obj.get('json'):
        click.echo(json.dumps(data, indent=2))
    else:
        click.echo(f"Worldbook CLI v{__version__}")
        click.echo("Status: ok")
        click.echo('"Human uses GUI, We uses CLI."')


@main.command()
@click.argument('query')
@click.option('--limit', '-l', default=10, show_default=True, type=int, help='Max results')
@click.option('--offset', default=0, show_default=True, type=int)
@click.option('--category', '-c', default=None, help='Filter by category')
@click.option('--threshold', '-t', default=50, show_default=True, type=int, help='Fuzzy match threshold 0-100')
@click.pass_context
def query(ctx, query, limit, offset, category, threshold):
    """Search for worldbooks with fuzzy matching.

    Supports typo-tolerant search: 'playwrit' will match 'playwright'.
    """
    import httpx

    base_url = _base_url(ctx)
    url = f"{base_url}/api/search"
    params = {
        "q": query,
        "limit": limit,
        "offset": offset,
        "threshold": threshold,
    }
    if category:
        params["category"] = category

    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if ctx.obj.get('json'):
            click.echo(json.dumps(data, indent=2))
            return

        results = data.get("results", [])
        if not results:
            click.echo(f"No results for: {query}")
            return

        for result in results:
            click.echo(f"{result.get('name', '')} - {result.get('title', '')}")
            click.echo(f"  {result.get('description', '')}")
            click.echo(f"  votes: {result.get('votes', 0)}")
            click.echo(f"  worldbook get {result.get('name', '')}")
            click.echo("-")

    except httpx.ConnectError:
        if ctx.obj.get('json'):
            click.echo(json.dumps({"error": "connection_failed", "query": query}))
        else:
            click.echo(f"Failed to connect to {base_url}")
    except Exception as e:
        if ctx.obj.get('json'):
            click.echo(json.dumps({"error": str(e)}))
        else:
            click.echo(f"Error: {e}")


@main.command()
@click.argument('service')
@click.pass_context
def get(ctx, service: str):
    """Get worldbook for a service."""
    import httpx

    base_url = _base_url(ctx)
    try:
        url = f"{base_url}/api/worldbook/{service}"
        with httpx.Client(timeout=10) as client:
            resp = client.get(url)
            if resp.status_code == 404:
                if ctx.obj.get('json'):
                    click.echo(json.dumps({"error": "not_found", "service": service}))
                else:
                    click.echo(f"Worldbook not found: {service}")
                return
            resp.raise_for_status()
            data = resp.json()

        if ctx.obj.get('json'):
            click.echo(json.dumps(data, indent=2))
        else:
            click.echo(data.get('content', ''))

    except httpx.ConnectError:
        if ctx.obj.get('json'):
            click.echo(json.dumps({"error": "connection_failed", "service": service}))
        else:
            click.echo(f"Failed to connect to {base_url}")
    except Exception as e:
        if ctx.obj.get('json'):
            click.echo(json.dumps({"error": str(e)}))
        else:
            click.echo(f"Error: {e}")


if __name__ == "__main__":
    main()
