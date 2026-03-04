export async function onRequest(context) {
  const { request, env } = context;
  const bucket = env.IMAGES_BUCKET;
  const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

  const listed = await bucket.list();
  const allFiles = listed.objects.map(obj => ({
    filename: obj.key,
    imageUrl: `${R2_PUBLIC_URL}/${obj.key}`
  }));

  return new Response(JSON.stringify({ items: allFiles }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
