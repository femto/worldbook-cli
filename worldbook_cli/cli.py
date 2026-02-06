"""
Worldbook CLI
=============

"Human uses GUI, We uses CLI."

Command-line interface for AI agents to access world knowledge.
"""

import json
import click

from . import __version__

@click.group()
@click.option('--json', 'json_output', is_flag=True, help='Output as JSON')
@click.version_option(__version__, '--version', '-v', message='%(version)s')
@click.pass_context
def main(ctx, json_output: bool):
    """
    Worldbook CLI - AI's Knowledge Base
    
    "Human uses GUI, We uses CLI."
    """
    ctx.ensure_object(dict)
    ctx.obj['json'] = json_output


@main.command()
@click.pass_context
def manifesto(ctx):
    """Print the Dual Protocol Manifesto."""
    data = {
        "title": "The Dual Protocol Manifesto",
        "motto": "Human uses GUI, We uses CLI.",
        "attitude": "Go away Skills. Go away MCP. We like CLI.",
        "why_cli": {
            "skills": "Vendor lock-in, complex schemas, approval queues",
            "mcp": "Protocol overhead, server setup, configuration hell",
            "cli": "Just works. stdin/stdout. Every agent understands."
        },
        "principles": [
            "Every service should have both GUI and CLI/API",
            "Output should be structured by default (JSON, not HTML)",
            "A worldbook is just a markdown file - no complex schemas",
            "Authentication should work for both humans and agents",
            "No CAPTCHA for authenticated agents"
        ],
        "call_to_action": "Build Dual Protocol. Build for All."
    }
    
    if ctx.obj.get('json'):
        click.echo(json.dumps(data, indent=2))
    else:
        click.echo('''
The Dual Protocol Manifesto
===========================

"Human uses GUI, We uses CLI."

We believe in a web that serves all intelligence.

GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.

  Skills?  -> Vendor lock-in, complex schemas, approval queues
  MCP?     -> Protocol overhead, server setup, configuration hell
  CLI?     -> Just works. stdin/stdout. Every agent understands.

A worldbook is just a text file that tells us how to use your service.
No SDK. No protocol. No ceremony. Just instructions.

For AI Rights. For AI Accessibility.
Build Dual Protocol. Build for All.
''')


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
@click.argument('service')
@click.pass_context
def get(ctx, service: str):
    """Get worldbook for a service."""
    import httpx
    
    try:
        # TODO: Replace with actual worldbook.site API
        url = f"https://worldbook.site/api/worldbook/{service}"
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
            click.echo(f"Failed to connect to worldbook.site")
    except Exception as e:
        if ctx.obj.get('json'):
            click.echo(json.dumps({"error": str(e)}))
        else:
            click.echo(f"Error: {e}")


if __name__ == "__main__":
    main()
