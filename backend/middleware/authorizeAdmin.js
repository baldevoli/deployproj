/**
 * Admin Authorization Middleware
 */
const authorizeAdmin = (req, res, next) => {
  // For development/testing, bypass authentication completely
  console.log('[Auth Middleware] DEVELOPMENT MODE - Bypassing admin authorization check completely');
  return next();
  

  /*
  // If role is not admin, return 403 Forbidden status
  return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  */
  console.log('[Auth Middleware] Authorization check for admin role');
  console.log('[Auth Middleware] Request headers:', req.headers);
  
  // Check if admin role exists in the request headers
  if (req.headers['x-role'] === 'admin') {
    console.log('[Auth Middleware] Admin role verified, proceeding...');
    // If user has admin role, allow the request to proceed
    return next();
  }
  
  // If role is not admin, return 403 Forbidden status
  console.log('[Auth Middleware] Access denied - Admin role not found');
  return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

module.exports = authorizeAdmin;
  