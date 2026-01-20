import { useAuthStore } from "@/stores/authStore";

const SCHEDULE_API = import.meta.env.VITE_SCHEDULE_API_URL;

function getAuthHeaders() {
  const auth = useAuthStore();
  return {
    Authorization: `Bearer ${auth.token}`,
  };
}

/**
 * Get trips assigned to the logged-in driver within a date range
 * @param {string} from - Start date YYYY-MM-DD
 * @param {string} to - End date YYYY-MM-DD
 * @returns {Promise<Array>} Array of DriverTrip objects
 */
export async function getDriverTrips(from, to) {
  const params = new URLSearchParams({ from, to });

  const res = await fetch(`${SCHEDULE_API}/schedule/driver/trips?${params}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error fetching trips");
  }

  return data;
}

/**
 * Get detailed info for a specific trip
 * @param {number} tripId 
 * @returns {Promise<Object>} Trip detail
 */
export async function getDriverTripDetail(tripId) {
  const res = await fetch(`${SCHEDULE_API}/schedule/driver/trips/${tripId}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error fetching trip detail");
  }

  return data;
}

/**
 * Get passenger manifest for a trip
 * @param {number} tripId 
 * @returns {Promise<Object>} { tripId, passengerCount, passengers: [...] }
 */
export async function getDriverTripPassengers(tripId) {
  const res = await fetch(`${SCHEDULE_API}/schedule/driver/trips/${tripId}/passengers`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Error fetching passenger list");
  }

  return data;
}
