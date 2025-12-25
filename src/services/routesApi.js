console.log("routesApi cargado");

const ROUTES_API = import.meta.env.VITE_ROUTE_API_URL;
console.log("ROUTES_API =", ROUTES_API);

export async function getRoutes() {
  console.log("getRoutes ejecutándose");
  const res = await fetch(`${ROUTES_API}/routes`);
  console.log("STATUS =", res.status);

  const data = await res.json();
  console.log("DATA =", data);

  return data;
}

export async function createRoute(payload) {
  const res = await fetch(`${ROUTES_API}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al crear ruta");
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

export async function updateRoute(id, payload) {
  const res = await fetch(`${ROUTES_API}/routes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar ruta");
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
