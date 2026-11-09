const { supabase } = require('../config/supabase');

async function registerUser({ fullName, email, password }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    });

    if (error) throw error;
    return data;
}

async function loginUser({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

async function logoutUser(accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) throw error;
    if (!data.user) throw new Error('Invalid session');

    return { success: true };
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};