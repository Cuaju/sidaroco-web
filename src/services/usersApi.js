const USERS_API = import.meta.env.VITE_USERS_API_URL;

async function post(path, body) {
  const res = await fetch(`${USERS_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "request failed");
  return data;
}

export function requestRegisterCode(payload) {
  return post("/api/users/register/request", payload);
}

export function verifyRegisterCode(payload) {
  return post("/api/users/register/verify", payload);
}

export function createProfile(payload) {
  return post("/api/users/profile", payload);
}
