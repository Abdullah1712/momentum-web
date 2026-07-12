export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const { email, password } = await request.json();

  if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
    return new Response(
      JSON.stringify({ success: true, message: "Login erfolgreich" }),
      { status: 200, headers }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: "Falsche Zugangsdaten" }),
    { status: 401, headers }
  );
}

export async function onRequest(context) {
  const { request } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }
  return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), { status: 405, headers });
}