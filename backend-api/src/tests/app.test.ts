import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import app from '../app.js';

describe('FinFolio Express App Integration Tests', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  test('GET /health returns 200 OK and FinFolio backend status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.message).toBe('Backend API running successfully');
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
  });

  test('GET /unknown-route returns 404 Not Found JSON response', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route-endpoint`);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error || data.message || data.success === false).toBeTruthy();
  });

  test('GET /api/insights/indian-finance-benchmarks returns real dataset benchmarks', async () => {
    const res = await fetch(`${baseUrl}/api/insights/indian-finance-benchmarks`);
    expect(res.status).toBe(200);

    const resData = await res.json();
    expect(resData.success).toBe(true);
    expect(resData.data).toBeDefined();
    expect(resData.data.byCityTier).toBeDefined();
    expect(resData.data.byCityTier['Tier 1']).toBeDefined();
  });
});