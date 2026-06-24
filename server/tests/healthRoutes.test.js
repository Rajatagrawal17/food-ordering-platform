import request from 'supertest';
import { expect, test } from '@jest/globals';
import mongoose from 'mongoose';

// Override readyState getter on Connection prototype
Object.defineProperty(mongoose.Connection.prototype, 'readyState', {
  get: () => 1,
  configurable: true,
});

// Mock db with admin and collection support
mongoose.connection.db = {
  admin: () => ({
    ping: () => Promise.resolve(true),
  }),
  collection: () => ({
    find: () => ({ toArray: () => Promise.resolve([]) }),
    findOne: () => Promise.resolve(null),
    createIndex: () => Promise.resolve(),
  }),
};

const { app } = await import('../app.js');

test('reports health status', async () => {
  const response = await request(app).get('/api/health');
  console.log('HEALTH RESPONSE BODY:', response.status, response.body);
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.database).toBe('connected');
});