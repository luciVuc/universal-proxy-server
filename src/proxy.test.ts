import request from 'supertest';
import express from 'express';
import http from 'http';

// Mock node-fetch using jest (works for dynamic import as well)
jest.mock('node-fetch', () => {
  return jest.fn();
});
import fetch from 'node-fetch';
const mockedFetch = fetch as jest.MockedFunction<any>;

// We need to import your app with its routes, so refactor `app` export in proxy.ts if necessary
import '../src/proxy'; // This should create and listen to the server

// To isolate the app for testing, it’s better if you refactor your server to export `app` and not call listen in the file!
// For now, let's assume you expose app for test like: export default app;

// Example re-export pattern in src/proxy.ts:
//   export const server = app.listen(PORT, ...);
//   export default app;

import app from './proxy'; // <-- Use this if you provide it

// Helper for next test, simulates a readable body for node-fetch
import { Readable } from 'stream';

// Silence server logs during test runs
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Universal Proxy Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  it('returns 400 if url query param missing', async () => {
    const res = await request(app).get('/proxy');
    expect(res.status).toBe(400);
    expect(res.text).toMatch(/missing/i);
  });

  it('handles CORS on all requests', async () => {
    // Mock fetch for the success case
    mockedFetch.mockResolvedValue({
      status: 200,
      headers: new Map<string, string>([['x-proxy-test', '42']]),
      body: Readable.from(['hello']),
      // .pipe() will be called on body
    });

    const res = await request(app).get('/proxy?url=https://example.com');

    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-headers']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toBe('*');
    expect(res.headers['x-proxy-test']).toBe('42');
    expect(res.text).toBe('hello');
  });

  it('handles CORS preflight OPTIONS', async () => {
    // Mock fetch for the success case
    mockedFetch.mockResolvedValue({
      status: 204,
      headers: new Map<string, string>([['x-proxy-test', '42']]),
    });

    let res = await request(app).options('/proxy');
    expect(res.status).toBe(400);

    res = await request(app).options('/proxy?url=https://example.com');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-headers']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toBe('*');
  });

  it('forwards POST body as JSON', async () => {
    const testBody = { foo: 'bar' };
    let capturedBody = '';
    // Simulate remote server responding
    mockedFetch.mockImplementation(async (url: string, opts: { [key: string]: any }) => {
      capturedBody = opts.body;
      return {
        status: 201,
        headers: new Map<string, string>(),
        body: Readable.from(['ok']),
      };
    });
    const res = await request(app)
      .post('/proxy?url=https://jsonplaceholder.typicode.com/posts')
      .send(testBody);

    expect(JSON.parse(capturedBody)).toEqual(testBody);
    expect(res.status).toBe(201);
    expect(res.text).toBe('ok');
  });

  it('forwards target server errors (proxy error)', async () => {
    mockedFetch.mockRejectedValue(new Error('failfetch'));

    const res = await request(app).get('/proxy?url=https://example.com/fail');
    expect(res.status).toBe(500);
    expect(res.text).toMatch(/proxy error/i);
    expect(res.text).toMatch(/failfetch/);
  });
});
