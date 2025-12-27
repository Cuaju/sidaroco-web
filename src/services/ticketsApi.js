console.log("ticketsApi cargado");

const TICKETS_API = import.meta.env.VITE_TICKET_API_URL;
console.log("TICKETS_API =", TICKETS_API);

export async function getTicketsByUser(userId, token) {
  const res = await fetch(`${TICKETS_API}/tickets/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener tickets");
  }

  return data;
}

export async function getTicketById(id, token) {
  const res = await fetch(`${TICKETS_API}/tickets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener ticket");
  }

  return data;
}

export async function createTicket(payload, token) {
  const res = await fetch(`${TICKETS_API}/tickets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al crear ticket");
  }

  return data;
}

export async function deleteTicket(id, token) {
  const res = await fetch(`${TICKETS_API}/tickets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Error al eliminar ticket");
  }

  return true;
}

export async function getDailyReport(date, token) {
  const res = await fetch(
    `${TICKETS_API}/reports/tickets/daily?date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener reporte diario");
  }

  return data;
}

export async function getMonthlyReport(year, month, token) {
  const res = await fetch(
    `${TICKETS_API}/reports/earnings/monthly?year=${year}&month=${month}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener reporte mensual");
  }

  return data;
}

export async function getMonthlyReportByRoute(year, month, routeId, token) {
  const res = await fetch(
    `${TICKETS_API}/reports/earnings/monthly/by-route?year=${year}&month=${month}&routeId=${routeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener reporte por ruta");
  }

  return data;
}
