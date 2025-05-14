// utils/getClientIp.js
function getClientIp(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');

    return forwarded?.split(',')[0] || xRealIp || request.socket?.remoteAddress || 'unknown';
}

module.exports = getClientIp;
