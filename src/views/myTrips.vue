<template>
  <ClientLayout>
    <section class="tripsPage">
      <h1>My Trips</h1>

      <div v-if="loading" class="state">
        Loading trips…
      </div>

      <div v-else-if="error" class="state error">
        <p>{{ error }}</p>
        <RouterLink to="/home" class="cta">
          Back to Home
        </RouterLink>
      </div>

      <div v-else-if="tickets.length === 0" class="state empty">
        <p>You don't have any trips yet.</p>
        <RouterLink to="/home" class="cta">
          Find a trip
        </RouterLink>
      </div>

      <div v-else class="tripGroups">
        <div v-for="group in groupedTickets" :key="group.tripId" class="tripGroup">
          <div class="tripHeader">
            <div class="tripInfo">
              <span class="routeName">{{ group.routeName }}</span>
              <span class="tripDate">{{ formatDate(group.departureTime) }} at {{ formatTime(group.departureTime)
              }}</span>
            </div>
            <div class="tripMeta">
              <span class="ticketCount">{{ group.tickets.length }} ticket{{ group.tickets.length > 1 ? 's' : ''
              }}</span>
              <span class="statusBadge" :class="getTripStatus(group.departureTime).class">
                {{ getTripStatus(group.departureTime).label }}
              </span>
            </div>
          </div>
          <div class="ticketsList">
            <TicketCard v-for="ticket in group.tickets" :key="ticket.id" :ticket="ticket" />
          </div>
        </div>
      </div>
    </section>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import TicketCard from "../components/ticketCard.vue";
import { useAuthStore } from "../stores/authStore";
import { getTicketsByUser } from "@/services/ticketsApi";
import { getTripsByIds, getScheduleById } from "@/services/scheduleApi";
import { getRouteById } from "@/services/routesApi";

