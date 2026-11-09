
require('dotenv').config();

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    validateAppointmentAvailability
} = require('../src/services/slotAvailabilityService');

const validListing = {
    id: 'TEST_LISTING_001',
    destinationCountry: 'Spain',
    applicationCity: 'London',
    availableDates: [
        '2026-11-13',
        '2026-11-16',
        '2026-11-20'
    ],
    isActive: true
};

function mockResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data
    };
}

test('Slot Availability Service tests', async (t) => {

    await t.test('Accepts dates available in Firestore listing', async (t) => {
        t.mock.method(global, 'fetch', async (url) => {
            assert.match(url, /destinationCountry=Spain/);
            assert.match(url, /applicationCity=London/);

            return mockResponse({
                success: true,
                count: 1,
                data: [validListing]
            });
        });

        const result = await validateAppointmentAvailability({
            destinationCountry: 'Spain',
            applicationCity: 'London',
            preferredDates: ['2026-11-13', '2026-11-20']
        });

        assert.equal(result.available, true);
        assert.equal(result.listingId, 'TEST_LISTING_001');
        assert.deepEqual(
            result.validatedDates,
            ['2026-11-13', '2026-11-20']
        );
    });

    await t.test('Rejects unavailable preferred dates', async (t) => {
        t.mock.method(global, 'fetch', async () =>
            mockResponse({
                success: true,
                count: 1,
                data: [validListing]
            })
        );

        const result = await validateAppointmentAvailability({
            destinationCountry: 'Spain',
            applicationCity: 'London',
            preferredDates: ['2026-11-25']
        });

        assert.equal(result.available, false);
        assert.equal(
            result.message,
            'Some preferred dates are not available'
        );
        assert.deepEqual(
            result.unavailableDates,
            ['2026-11-25']
        );
    });

    await t.test('Rejects unknown country or city', async (t) => {
        t.mock.method(global, 'fetch', async () =>
            mockResponse({
                success: true,
                count: 0,
                data: []
            })
        );

        const result = await validateAppointmentAvailability({
            destinationCountry: 'France',
            applicationCity: 'London',
            preferredDates: ['2026-11-13']
        });

        assert.equal(result.available, false);
        assert.equal(
            result.message,
            'No active appointment listing found for this country and city'
        );
    });

    await t.test('Rejects inactive appointment listings', async (t) => {
        const inactiveListing = {
            ...validListing,
            isActive: false
        };

        t.mock.method(global, 'fetch', async () =>
            mockResponse({
                success: true,
                count: 1,
                data: [inactiveListing]
            })
        );

        const result = await validateAppointmentAvailability({
            destinationCountry: 'Spain',
            applicationCity: 'London',
            preferredDates: ['2026-11-13']
        });

        assert.equal(result.available, false);
    });

    await t.test('Handles Slot Availability Service network failure', async (t) => {
        t.mock.method(global, 'fetch', async () => {
            throw new Error('Connection refused');
        });

        await assert.rejects(
            validateAppointmentAvailability({
                destinationCountry: 'Spain',
                applicationCity: 'London',
                preferredDates: ['2026-11-13']
            }),
            /Slot Availability Service unavailable/
        );
    });

    await t.test('Handles unsuccessful HTTP response', async (t) => {
        t.mock.method(global, 'fetch', async () =>
            mockResponse(
                { message: 'Internal server error' },
                500
            )
        );

        await assert.rejects(
            validateAppointmentAvailability({
                destinationCountry: 'Spain',
                applicationCity: 'London',
                preferredDates: ['2026-11-13']
            }),
            /returned HTTP 500/
        );
    });

    await t.test('Rejects malformed service response', async (t) => {
        t.mock.method(global, 'fetch', async () =>
            mockResponse({
                success: true,
                data: null
            })
        );

        await assert.rejects(
            validateAppointmentAvailability({
                destinationCountry: 'Spain',
                applicationCity: 'London',
                preferredDates: ['2026-11-13']
            }),
            /Invalid response from Slot Availability Service/
        );
    });

});

