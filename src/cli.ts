#!/usr/bin/env node
import { main } from './proxy';

// Add at the top
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex > -1 && process.argv[portArgIndex + 1]) {
  process.env.PROXY_PORT = process.argv[portArgIndex + 1];
}

// Optionally parse command-line args here (e.g., with yargs or commander).
main();
