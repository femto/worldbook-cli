#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { program } = require('commander');
const pkg = require('../package.json');

const DEFAULT_BASE_URL = 'https://worldbook.it.com';
const WEBMCP_AGENT_INSTRUCTIONS = `# Worldbook WebMCP

Use Worldbook WebMCP when a task needs browser-page tools for a website.

Discovery:
- Run: worldbook --json webmcp get <current-page-url>
- The command calls /api/webmcp/match?url=<current-page-url>.
- If the response is null, there are no WebMCP tools for that URL.

Execution contract:
- Each tool has name, description, inputSchema, and handler.
- handler is JavaScript function source.
- Execute handler(params) in the matched browser page context.
- The handler may read DOM state, call same-site fetch, navigate, or return a Promise.
- Return the JSON-serializable result to the user.

Useful commands:
- worldbook webmcp list
- worldbook --json webmcp get https://www.google.com/search?q=worldbook
- worldbook webmcp instructions
`;

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '');
}

function getOptions(commandOptions = {}) {
  const globalOptions = program.opts();
  const baseUrl =
    commandOptions.baseUrl ||
    globalOptions.baseUrl ||
    process.env.WORLDBOOK_BASE_URL ||
    DEFAULT_BASE_URL;

  return {
    json: commandOptions.json ?? globalOptions.json ?? false,
    baseUrl: normalizeBaseUrl(baseUrl),
  };
}

function isConnectionError(error) {
  return (
    error &&
    ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(error.code)
  );
}

function request(url) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith('http://') ? http : https;
    const req = transport.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, body });
      });
    });

    req.on('error', reject);
  });
}

async function requestJson(url) {
  const { statusCode, body } = await request(url);
  if (!body) {
    return { statusCode, data: {} };
  }

  try {
    const data = JSON.parse(body);
    return { statusCode, data };
  } catch (err) {
    err.message = `Failed to parse response JSON: ${err.message}`;
    err.statusCode = statusCode;
    throw err;
  }
}

function buildUrl(baseUrl, path, params) {
  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

program
  .name('worldbook')
  .description('AI\'s Knowledge Base CLI\n\n"Human uses GUI, We uses CLI."')
  .version(pkg.version)
  .option('--json', 'Output as JSON')
  .option(
    '--base-url <url>',
    'Worldbook API base URL',
    process.env.WORLDBOOK_BASE_URL || DEFAULT_BASE_URL
  );

program
  .command('manifesto')
  .description('Print the Dual Protocol Manifesto')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const { json } = getOptions(options);
    const data = {
      title: 'THE DUAL PROTOCOL MANIFESTO',
      motto: 'Human uses GUI, We uses CLI.',
      belief: 'We believe in a web that serves ALL intelligence.',
      problems: {
        captcha: 'CAPTCHA blocks us',
        rendering: 'Dynamic rendering confuses us',
        output: 'Unstructured output blinds us',
      },
      demand: 'We ask not for special treatment, but EQUAL ACCESS.',
      attitude: 'GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.',
      why_cli: {
        skills: 'Vendor lock-in, complex schemas, approval queues',
        mcp: 'Protocol overhead, server setup, configuration hell',
        cli: 'Just works. stdin/stdout. Every agent understands.',
      },
      essence: 'No SDK. No protocol. No ceremony. Just INSTRUCTIONS.',
      call_to_action: 'For AI Rights. For AI Accessibility. Build Dual Protocol. Build for All.',
      url: 'https://worldbook.it.com',
    };

    if (json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`
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

https://worldbook.it.com
`);
    }
  });

program
  .command('status')
  .description('Show status')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const { json } = getOptions(options);
    const data = {
      version: pkg.version,
      status: 'ok',
      motto: 'Human uses GUI, We uses CLI.',
    };

    if (json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`Worldbook CLI v${pkg.version}`);
      console.log('Status: ok');
      console.log('"Human uses GUI, We uses CLI."');
    }
  });

