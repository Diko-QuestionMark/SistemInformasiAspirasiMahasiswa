const db = require('./db');
const { verifyToken, getAuthorizationToken } = require('./auth');

exports.handler = async (event, context) => {
  const token = getAuthorizationToken(event.headers);
  if (!verifyToken(token)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { rows: aspirations } = await db.query(`
      SELECT * FROM aspirations 
      ORDER BY created_at DESC
    `);

    const { rows: comments } = await db.query(`
      SELECT * FROM comments 
      ORDER BY created_at ASC
    `);

    const result = aspirations.map(asp => {
      asp.comments = comments
        .filter(c => c.aspiration_id === asp.id)
        .map(c => ({
          author: c.author_name,
          content: c.content,
          date: c.created_at
        }));
      return asp;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal mengambil data dari database' }),
    };
  }
};
