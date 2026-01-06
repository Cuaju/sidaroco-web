import { useAuthStore } from "@/stores/authStore";

console.log("fleetApi cargado");

const FLEET_API = import.meta.env.VITE_FLEET_API_URL;
console.log("FLEET_API =", FLEET_API);

function getAuthHeaders() {
  const auth = useAuthStore();
  return {
    Authorization: `Bearer ${auth.token}`,
  };
}

// ==================== BUSES ====================

export async function getAllBuses() {
  console.log("getAllBuses ejecutándose");

  const res = await fetch(`${FLEET_API}/buses/`, {
    headers: getAuthHeaders(),
  });
  console.log("STATUS =", res.status);

  const data = await res.json();
  console.log("DATA =", data);

  return data;
}

export async function getBusById(id) {
  const res = await fetch(`${FLEET_API}/buses/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener el autobús");
  }

  return data;
}

export async function createBus(formData) {
  const res = await fetch(`${FLEET_API}/buses/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al crear autobús");
  }

  return data;
}

export async function updateBus(id, formData) {
  const res = await fetch(`${FLEET_API}/buses/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar autobús");
  }

  return data;
}

export async function deleteBus(id) {
  const res = await fetch(`${FLEET_API}/buses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al eliminar autobús");
  }

  return true;
}

// ==================== DRIVERS ====================

export async function getAllDrivers() {
  console.log("getAllDrivers ejecutándose");

  const res = await fetch(`${FLEET_API}/drivers/`, {
    headers: getAuthHeaders(),
  });
  console.log("STATUS =", res.status);

  const data = await res.json();
  console.log("DATA =", data);

  return data;
}

export async function getDriverById(id) {
  const res = await fetch(`${FLEET_API}/drivers/${id}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener el conductor");
  }

  return data;
}

export async function createDriver(formData) {
  const res = await fetch(`${FLEET_API}/drivers/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al crear conductor");
  }

  return data;
}

export async function updateDriver(id, formData) {
  const res = await fetch(`${FLEET_API}/drivers/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar conductor");
  }

  return data;
}

export async function deleteDriver(id) {
  const res = await fetch(`${FLEET_API}/drivers/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al eliminar conductor");
  }

  return true;
}
