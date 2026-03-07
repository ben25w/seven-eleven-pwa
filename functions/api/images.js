export async function onRequest(context) {
  const { request, env } = context;
  const bucket = env.IMAGES_BUCKET;
  const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

  const headers = { 'Content-Type': 'application/json' };

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'IMAGES_BUCKET binding not found. Check Cloudflare Pages bindings.' }), { status: 500, headers });
  }

  // GET — list all images
  if (request.method === 'GET') {
    const listed = await bucket.list();
    const images = listed.objects.map(obj => ({
      filename: obj.key,
      url: `${R2_PUBLIC_URL}/${obj.key}`
    }));
    return new Response(JSON.stringify({ images }), { headers });
  }

  // POST — upload a new image
  if (request.method === 'POST') {
    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) {
      return new Response(JSON.stringify({ success: false, error: 'No file received' }), { status: 400, headers });
    }
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `item_${Date.now()}.${ext}`;
    await bucket.put(filename, file.stream(), {
      httpMetadata: { contentType: file.type }
    });
    return new Response(JSON.stringify({ success: true, filename, url: `${R2_PUBLIC_URL}/${filename}` }), { headers });
  }

  // DELETE — remove an image
  if (request.method === 'DELETE') {
    const { filename } = await request.json();
    if (!filename) {
      return new Response(JSON.stringify({ success: false, error: 'No filename provided' }), { status: 400, headers });
    }
    await bucket.delete(filename);
    return new Response(JSON.stringify({ success: true, deleted: filename }), { headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}
