import { useAuthStore } from "@/stores/authStore";

console.log("routesApi cargado");

const ROUTES_API = import.meta.env.VITE_ROUTE_API_URL;
console.log("ROUTES_API =", ROUTES_API);

function getAuthHeaders() {
  const auth = useAuthStore();
  return {
    Authorization: `Bearer ${auth.token}`,
  };
}

export async function getRoutes({
  skip,
  take,
  q,
  name,
  origin,
  destination,
  featured,
} = {}) {
  const params = new URLSearchParams();

  if (take) params.append("take", take);
  if (skip) params.append("skip", skip);
  if (name?.trim()) params.append("q", name.trim());
  if (origin) params.append("origin", origin);
  if (destination) params.append("destination", destination);
  if (q) params.append("q", q);
  if (typeof featured === "boolean") {
    params.append("featured", String(featured));
  }

  const res = await fetch(`${ROUTES_API}/routes/?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
}


export async function toggleFeatured(id) {
  const res = await fetch(`${ROUTES_API}/routes/${id}/toggleFeatured`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || data.message || "Error toggling featured");
  }

  return data;
}

export async function createRoute(formData) {
  const res = await fetch(`${ROUTES_API}/routes/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("BACKEND RESPONSE:", data);
    throw new Error(data.detail || data.message || "Error creating route");
  }

  return data;
}

export async function deleteRoute(id) {
  const res = await fetch(`${ROUTES_API}/routes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al eliminar ruta");
  }

  return true;
}

export async function updateRoute(id, formData) {
  const res = await fetch(`${ROUTES_API}/routes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  console.log("UPDATE ROUTE RESPONSE", res.status, data);

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || "Error updating route"
    );
  }

  return data;
}


export async function getRouteById(id) {
  const res = await fetch(`${ROUTES_API}/routes/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener la ruta");
  }

  return data;
}


export async function getFeaturedRoutes() {
  const res = await fetch(`${ROUTES_API}/routes/featured`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ([]));

  if (!res.ok) {
    const msg = data?.detail || data?.message || "Error loading featured routes";
    throw new Error(msg);
  }

  return data; 
}
