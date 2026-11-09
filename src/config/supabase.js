
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
}

// General client for authentication operations
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// User-scoped client for database operations protected by RLS
function createUserSupabaseClient(accessToken) {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

module.exports = {
    supabase,
    createUserSupabaseClient
};
