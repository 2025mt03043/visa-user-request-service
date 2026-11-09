
const SLOT_API_URL = process.env.SLOT_AVAILABILITY_API_URL;

async function validateAppointmentAvailability({
    destinationCountry,
    applicationCity,
    preferredDates
}) {
    if (!SLOT_API_URL) {
        throw new Error('Slot Availability API URL is not configured');
    }

    const params = new URLSearchParams({
        destinationCountry,
        applicationCity
    });

    let response;

    try {
        response = await fetch(
            `${SLOT_API_URL}/appointments?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            }
        );
    } catch (error) {
        throw new Error(`Slot Availability Service unavailable: ${error.message}`);
    }

    if (!response.ok) {
        throw new Error(
            `Slot Availability Service returned HTTP ${response.status}`
        );
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid response from Slot Availability Service');
    }

    const listing = result.data.find(item =>
        item.isActive === true &&
        item.destinationCountry.toLowerCase() === destinationCountry.toLowerCase() &&
        item.applicationCity.toLowerCase() === applicationCity.toLowerCase()
    );

    if (!listing) {
        return {
            available: false,
            message: 'No active appointment listing found for this country and city'
        };
    }

    const unavailableDates = preferredDates.filter(
        date => !listing.availableDates.includes(date)
    );

    if (unavailableDates.length > 0) {
        return {
            available: false,
            message: 'Some preferred dates are not available',
            unavailableDates
        };
    }

    return {
        available: true,
        listingId: listing.id,
        destinationCountry: listing.destinationCountry,
        applicationCity: listing.applicationCity,
        validatedDates: preferredDates
    };
}

module.exports = {
    validateAppointmentAvailability
};
