const db = require('./db');

exports.handler = async (event, context) => {
  try {
    const { rows: aspirations } = await db.query(`
      SELECT * FROM aspirations 
      WHERE is_private = false OR is_private IS NULL
      ORDER BY created_at DESC
    `);

    // Ambil semua komentar (untuk disatukan)
    const { rows: comments } = await db.query(`
      SELECT * FROM comments 
      ORDER BY created_at ASC
    `);

    // Gabungkan komentar ke dalam masing-masing aspirasi
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