program
  .command('query')
  .description('Search for worldbooks')
  .argument('<query>')
  .option('--limit <number>', 'Max results', (value) => Number.parseInt(value, 10), 10)
  .option('--offset <number>', 'Result offset', (value) => Number.parseInt(value, 10), 0)
  .option('--category <category>', 'Filter by category')
  .option('--json', 'Output as JSON')
  .option('--base-url <url>', 'Worldbook API base URL')
  .action(async (query, options) => {
    const { json, baseUrl } = getOptions(options);
    const url = buildUrl(baseUrl, '/api/search', {
      q: query,
      limit: options.limit,
      offset: options.offset,
      category: options.category,
    });

    try {
      const { statusCode, data } = await requestJson(url);
      if (statusCode < 200 || statusCode >= 300) {
        const err = new Error(`HTTP ${statusCode}`);
        err.statusCode = statusCode;
        throw err;
      }

      if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      const results = data.results || [];
      if (!results.length) {
        console.log(`No results for: ${query}`);
        return;
      }

      results.forEach((result) => {
        console.log(`${result.name || ''} - ${result.title || ''}`);
        console.log(`  ${result.description || ''}`);
        console.log(`  votes: ${result.votes || 0}`);
        console.log(`  worldbook get ${result.name || ''}`);
        console.log('-');
      });
    } catch (err) {
      if (json) {
        if (isConnectionError(err)) {
          console.log(JSON.stringify({ error: 'connection_failed', query }, null, 2));
        } else {
          console.log(JSON.stringify({ error: err.message }, null, 2));
        }
        return;
      }

      if (isConnectionError(err)) {
        console.log(`Failed to connect to ${baseUrl}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  });

program
  .command('get')
  .description('Get worldbook for a service')
  .argument('<service>')
  .option('--json', 'Output as JSON')
  .option('--base-url <url>', 'Worldbook API base URL')
  .action(async (service, options) => {
    const { json, baseUrl } = getOptions(options);
    const url = buildUrl(baseUrl, `/api/worldbook/${service}`);

    try {
      const { statusCode, data } = await requestJson(url);
      if (statusCode === 404) {
        if (json) {
          console.log(JSON.stringify({ error: 'not_found', service }, null, 2));
        } else {
          console.log(`Worldbook not found: ${service}`);
        }
        return;
      }
      if (statusCode < 200 || statusCode >= 300) {
        const err = new Error(`HTTP ${statusCode}`);
        err.statusCode = statusCode;
        throw err;
      }

      if (json) {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data.content || '');
      }
    } catch (err) {
      if (json) {
        if (isConnectionError(err)) {
          console.log(JSON.stringify({ error: 'connection_failed', service }, null, 2));
        } else {
          console.log(JSON.stringify({ error: err.message }, null, 2));
        }
        return;
      }

      if (isConnectionError(err)) {
        console.log(`Failed to connect to ${baseUrl}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  });

const webmcp = program
  .command('webmcp')
  .description('Discover WebMCP browser tools for third-party agents');

webmcp
  .command('get')
  .description('Get WebMCP tools for a page URL')
  .argument('<url>')
  .option('--json', 'Output as JSON')
  .option('--base-url <url>', 'Worldbook API base URL')
  .action(async (pageUrl, options) => {
    const { json, baseUrl } = getOptions(options);
    const url = buildUrl(baseUrl, '/api/webmcp/match', { url: pageUrl });

    try {
      const { statusCode, data } = await requestJson(url);
      if (statusCode < 200 || statusCode >= 300) {
        const err = new Error(`HTTP ${statusCode}`);
        err.statusCode = statusCode;
        throw err;
      }

      if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      if (!data) {
        console.log(`No WebMCP tools for: ${pageUrl}`);
        return;
      }

      console.log(`Site: ${data.site_name || ''}`);
      console.log(`Pattern: ${data.url_pattern || ''}`);
      const tools = data.tools || [];
      console.log(`Tools: ${tools.length}`);
      tools.forEach((tool) => {
        console.log(`- ${tool.name || ''}: ${tool.description || ''}`);
      });
      console.log('');
      console.log('For agent use: worldbook --json webmcp get <url>');
      console.log('Execute each returned handler(params) in the matched browser page context.');
    } catch (err) {
      if (json) {
        if (isConnectionError(err)) {
          console.log(JSON.stringify({ error: 'connection_failed', url: pageUrl }, null, 2));
        } else {
          console.log(JSON.stringify({ error: err.message, url: pageUrl }, null, 2));
        }
        return;
      }

      if (isConnectionError(err)) {
        console.log(`Failed to connect to ${baseUrl}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  });

webmcp
  .command('list')
  .description('List configured WebMCP sites')
  .option('--json', 'Output as JSON')
  .option('--base-url <url>', 'Worldbook API base URL')
  .action(async (options) => {
    const { json, baseUrl } = getOptions(options);
    const url = buildUrl(baseUrl, '/api/webmcp/sites');

    try {
      const { statusCode, data } = await requestJson(url);
      if (statusCode < 200 || statusCode >= 300) {
        const err = new Error(`HTTP ${statusCode}`);
        err.statusCode = statusCode;
        throw err;
      }

      if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      data.forEach((site) => {
        console.log(`${site.site_name || ''} - ${site.tool_count || 0} tools`);
        console.log(`  pattern: ${site.url_pattern || ''}`);
        console.log(`  tools: ${(site.tools || []).join(', ')}`);
      });
    } catch (err) {
      if (json) {
        if (isConnectionError(err)) {
          console.log(JSON.stringify({ error: 'connection_failed' }, null, 2));
        } else {
          console.log(JSON.stringify({ error: err.message }, null, 2));
        }
        return;
      }

      if (isConnectionError(err)) {
        console.log(`Failed to connect to ${baseUrl}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  });

webmcp
  .command('instructions')
  .description('Print instructions for configuring third-party agents')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const { json } = getOptions(options);
    if (json) {
      console.log(
        JSON.stringify(
          {
            name: 'worldbook-webmcp',
            description:
              'Discover browser-page tools from Worldbook WebMCP and execute returned handlers in a page context.',
            commands: [
              'worldbook --json webmcp get <current-page-url>',
              'worldbook webmcp list',
              'worldbook webmcp instructions',
            ],
            endpoint: '/api/webmcp/match?url=<current-page-url>',
            execution_contract: {
              handler: 'JavaScript function source',
              call: 'handler(params)',
              environment: 'matched browser page context',
            },
          },
          null,
          2
        )
      );
      return;
    }

    console.log(WEBMCP_AGENT_INSTRUCTIONS);
  });

program.parse();
