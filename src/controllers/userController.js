
const {
    createUserSupabaseClient
} = require('../config/supabase');

async function getCurrentUser(req, res) {
    try {
        const userSupabase = createUserSupabaseClient(req.accessToken);

        const { data, error } = await userSupabase
            .from('profiles')
            .select('id, full_name, phone, created_at, updated_at')
            .eq('id', req.user.id)
            .single();

        if (error) {
            console.error('Profile retrieval error:', error.message);

            return res.status(500).json({
                success: false,
                message: 'Unable to retrieve user profile'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            user: {
                id: req.user.id,
                email: req.user.email,
                emailConfirmed: !!req.user.email_confirmed_at,
                profile: data
            }
        });

    } catch (error) {
        console.error('User controller error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function updateCurrentUser(req, res) {
    try {
        const { fullName, phone } = req.body;

        if (fullName === undefined && phone === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Provide fullName or phone to update'
            });
        }

        if (
            fullName !== undefined &&
            (typeof fullName !== 'string' || !fullName.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Full name must be a non-empty string'
            });
        }

        if (
            phone !== undefined &&
            (typeof phone !== 'string' || !phone.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Phone must be a non-empty string'
            });
        }

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (fullName !== undefined) {
            updates.full_name = fullName.trim();
        }

        if (phone !== undefined) {
            updates.phone = phone.trim();
        }

        const userSupabase = createUserSupabaseClient(req.accessToken);

        const { data, error } = await userSupabase
            .from('profiles')
            .update(updates)
            .eq('id', req.user.id)
            .select('id, full_name, phone, created_at, updated_at')
            .single();

        if (error) {
            console.error('Profile update error:', error.message);

            return res.status(500).json({
                success: false,
                message: 'Unable to update user profile'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            profile: data
        });

    } catch (error) {
        console.error('Profile update controller error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    getCurrentUser,
    updateCurrentUser
};
