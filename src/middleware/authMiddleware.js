
const { supabase } = require('../config/supabase');

async function authenticateUser(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required'
            });
        }

        const token = authorization.substring(7);

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired authentication token'
            });
        }

        req.user = data.user;
        req.accessToken = token;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}

module.exports = { authenticateUser };
