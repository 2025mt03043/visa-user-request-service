
require('dotenv').config();

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');

test('Application API tests', async (t) => {

    await t.test('GET / should return HTTP 200', async () => {
        const response = await request(app).get('/');

        assert.equal(response.status, 200);
    });

    await t.test('GET /health should return HTTP 200', async () => {
        const response = await request(app).get('/health');

        assert.equal(response.status, 200);
    });

    await t.test('GET /api/users/me should reject unauthenticated access', async () => {
        const response = await request(app).get('/api/users/me');

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
        assert.equal(
            response.body.message,
            'Authentication token is required'
        );
    });

    await t.test('PUT /api/users/me should reject unauthenticated access', async () => {
        const response = await request(app)
            .put('/api/users/me')
            .send({
                fullName: 'Test User'
            });

        assert.equal(response.status, 401);
    });

    await t.test('GET /api/requests should reject unauthenticated access', async () => {
        const response = await request(app).get('/api/requests');

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    await t.test('POST /api/requests should reject unauthenticated access', async () => {
        const response = await request(app)
            .post('/api/requests')
            .send({
                destinationCountry: 'Spain',
                applicationCity: 'London',
                preferredDates: ['2026-11-20']
            });

        assert.equal(response.status, 401);
    });

    await t.test('PATCH /api/requests/:id/cancel should reject unauthenticated access', async () => {
        const response = await request(app)
            .patch('/api/requests/415936d5-586b-45d9-914b-5bed0ffc4aa9/cancel');

        assert.equal(response.status, 401);
    });

});
