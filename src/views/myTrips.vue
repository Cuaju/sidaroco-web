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

      <div v-else class="ticketsList">
        <TicketCard 
          v-for="ticket in tickets" 
          :key="ticket.id" 
          :ticket="ticket"
        />
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

        // Fetch route information for each trip
        const routeIds = [...new Set(trips.map(t => t.routeId))];
        console.log('🗺️ Route IDs:', routeIds);
        
        const routes = await Promise.all(
          routeIds.map(routeId => getRouteById(routeId))
        );
        console.log('🗺️ Routes received:', routes);
        
        const routesById = Object.fromEntries(
          routes.map(r => [r.id, r])
        );

        // Fetch all locations (origin and destination)
        const locationIds = [...new Set(
          routes.flatMap(r => [r.originId, r.destinationId])
        )];
        console.log('📍 Location IDs:', locationIds);

        // Assuming you have a getLocationById function - if not, we'll extract from route.origin/destination
        // For now, let's work with what we have
        
        this.tickets = tickets.map(t => {
          const trip = tripsById[t.tripId];
          const route = trip ? routesById[trip.routeId] : null;
          
          const ticket = {
            ...t,
            trip,
            route,
            // Use route.ticketPrice if ticket.price is 0
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

.ticketsList {
  display: grid;
  gap: 12px;
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