console.log("routesApi cargado");

const ROUTES_API = import.meta.env.VITE_ROUTE_API_URL;
console.log("ROUTES_API =", ROUTES_API);

export async function getRoutes({ skip, take, q } = {}) {
  console.log("getRoutes ejecutándose", { skip, take, q });

  const params = new URLSearchParams();

  if (Number.isInteger(skip)) params.append("skip", String(skip));
  if (Number.isInteger(take)) params.append("take", String(take));
  if (typeof q === "string" && q.length > 0) params.append("q", q);

  const query = params.toString();
  const url = query ? `${ROUTES_API}/routes?${query}` : `${ROUTES_API}/routes`;

  const res = await fetch(url);
  console.log("STATUS =", res.status);

  const data = await res.json();
  console.log("DATA =", data);

  return data;
}
export async function toggleFeatured(id) {
  const res = await fetch(`${ROUTES_API}/routes/${id}/toggleFeatured`, {
    method: "PATCH",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || data.message || "Error toggling featured");
  }

  return data;
}

export async function createRoute(formData) {
  const res = await fetch(`${ROUTES_API}/routes`, {
    method: "POST",
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
  const res = await fetch(`${ROUTES_API}/routes/${id}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener la ruta");
  }

  return data;
}

