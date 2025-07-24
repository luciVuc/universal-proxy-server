# Universal Proxy Server

Universal Proxy Server is a minimal, robust HTTP proxy server and toolkit that allows you to forward arbitrary HTTP requests to any external URL, with automatic CORS headers. Use it as a library in your Node.js/TypeScript project or as a standalone CLI tool.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
  - [As a CLI app](#installation-as-a-cli-app)
  - [As a TypeScript/JavaScript module](#installation-as-a-tsjs-module)
- [Usage Guides](#usage-guides)
  - [As a CLI app](#usage-as-a-cli-app)
  - [As a TS/JS module](#usage-as-a-tsjs-module)
- [Endpoints](#endpoints)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Security Notice](#security-notice)
- [License](#license)

---

## Overview

Universal Proxy Server allows you to easily and securely forward HTTP requests from your local application or browser to any external HTTP(S) resource. With built-in permissive CORS, it is especially useful for frontend development, API gateway prototyping, or building microservice middleware.

- **Universal:** Forwards any HTTP verb and custom headers.
- **Cross-Origin:** Handles all browser preflight CORS cases.
- **Flexible:** Usable as a package or as a one-command CLI service.

---

## Features

- Proxies all HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, etc.) via a single `/proxy` endpoint.
- Target URL specified by the required `url` query parameter (`/proxy?url=...`).
- Forwards all headers (except `Host`) and JSON bodies.
- Adds CORS headers (`Access-Control-Allow-Origin: *`, etc.) to support browser usage.
- Handles CORS preflight (`OPTIONS`) requests.
- Streams status codes, headers, and response bodies back to the client.
- Simple configuration via environment variables, CLI args, or as a programmatic module.

---

## Installation

### Installation as a CLI App

**Global (recommended for CLI use):**
```sh
npm install -g universal-proxy-server
```
or
```sh
pnpm add -g universal-proxy-server
```

Now you can use `universal-proxy-server` from anywhere on your system.

---

### Installation as a TS/JS Module

Add to your project:
```sh
pnpm add universal-proxy-server
# or
npm install universal-proxy-server
```
Import and use in your TS/JS Node projects (see [Usage as a TS/JS module](#usage-as-a-tsjs-module)).

---

## Usage Guides

### Usage as a CLI App

Start the proxy server:
```sh
universal-proxy-server
```
By default, this listens on port 8080.

**With options:**
```sh
universal-proxy-server --port 9000
# or
universal-proxy-server -p 9000
```

**Show help:**
```sh
universal-proxy-server --help
```

#### Example: Proxying a GET request to a public API
```sh
curl "http://localhost:8080/proxy?url=https://jsonplaceholder.typicode.com/posts/1"
```

#### Example: Proxying a POST request with JSON body
```sh
curl -X POST "http://localhost:8080/proxy?url=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"hello":"world"}'
```

#### Example: Using from browser JavaScript
```js
fetch("http://localhost:8080/proxy?url=https://api.example.com/data")
  .then(r => r.json())
  .then(console.log)
```

---

### Usage as a TS/JS Module

#### Basic usage in a TypeScript/Node.js project:

Start the proxy server with `npm` or `pnpm` as `package.json` script. Example: 

```json
{
  ...,
  "scripts": {
    ...,
    "proxy": "universal-proxy-server"
    ...
  },
  ...
}
```
---

## Endpoints

### `/proxy` (ALL HTTP methods)

- **Query parameter**: `url` (required) — the target absolute URL to proxy to.
- The incoming method, headers (excluding `Host`), and body (for `POST`, `PUT`, `PATCH`) are forwarded to the target server.
- The server streams back the target's status code, headers, and body.
- CORS headers are applied to all proxy responses.

### `/proxy` (OPTIONS)

- Handles CORS preflight for browser clients.
- Responds with `204 No Content` and the full set of wildcard CORS headers.

---

## Environment Variables

| Name        | Description                        | Default |
|-------------|------------------------------------|---------|
| PROXY_PORT  | Port to run the proxy server on    | 8080    |

You may set this in `.env` or via the environment.

---

## Development

**Clone the repository:**
```sh
git clone https://github.com/lucivuc/universal-proxy-server.git
cd universal-proxy-server
```

**Install dependencies:**
```sh
pnpm install
```

**Run in development mode (automatic reloading):**
```sh
pnpm run dev
```

**Build for production:**
```sh
pnpm run build
```
The server will be built to `dist/`.

**Start the production server:**
```sh
pnpm start
```

**Configure with a custom port (in `.env` or via CLI):**
```env
PROXY_PORT=1234
```

---

## Testing

**Run unit tests:**
```sh
pnpm test
```
All major features and edge cases are covered by tests in `src/*.test.ts`.

---

## Linting and Formatting

- **Lint code:**
  ```sh
  pnpm lint
  ```
- **Autofix lint errors:**
  ```sh
  pnpm lint:fix
  ```
- **Check code formatting:**
  ```sh
  pnpm format
  ```
- **Auto-format codebase:**
  ```sh
  pnpm format:fix
  ```

---

## Security Notice

**This proxy server is intentionally open by default, intended for local development and prototyping.**
- No authentication, origin checks, or URL whitelisting are built in.
- **Do not deploy to production or expose to the public internet** without adding strong authentication and request validation.
- For production/enterprise proxies, consider additional layers such as logging, rate-limiting, or IP allowlists

---

## Frequently Asked Questions

### Can I restrict which URLs can be proxied?
By default, Universal Proxy Server accepts any URL, for development convenience. To enforce restrictions (e.g., block internal IPs or only allow certain whitelisted domains), wrap the Express middleware or fork this project and add validation before forwarding the request.

### Can I use this project for HTTPS endpoints?
Yes! This proxy handles both HTTP and HTTPS remote URLs.

### How do I set the server port?
- **As an environment variable:**  
  `PROXY_PORT=4000 universal-proxy-server`
- **With CLI flag:**  
  `universal-proxy-server --port 4000`
- **In a `.env` file:**  
  ```
  PROXY_PORT=4000
  ```

### Can I use this for production?
**No.** This package is deliberately open as a development tool, with no security, rate limiting, or authenticity checks. For production deployments, either build in these constraints yourself or consider hardened proxy solutions.

---

## Project Structure

```
/
├── src/
│   ├── server.ts    # Express app and main proxy logic
│   ├── cli.ts       # CLI entrypoint
│   └── ...          # Tests, helpers, etc.
├── dist/            # Compiled JS output (after build)
├── .env.example     # Environment variable example
├── package.json
...
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your ideas.

1. Clone the repository.
2. Create your feature branch (`git checkout -b my-feature`).
3. Commit your changes (`git commit -am 'feat: my new feature'`).
4. Push to the branch (`git push origin my-feature`).
5. Open a pull request.

---

## License

MIT

---
