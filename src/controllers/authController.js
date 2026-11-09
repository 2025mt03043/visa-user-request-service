const {
    registerUser,
    loginUser,
    logoutUser
} = require('../services/authService');

async function register(req, res) {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email and password are required'
            });
        }

        const data = await registerUser({
            fullName,
            email,
            password
        });

        return res.status(201).json({
            success: true,
            message: data.session
                ? 'Registration successful'
                : 'Registration received. Check your email if confirmation is required.',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const data = await loginUser({ email, password });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

async function logout(req, res) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const accessToken = authorization.split(' ')[1];

        await logoutUser(accessToken);

        return res.status(200).json({
            success: true,
            message: 'Logout request validated. Clear the client session.'
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { register, login, logout };