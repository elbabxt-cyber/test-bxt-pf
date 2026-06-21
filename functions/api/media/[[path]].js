// GET /api/media/<key>  -> R2 객체 서빙 (공개)
export async function onRequestGet({ env, params }) {
  // [[path]] 는 배열로 들어온다: ["projects", "123-abc.jpg"]
  const key = Array.isArray(params.path) ? params.path.join("/") : params.path;

  const object = await env.MEDIA.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
