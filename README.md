# Universal Proxy Server

A simple HTTP server with a universal `/proxy` endpoint, that proxies HTTP request to the specified remote URL, relaying the method, the headers, and (for JSON) the body, while adding permissive CORS headers for browser AJAX compatibility.

---
## Features

- Accepts any HTTP method on `/proxy` endpoint
- Proxies request to the remote URL specified by the `url` query parameter
- Forwards all headers (except `Host`)
- Passes request body as JSON for `POST`, `PUT`, `PATCH`
- Streams remote response body, status, and headers to the client
- Enables permissive CORS (`*`) for browser usage
- Handles CORS preflight (`OPTIONS`) requests

---

## Requirements

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/)

---

## Getting Started

### 1. Clone

  ```sh
  git clone https://github.com/lucivuc/universal-proxy-server.git
  cd universal-proxy-server
  ```

### 2. Install

  ```sh
  pnpm install
  ```

### 3. Configure (Optional)

Edit `.env` (see `.env.example`) to specify your port:

  ```text
  PROXY_PORT=8080
  ```

No `.env` file is needed for the default port (8080).

### 4. Testing

Run Unit Tests

  ```sh
  pnpm test
  ```

### 5. Running

For development (watch mode):

  ```sh
  pnpm run dev
  ```

To build and run:

  ```sh
  pnpm run build
  pnpm start
  ```

### 6. Usage

Proxy any HTTP request by calling `/proxy` and supplying a url query parameter (must be a full URL):

  ```sh
  curl "http://localhost:8080/proxy?url=https://api.github.com/repos/nodejs/node"
  ```

Or from your frontend JavaScript:

  ```js
  fetch('http://localhost:8080/proxy?url=https://api.example.com/data')
    .then(r => r.json())
    .then(console.log)
  ```

POST example:

  ```sh
  curl -X POST "http://localhost:8080/proxy?url=https://httpbin.org/post" \
    -H "Content-Type: application/json" \
    -d '{"hello":"world"}'
  ```

### 7. Endpoints

**ALL** `/proxy`

- Query parameter: `url` (required) — target URL to proxy to.

Proxies `method`, `headers` (except `Host`), and `body` (as `JSON` for `POST`, `PUT`, `PATCH`).

Streams `status`, `headers`, and `body` of the proxied response back.

**OPTIONS** `/proxy`

Handles CORS preflight.

- Always returns `204` with `Access-Control-Allow-Origin: *`, etc.

### 8. Environment Variables

  |Name|Description|Default|
  |---|---|---|
  |PROXY_PORT|Port to run the proxy server on|8080|

### 9. Security Notes

- This proxy is intentionally open (for development use).
- No authentication or URL filtering is implemented.
- Never expose this server in production or on the open internet without adding security and sanitization measures to restrict target URLs and users.

### 10. Linting and formatting Usage

- Lint code:

  ```sh
  pnpm lint
  
  # or

  npx eslint "src/**/*.{ts,js}"
  ```

- Lint and autofix:

  ```sh
  pnpm lint:fix
  ```

- Check formatting:

  ```sh
  pnpm format
  ```

- Auto-format:

  ```sh
  pnpm format:fix
  ```

### 11. License

MIT
