console.log("scheduleApi cargado");

const SCHEDULE_API = import.meta.env.VITE_SCHEDULE_API_URL;
console.log("SCHEDULE_API =", SCHEDULE_API);

// ==================== HELPERS ====================

function formatDate(date) {
  // Returns YYYY-MM-DD
  if (typeof date === "string") return date;
  return date.toISOString().split("T")[0];
}

// ==================== SCHEDULES ====================

export async function getScheduleRange(from, to) {
  const params = new URLSearchParams({
    from: formatDate(from),
    to: formatDate(to),
  });

  const res = await fetch(`${SCHEDULE_API}/schedule/range?${params}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener resumen de schedules");
  }

  return data;
}

export async function getScheduleSummary() {
  const res = await fetch(`${SCHEDULE_API}/schedule/summary`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener resumen");
  }

  return data;
}

export async function getTripsByIds(tripIds) {
  if (!Array.isArray(tripIds) || tripIds.length === 0) {
    return [];
  }

  const trips = await Promise.all(
    tripIds.map(async (id) => {
      try {
        return await getTripById(id);
      } catch {
        return null;
      }
    })
  );

  return trips.filter(Boolean);
}

export async function getScheduleForDay(date) {
  const res = await fetch(`${SCHEDULE_API}/schedule/${formatDate(date)}`);

  if (res.status === 404) {
    return null; // No schedule for this day
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener schedule del día");
  }

  return data;
}

export async function createEmptySchedule(date) {
  const res = await fetch(`${SCHEDULE_API}/schedule/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: formatDate(date) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al crear schedule");
  }

  return data;
}

export async function deleteSchedule(date) {
  const res = await fetch(`${SCHEDULE_API}/schedule/${formatDate(date)}`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al eliminar schedule");
  }

  return data;
}

export async function lockSchedule(date) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/lock`,
    { method: "POST" }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al bloquear schedule");
  }

  return data;
}

export async function unlockSchedule(date) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/unlock`,
    { method: "POST" }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al desbloquear schedule");
  }

  return data;
}

export async function duplicateSchedule(sourceDate, targetDate) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(sourceDate)}/duplicate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetDate: formatDate(targetDate) }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al duplicar schedule");
  }

  return data;
}

// ==================== TRIPS ====================

export async function addTrip(date, tripData) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/trip`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formatDate(date),
        routeId: tripData.routeId,
        busId: tripData.busId,
        driverId: tripData.driverId,
        departureTime: tripData.departureTime, // HH:MM or HH:MM:SS
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al agregar viaje");
  }

  return data;
}

export async function updateTrip(date, tripId, tripData) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/trip/${tripId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al actualizar viaje");
  }

  return data;
}

export async function deleteTrip(date, tripId) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/trip/${tripId}`,
    { method: "DELETE" }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al eliminar viaje");
  }

  return data;
}

export async function cancelTrip(date, tripId) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/trip/${tripId}/cancel`,
    { method: "POST" }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al cancelar viaje");
  }

  return data;
}

export async function completeTrip(date, tripId) {
  const res = await fetch(
    `${SCHEDULE_API}/schedule/${formatDate(date)}/trip/${tripId}/complete`,
    { method: "POST" }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al completar viaje");
  }

  return data;
}

export async function getTripById(tripId) {
  const res = await fetch(`${SCHEDULE_API}/schedule/trip/${tripId}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener trip");
  }

  return data;
}

export async function getScheduleById(scheduleId) {
  const res = await fetch(`${SCHEDULE_API}/schedule/byId/${scheduleId}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener schedule por ID");
  }

  return data;
}