#!/usr/bin/env node

import { main } from './proxy';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Set up yargs CLI options
const argv = yargs(hideBin(process.argv))
  .usage('Usage: universal-proxy-server [options]')
  .option('port', {
    alias: 'p',
    type: 'number',
    description: 'Port for the proxy server',
    default: 8080,
  })
  .help('help')
  .alias('help', 'h')
  .example([
    ['$0', 'Start the proxy server (on default port 8080)'],
    ['$0 --port 9000', 'Start on port 9000'],
  ])
  .wrap(Math.min(120, yargs().terminalWidth()))
  .parseSync();

// Set the port as environment variable
process.env.PROXY_PORT = String(argv.port);

main();
