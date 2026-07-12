export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { /* ... wie gehabt ... */ };

  const { email, password } = await request.json();

  if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: true, message: "Login erfolgreich" }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ success: false, message: "Falsche Zugangsdaten" }), { status: 401, headers });
}