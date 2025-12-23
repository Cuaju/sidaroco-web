const AUTH_API = import.meta.env.VITE_AUTH_API_URL;

export async function loginRequest(email, password) {
  console.log("AUTH_API =", AUTH_API);
  const res = await fetch(`${AUTH_API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}
