const TRIPS_API = import.meta.env.VITE_TICKET_API_URL;

export async function getTripsByIds(tripIds, token) {
  if (!Array.isArray(tripIds) || tripIds.length === 0) {
    throw new Error("Invalid tripIds");
  }

  const idsParam = tripIds.join(",");

  const res = await fetch(`${TRIPS_API}/trips/byIds?ids=${idsParam}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener trips");
  }

  return data;
}
