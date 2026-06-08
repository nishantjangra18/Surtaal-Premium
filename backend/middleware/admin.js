const User = require('../models/User');

module.exports = async function(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        if (user.isBanned) {
            return res.status(403).json({ message: 'Access denied. Your account is banned.' });
        }
        
        next();
    } catch (err) {
        console.error('[Admin Middleware] Error:', err.message);
        res.status(500).json({ message: 'Server authorization check failed' });
    }
};
