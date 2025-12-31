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

export async function getAvailableSchedules(routeId, date, token) {
  if (!Number.isInteger(Number(routeId)) || !date) {
    throw new Error("Invalid routeId or date");
  }

  const res = await fetch(
    `${TRIPS_API}/trips/${routeId}/schedules?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error fetching schedules");
  }

  return data;
}

export async function selectSchedule(routeId, date, hour, token) {
  if (!routeId || !date || !hour) {
    throw new Error("Invalid schedule data");
  }

  const res = await fetch(`${TRIPS_API}/trips/selectSchedule`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      routeId,
      date,
      hour
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error selecting schedule");
  }

  return data;
}

export async function getTicketsByTrip(tripId, token) {
  if (!Number.isInteger(Number(tripId))) {
    throw new Error("Invalid tripId");
  }

  const res = await fetch(`${TRIPS_API}/trips/${tripId}/tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error fetching tickets by trip");
  }

  return data;
}