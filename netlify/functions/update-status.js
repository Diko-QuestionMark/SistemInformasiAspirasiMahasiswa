const db = require('./db');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { id, status } = data;

    if (!id || !status) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Data tidak lengkap' }) };
    }

    const query = `
      UPDATE aspirations
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await db.query(query, [status, id]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal update status' }),
    };
  }
};
