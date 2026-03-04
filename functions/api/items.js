export async function onRequest(context) {
  try {
    const db = context.env.DB;
    const R2_PUBLIC_URL = context.env.R2_PUBLIC_URL;

    const { results } = await db.prepare(
      'SELECT id, image_key FROM items ORDER BY id'
    ).all();

    const items = results.map(row => ({
      id: row.id,
      imageUrl: `${R2_PUBLIC_URL}/${row.image_key}`
    }));

    return new Response(JSON.stringify({ items }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
