
const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    cancelRequest
} = require('../services/requestService');

const {
    validateAppointmentAvailability
} = require('../services/slotAvailabilityService');


function validateRequest(body, partial = false) {
    const errors = [];

    if (!partial || body.destinationCountry !== undefined) {
        if (
            typeof body.destinationCountry !== 'string' ||
            !body.destinationCountry.trim()
        ) {
            errors.push('Valid destination country is required');
        }
    }

    if (!partial || body.applicationCity !== undefined) {
        if (
            typeof body.applicationCity !== 'string' ||
            !body.applicationCity.trim()
        ) {
            errors.push('Valid application city is required');
        }
    }

    if (!partial || body.preferredDates !== undefined) {
        if (
            !Array.isArray(body.preferredDates) ||
            body.preferredDates.length === 0 ||
            body.preferredDates.some(date =>
                typeof date !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
                new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
            )
        ) {
            errors.push('Provide valid preferred dates in YYYY-MM-DD format');
        }
    }

    if (
        body.notes !== undefined &&
        body.notes !== null &&
        typeof body.notes !== 'string'
    ) {
        errors.push('Notes must be a string');
    }

    return errors;
}


// CREATE APPOINTMENT REQUEST
async function create(req, res) {
    try {
        // 1. Validate incoming request
        const errors = validateRequest(req.body);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // 2. Validate appointment availability through Slot Availability Service
        let availability;

        try {
            availability = await validateAppointmentAvailability({
                destinationCountry: req.body.destinationCountry,
                applicationCity: req.body.applicationCity,
                preferredDates: req.body.preferredDates
            });

        } catch (error) {
            console.error(
                'Availability validation error:',
                error.message
            );

            return res.status(503).json({
                success: false,
                message: 'Appointment availability service is currently unavailable'
            });
        }

        // 3. Reject unavailable country, city or dates
        if (!availability.available) {
            return res.status(409).json({
                success: false,
                message: availability.message,
                unavailableDates: availability.unavailableDates || []
            });
        }

        // 4. Save request only after successful availability validation
        const request = await createRequest(
            req.accessToken,
            req.user.id,
            req.body
        );

        // 5. Return successful response
        return res.status(201).json({
            success: true,
            message: 'Appointment request submitted successfully',

            availability: {
                listingId: availability.listingId,
                destinationCountry: availability.destinationCountry,
                applicationCity: availability.applicationCity,
                validatedDates: availability.validatedDates
            },

            request
        });

    } catch (error) {
        console.error('Create request error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to create appointment request'
        });
    }
}


// GET ALL APPOINTMENT REQUESTS
async function list(req, res) {
    try {
        const requests = await getRequests(req.accessToken);

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('List requests error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve appointment requests'
        });
    }
}


// GET APPOINTMENT REQUEST BY ID
async function getOne(req, res) {
    try {
        const request = await getRequestById(
            req.accessToken,
            req.params.id
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Appointment request not found'
            });
        }

        return res.status(200).json({
            success: true,
            request
        });

    } catch (error) {
        console.error('Get request error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve appointment request'
        });
    }
}


// UPDATE APPOINTMENT REQUEST
async function update(req, res) {
    try {
        const allowedFields = [
            'destinationCountry',
            'applicationCity',
            'preferredDates',
            'notes'
        ];

        const suppliedFields = Object.keys(req.body);

        if (
            suppliedFields.length === 0 ||
            suppliedFields.some(field => !allowedFields.includes(field))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide valid request fields to update'
            });
        }

        const errors = validateRequest(req.body, true);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        const request = await updateRequest(
            req.accessToken,
            req.params.id,
            req.user.id,
            req.body
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or cannot be updated'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Appointment request updated successfully',
            request
        });

    } catch (error) {
        console.error('Update request error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to update appointment request'
        });
    }
}


// CANCEL APPOINTMENT REQUEST
async function cancel(req, res) {
    try {
        const request = await cancelRequest(
            req.accessToken,
            req.params.id,
            req.user.id
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or already cancelled'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Appointment request cancelled successfully',
            request
        });

    } catch (error) {
        console.error('Cancel request error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to cancel appointment request'
        });
    }
}


module.exports = {
    create,
    list,
    getOne,
    update,
    cancel
};
