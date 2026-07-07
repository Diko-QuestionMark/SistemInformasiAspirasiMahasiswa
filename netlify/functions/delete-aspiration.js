const db = require('./db');
const { verifyToken, getAuthorizationToken } = require('./auth');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const token = getAuthorizationToken(event.headers);
  if (!verifyToken(token)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { id } = JSON.parse(event.body);

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'ID aspirasi tidak ditemukan' }) };
    }

    const query = 'DELETE FROM aspirations WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Aspirasi tidak ditemukan' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Aspirasi berhasil dihapus' }),
    };
  } catch (error) {
    console.error('Error deleting aspiration:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Terjadi kesalahan pada server saat menghapus aspirasi' }),
    };
  }
};
