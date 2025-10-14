const request = require('supertest');
const app = require('../app');

describe('Health endpoint', () => {
    test('GET /health should return status 200 and JSON', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'OK');
        expect(res.body).toHaveProperty('timestamp');
    }, 20000);
});
