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

export function getAdminAccounts() {
  return fetch(`${USERS_API}/api/users/admin/accounts`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "request failed");
    return data;
  });
}

export function createAdminAccount(payload) {
  return fetch(`${USERS_API}/api/users/admin/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(payload)
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "request failed");
    return data;
  });
}

export function setAdminActive(accountId, isActive) {
  return fetch(`${USERS_API}/api/users/admin/accounts/${accountId}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ isActive })
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "request failed");
    return data;
  });
}
