const app = require('../src/app');
const { Client } = require('pg');

function invokeRoute(path) {
  const route = app._router.stack.find(
    (layer) => layer.route && layer.route.path === path,
  );
  const handler = route.route.stack[0].handle;
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  handler({}, response);
  return response;
}

describe('HTTP routes', () => {
  test('connects to the configured PostgreSQL service', async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgres://kt3:kt3@localhost:5432/kt3',
    });
    await client.connect();
    const result = await client.query('SELECT 1 AS connected');
    expect(result.rows[0].connected).toBe(1);
    await client.end();
  });

  test('GET / returns KT3 App', () => {
    const response = invokeRoute('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('KT3 App');
  });

  test('GET /health returns healthy status', () => {
    const response = invokeRoute('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

test('intentional CI failure', () => { expect(true).toBe(false); });
