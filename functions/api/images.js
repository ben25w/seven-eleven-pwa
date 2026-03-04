export async function onRequest(context) {
  const { request, env } = context;
  const bucket = env.IMAGES_BUCKET;
  const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

  // LIST all images
  if (request.method === 'GET') {
    const listed = await bucket.list();
    const files = listed.objects.map(obj => ({
      filename: obj.key,
      url: `${R2_PUBLIC_URL}/${obj.key}`
    }));
    return new Response(JSON.stringify({ images: files }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // UPLOAD a new image
  if (request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file received' }), { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `item_${Date.now()}.${ext}`;

    await bucket.put(filename, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    return new Response(JSON.stringify({
      success: true,
      filename,
      url: `${R2_PUBLIC_URL}/${filename}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // DELETE an image
  if (request.method === 'DELETE') {
    const { filename } = await request.json();
    if (!filename) {
      return new Response(JSON.stringify({ error: 'No filename provided' }), { status: 400 });
    }

    await bucket.delete(filename);

    // Also remove from active_items if it was in there
    return new Response(JSON.stringify({ success: true, deleted: filename }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