export default {
  components: { ClientLayout, TicketCard },

  data() {
    return {
      tickets: [],
      loading: false,
      error: ""
    };
  },

  computed: {
    auth() {
      return useAuthStore();
    },

    groupedTickets() {
      const groups = {};

      for (const ticket of this.tickets) {
        const tripId = ticket.tripId;
        if (!groups[tripId]) {
          groups[tripId] = {
            tripId,
            routeName:
              ticket.route?.origin?.name && ticket.route?.destination?.name
                ? `${ticket.route.origin.name} → ${ticket.route.destination.name}`
                : ticket.route?.name || 'Route not available',
            departureTime: ticket.trip?.departureTime ? new Date(ticket.trip.departureTime) : null,
            tickets: []
          };
        }
        groups[tripId].tickets.push(ticket);
      }

      return Object.values(groups).sort((a, b) => {
        if (!a.departureTime) return 1;
        if (!b.departureTime) return -1;
        return b.departureTime - a.departureTime;
      });
    }
  },

  watch: {
    "auth.account.id": {
      immediate: true,
      handler(newUserId) {
        if (typeof newUserId === "string" && newUserId) {
          this.loadTickets();
        }
      }
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      const d = date instanceof Date ? date : new Date(date);

      const year = d.getUTCFullYear();
      const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const day = d.getUTCDate();

      return `${month} ${day}, ${year}`;
    },

    formatTime(date) {
      if (!date) return 'N/A';
      const d = date instanceof Date ? date : new Date(date);

      const hours = d.getUTCHours();
      const minutes = d.getUTCMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;

      return `${hour12}:${minutes} ${ampm}`;
    },

    getTripStatus(departureTime) {
      if (!departureTime) {
        return { label: 'Unknown', class: 'unknown' };
      }
      const now = new Date();
      if (departureTime < now) {
        return { label: 'Completed', class: 'completed' };
      }
      return { label: 'Upcoming', class: 'upcoming' };
    },

    async loadTickets() {
      this.loading = true;
      this.error = "";

      try {
        const userId = this.auth.account.id;
        if (typeof userId !== "string") return;
        const token = this.auth.token;

        console.log('🎫 Fetching tickets for user:', userId);
        const tickets = await getTicketsByUser(userId, token);
        console.log('🎫 Tickets received:', tickets);

        const tripIds = [...new Set(tickets.map(t => t.tripId))];
        console.log('🚌 Trip IDs:', tripIds);

        const trips = await getTripsByIds(tripIds, token);
        console.log('🚌 Trips received:', trips);

        const scheduleIds = [...new Set(trips.map(t => t.dailyScheduleId).filter(Boolean))];
        console.log('Schedule IDs:', scheduleIds);

        const schedules = await Promise.all(
          scheduleIds.map(async (id) => {
            try {
              return await getScheduleById(id);
            } catch {
              return null;
            }
          })
        );
        console.log('Schedules received:', schedules);

        const schedulesById = Object.fromEntries(
          schedules.filter(Boolean).map(s => [s.id, s])
        );

        const tripsById = Object.fromEntries(
          trips.map(t => {
            const schedule = schedulesById[t.dailyScheduleId];
            if (schedule?.serviceDate && t.departureTime) {
              const timeOnly = new Date(t.departureTime);
              const serviceDate = new Date(schedule.serviceDate);

              const combinedDateTime = new Date(serviceDate);
              combinedDateTime.setUTCHours(
                timeOnly.getUTCHours(),
                timeOnly.getUTCMinutes(),
                timeOnly.getUTCSeconds(),
                0
              );

              return [t.id, { ...t, departureTime: combinedDateTime.toISOString() }];
            }
            return [t.id, t];
          })
        );

        const routeIds = [...new Set(trips.map(t => t.routeId))];
        console.log('🗺️ Route IDs:', routeIds);

        const routes = await Promise.all(
          routeIds.map(routeId => getRouteById(routeId))
        );
        console.log('🗺️ Routes received:', routes);

        const routesById = Object.fromEntries(
          routes.map(r => [r.id, r])
        );

        const locationIds = [...new Set(
          routes.flatMap(r => [r.originId, r.destinationId])
        )];
        console.log('📍 Location IDs:', locationIds);

        this.tickets = tickets.map(t => {
          const trip = tripsById[t.tripId];
          const route = trip ? routesById[trip.routeId] : null;

          const ticket = {
            ...t,
            trip,
            route,
            price: t.price || route?.ticketPrice || 0
          };

          console.log('🎫 Processed ticket:', ticket);
          return ticket;
        });

        console.log('✅ Final tickets array:', this.tickets);

      } catch (e) {
        console.error('❌ Error loading tickets:', e);
        this.error = "Unable to load your trips.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.tripsPage {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 24px 0;
}

h1 {
  color: $primaryColor;
  font-weight: 900;
  margin-bottom: 20px;
}

.tripGroups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tripGroup {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tripHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba($primaryColor, 0.05);
  border-bottom: 1px solid rgba($primaryColor, 0.1);
  gap: 12px;
  flex-wrap: wrap;
}

.tripInfo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.routeName {
  font-weight: 800;
  font-size: 1.1rem;
  color: $primaryColor;
}

.tripDate {
  font-size: 0.9rem;
  color: rgba($primaryColor, 0.7);
}

.tripMeta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ticketCount {
  font-size: 0.85rem;
  color: rgba($primaryColor, 0.6);
  font-weight: 600;
}

.statusBadge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;

  &.upcoming {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.completed {
    background: #e8f5e9;
    color: #388e3c;
  }

  &.unknown {
    background: #f5f5f5;
    color: #757575;
  }
}

.ticketsList {
  display: grid;
  gap: 1px;
  background: rgba($primaryColor, 0.1);
}

.ticketsList> :deep(.ticketCard) {
  background: white;
}

.state {
  padding: 40px;
  text-align: center;
  font-weight: 700;
  color: rgba($primaryColor, 0.6);
}

.state.empty p {
  margin-bottom: 16px;
}

.state.error {
  color: #e53935;
}

.cta {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 12px;
  background: $thirdColor;
  color: $primaryColor;
  font-weight: 900;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.05);
  }
}
</style>