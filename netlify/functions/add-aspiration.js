const db = require('./db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { title, description, category, is_private } = data;

    const query = `
      INSERT INTO aspirations (title, description, category, is_private, status)
      VALUES ($1, $2, $3, $4, 'menunggu')
      RETURNING *;
    `;
    const values = [title, description, category, is_private || false];

    const { rows } = await db.query(query, values);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal menyimpan aspirasi' }),
    };
  }
};
