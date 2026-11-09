
const { createUserSupabaseClient } = require('../config/supabase');

function getClient(accessToken) {
    return createUserSupabaseClient(accessToken);
}

async function createRequest(accessToken, userId, requestData) {
    const supabase = getClient(accessToken);

    const { data, error } = await supabase
        .from('appointment_requests')
        .insert({
            user_id: userId,
            destination_country: requestData.destinationCountry,
            application_city: requestData.applicationCity,
            preferred_dates: requestData.preferredDates,
            notes: requestData.notes || null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function getRequests(accessToken) {
    const supabase = getClient(accessToken);

    const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

async function getRequestById(accessToken, requestId) {
    const supabase = getClient(accessToken);

    const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function updateRequest(accessToken, requestId, userId, updates) {
    const supabase = getClient(accessToken);

    const updateData = {
        updated_at: new Date().toISOString()
    };

    if (updates.destinationCountry !== undefined) {
        updateData.destination_country = updates.destinationCountry;
    }

    if (updates.applicationCity !== undefined) {
        updateData.application_city = updates.applicationCity;
    }

    if (updates.preferredDates !== undefined) {
        updateData.preferred_dates = updates.preferredDates;
    }

    if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
    }

    const { data, error } = await supabase
        .from('appointment_requests')
        .update(updateData)
        .eq('id', requestId)
        .eq('user_id', userId)
        .eq('status', 'submitted')
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function cancelRequest(accessToken, requestId, userId) {
    const supabase = getClient(accessToken);

    const { data, error } = await supabase.rpc(
        'cancel_appointment_request',
        {
            p_request_id: requestId
        }
    );

    if (error) throw error;

    return data;
}

module.exports = {
    createRequest,
    getRequests,
    getRequestById,
    updateRequest,
    cancelRequest
};

