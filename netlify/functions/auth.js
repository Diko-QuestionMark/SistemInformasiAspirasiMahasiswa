const crypto = require('crypto');
require('dotenv').config();

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
const TOKEN_SECRET = process.env.ADMIN_SECRET || 'asmah_default_secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 4; // 4 jam

function base64Encode(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function base64Decode(value) {
  return Buffer.from(value, 'base64').toString('utf8');
}

function signPayload(payload) {
  const serialized = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(serialized).digest('hex');
  return `${base64Encode(serialized)}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encoded, signature] = parts;
  let payloadJson;
  try {
    payloadJson = base64Decode(encoded);
  } catch (error) {
    return false;
  }

  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadJson).digest('hex');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  let payload;
  try {
    payload = JSON.parse(payloadJson);
  } catch (error) {
    return false;
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return payload;
}

function createAdminToken(username) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    username,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  return signPayload(payload);
}

function getAuthorizationToken(headers = {}) {
  if (!headers) return null;
  const auth = headers.Authorization || headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function buildJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return buildJsonResponse(405, { error: 'Method Not Allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return buildJsonResponse(400, { error: 'JSON tidak valid' });
  }

  const { username, password } = payload;
  if (!username || !password) {
    return buildJsonResponse(400, { error: 'Username dan password wajib diisi' });
  }

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return buildJsonResponse(401, { error: 'Username atau password salah' });
  }

  const token = createAdminToken(username);
  return buildJsonResponse(200, { token });
};

module.exports = {
  ADMIN_USER,
  ADMIN_PASS,
  createAdminToken,
  verifyToken,
  getAuthorizationToken,
};
