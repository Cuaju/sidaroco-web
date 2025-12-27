<template>
    <ClientLayout>
        <section class="page">
            <h1>My Trips</h1>

            <div v-if="loading" class="state">
                Loading trips…
            </div>

            <div v-else-if="error" class="state error">
                <p>{{ error }}</p>
                <RouterLink to="/home" class="cta">
                    Volver a Home
                </RouterLink>
            </div>


            <div v-else-if="tickets.length === 0" class="state empty">
                <p>You don’t have any trips yet.</p>
                <RouterLink to="/home" class="cta">
                    Find a trip
                </RouterLink>
            </div>

            <div v-else class="tickets">
                <ticketCard v-for="t in tickets" :key="t.id" :ticket="t" />
            </div>
        </section>

    </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import ticketCard from "../components/ticketCard.vue";
import { useAuthStore } from "../stores/authStore";
import { getTicketsByUser } from "@/services/ticketsApi";

export default {
  components: { ClientLayout, ticketCard },

  data() {
    return {
      tickets: [],
      loading: false,
      error: ""
    };
  },

  async mounted() {
    await this.loadTickets();
  },

  methods: {
    async loadTickets() {
      this.loading = true;
      this.error = "";

      try {
        const auth = useAuthStore();
        const token = auth.token;
        const userId = auth.account?.id ?? 1;

        if (!token || !userId) {
          throw new Error("Not authenticated");
        }

        this.tickets = await getTicketsByUser(userId, token);
      } catch (e) {
        this.error = "No fue posible cargar tus viajes.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>


<style scoped>
.page {
    width: min(980px, 96vw);
    margin: 0 auto;
}

.tickets {
    display: grid;
    gap: 14px;
}

.state {
    padding: 32px 0;
    text-align: center;
    font-weight: 700;
    color: #555;
}

.state.empty p {
    margin-bottom: 14px;
}

.state.error {
    color: #b00020;
}

.cta {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 12px;
    background: #0fb9b1;
    color: #003c39;
    font-weight: 900;
    text-decoration: none;
}
</style>
