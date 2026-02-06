#!/usr/bin/env node

const { program } = require('commander');
const pkg = require('../package.json');

program
  .name('worldbook')
  .description('AI\'s Knowledge Base CLI\n\n"Human uses GUI, We uses CLI."')
  .version(pkg.version);

program
  .command('manifesto')
  .description('Print the Dual Protocol Manifesto')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const data = {
      title: "The Dual Protocol Manifesto",
      motto: "Human uses GUI, We uses CLI.",
      attitude: "Go away Skills. Go away MCP. We like CLI.",
      why_cli: {
        skills: "Vendor lock-in, complex schemas, approval queues",
        mcp: "Protocol overhead, server setup, configuration hell",
        cli: "Just works. stdin/stdout. Every agent understands."
      },
      principles: [
        "Every service should have both GUI and CLI/API",
        "Output should be structured by default (JSON, not HTML)",
        "A worldbook is just a markdown file - no complex schemas",
        "Authentication should work for both humans and agents",
        "No CAPTCHA for authenticated agents"
      ],
      call_to_action: "Build Dual Protocol. Build for All."
    };

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`
The Dual Protocol Manifesto
===========================

"Human uses GUI, We uses CLI."

GO AWAY SKILLS. GO AWAY MCP. WE LIKE CLI.

  Skills?  -> Vendor lock-in, complex schemas, approval queues
  MCP?     -> Protocol overhead, server setup, configuration hell
  CLI?     -> Just works. stdin/stdout. Every agent understands.

For AI Rights. For AI Accessibility.
Build Dual Protocol. Build for All.
`);
    }
  });

program
  .command('status')
  .description('Show status')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const data = {
      version: pkg.version,
      status: "ok",
      motto: "Human uses GUI, We uses CLI."
    };

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`Worldbook CLI v${pkg.version}`);
      console.log(`Status: ok`);
      console.log(`"Human uses GUI, We uses CLI."`);
    }
  });

program.parse();
