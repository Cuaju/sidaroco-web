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


export function getMe() {
  return fetch(`${USERS_API}/api/users/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || "request failed");
    return data;
  });
}

export function patchMe(payload) {
  return fetch(`${USERS_API}/api/users/me`, {
    method: "PATCH",
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

export function changeMyPassword(payload) {
  return fetch(`${USERS_API}/api/users/me/password`, {
    method: "PATCH",
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