const db = require('./db');
const { verifyToken, getAuthorizationToken } = require('./auth');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
    const data = JSON.parse(event.body);
    const { aspiration_id, author_name, content } = data;

    const query = `
      INSERT INTO comments (aspiration_id, author_name, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [aspiration_id, author_name, content];

    const { rows } = await db.query(query, values);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          author: rows[0].author_name,
          content: rows[0].content,
          date: rows[0].created_at
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal menyimpan komentar' }),
    };
  }
};
