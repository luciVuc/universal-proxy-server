/**
 * Universal Proxy Server
 *
 * @file server.ts
 * @description
 *   An Express + TypeScript universal HTTP proxy server.
 *   - Proxies HTTP requests to a remote URL specified by the `url` query parameter.
 *   - Relays method, headers (excluding 'host'), and JSON body for POST/PUT/PATCH.
 *   - Sets permissive CORS headers for all responses.
 *   - Handles CORS preflight (OPTIONS) for browser compatibility.
 *
 * @version 1.0.0
 * @author  LV
 * @license MIT
 *
 * @requires dotenv - To load environment variables from .env.
 * @requires express - Web server framework.
 * @requires node-fetch - For HTTP requests to the proxy target.
 *
 * @example
 *   # Start server
 *   pnpm run dev
 *
 *   # Example proxy GET
 *   curl 'http://localhost:8080/proxy?url=https://api.example.com/data'
 *
 * @env PROXY_PORT - (optional) Port number for the proxy server (default: 8080)
 */

import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { RequestInit } from 'node-fetch';

// Use dynamic import for node-fetch@3+ ESM-only
const fetch = async (...args: Parameters<(typeof import('node-fetch'))['default']>) =>
  (await import('node-fetch')).default(...args);

dotenv.config();

const PORT: number = Number(process.env.PROXY_PORT) || 8080;

const app = express();

app.use(express.json());

/**
 * Universal Proxy Endpoint
 *
 * Proxies HTTP requests to a remote URL provided by the `url` query parameter.
 *
 * - Accepts all HTTP methods.
 * - Forwards headers (except for the 'host' header).
 * - Sends body as JSON for POST, PUT, PATCH.
 * - Streams target server response back to the client.
 * - Adds permissive CORS headers.
 *
 * @route ALL /proxy
 * @queryparam {string} url - The remote URL to proxy to. (required)
 * @returns
 *   - `200`-`299`, proxied response
 *   - `400`, if `url` parameter is missing
 *   - `500`, if proxying fails
 *
 * @example
 *   GET /proxy?url=https://api.example.com/data
 */
app.use('/proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string | undefined;
  if (!targetUrl) {
    res.status(400).send('Missing url query parameter.');
    return;
  }

  try {
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: { ...req.headers } as Record<string, string>,
      redirect: 'follow',
    };
    // Remove the 'host' header, as it should not be forwarded
    delete (fetchOptions.headers as Record<string, unknown>)['host'];

    // For applicable methods, send JSON body
    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
      fetchOptions.body = JSON.stringify(req.body);
      (fetchOptions.headers as Record<string, string>)['content-type'] = 'application/json';
    }

    // Proxy request
    const proxyRes = await fetch(targetUrl, fetchOptions);

    // Set permissive CORS headers for browser support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');

    // Forward nearly all response headers, skip CORS headers (set above)
    proxyRes.headers.forEach((value, name) => {
      if (
        ![
          'access-control-allow-origin',
          'access-control-allow-headers',
          'access-control-allow-methods',
        ].includes(name.toLowerCase())
      ) {
        res.setHeader(name, value);
      }
    });

    // HTTP status and streamed body
    res.status(proxyRes.status);
    if (proxyRes.body) {
      // Node-fetch v3: body is a readable stream (Web/Node compatible)
      // @ts-ignore
      proxyRes.body.pipe(res);
    } else {
      res.end();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown proxy error';
    res.status(500).send('Proxy error: ' + message);
  }
});

/**
 * CORS Preflight Handler for Proxy
 *
 * Responds to CORS preflight (OPTIONS) requests at /proxy with the correct headers.
 *
 * @route OPTIONS /proxy
 * @returns
 *   - `204 No Content` with relevant CORS headers
 */
app.options('/proxy', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.sendStatus(204);
});

/**
 * Starts the Express HTTP server.
 *
 * @function
 * @param {number} PORT - Port number to listen on.
 * @listens http://localhost:PORT/proxy
 * @returns {void}
 */
if (require.main === module) {
  app.listen(PORT, (error?: Error) => {
    if (error) {
      console.error(error.message);
    } else {
      console.log(`Proxy server running at http://localhost:${PORT}/proxy?url=<target>`);
    }
  });
}

export default app;
