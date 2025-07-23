// Helper for next test, simulates a readable body for node-fetch
import { Readable } from 'stream';
import request from 'supertest';
import fetch from 'node-fetch';
import '../src/proxy'; // This should create and listen to the server
import main from './proxy'; // <-- Use this if you provide it

// Mock node-fetch using jest (works for dynamic import as well)
jest.mock('node-fetch', () => {
  return jest.fn();
});

// Silence server logs during test runs
jest.spyOn(console, 'log').mockImplementation(() => {});

const app = main();
const mockedFetch = fetch as jest.MockedFunction<any>;

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

  it('handles CORS on requests with existing CORS headers', async () => {
    // Mock fetch for the success case
    mockedFetch.mockResolvedValue({
      status: 200,
      headers: new Map<string, string>([
        ['x-proxy-test', '42'],
        ['access-control-allow-origin', 'abc'],
        ['access-control-allow-methods', 'xyz'],
      ]),
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

  it('handles proxy response with no body', async () => {
    const testBody = { foo: 'bar' };
    let capturedBody = '';
    // Simulate remote server responding
    mockedFetch.mockImplementation(async (url: string, opts: { [key: string]: any }) => {
      capturedBody = opts.body;
      return {
        status: 201,
        headers: new Map<string, string>(),
      };
    });
    const res = await request(app)
      .post('/proxy?url=https://jsonplaceholder.typicode.com/posts')
      .send(testBody);

    expect(JSON.parse(capturedBody)).toEqual(testBody);
    expect(res.status).toBe(201);
    expect(res.text).toBeUndefined;
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

  it('forwards target server errors (unknown proxy error)', async () => {
    mockedFetch.mockRejectedValue(null);

    const res = await request(app).get('/proxy?url=https://example.com/fail');
    expect(res.status).toBe(500);
    expect(res.text).toMatch(/proxy error/i);
    expect(res.text).toMatch(/Unknown proxy error/);
  });
});
