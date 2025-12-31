<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Select your seat</h1>
        <p>Available seats for this trip</p>

        <div class="searchCard">
          <BusSeatGrid
            v-if="seats.length"
            :seats="seats"
            @select="selectSeat"
          />
        </div>
      </div>
    </section>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import BusSeatGrid from "@/components/BusSeatGrid.vue";
import { getTicketsByTrip } from "@/services/tripsApi";

export default {
  components: { ClientLayout, BusSeatGrid },
  data() {
    return {
      seats: []
    };
  },
  async mounted() {
    const { tripId } = this.$route.params;
    const token = localStorage.getItem("token");

    const tickets = await getTicketsByTrip(Number(tripId), token);
    const taken = new Set(tickets.map(t => t.seatNumber));

    this.seats = Array.from({ length: 40 }, (_, i) => ({
      number: i + 1,
      available: !taken.has(i + 1)
    }));
  },
  methods: {
    selectSeat(seatNumber) {
      console.log(seatNumber);
    }
  }
};
</script>


<style lang="scss" scoped>
@use "@/styles/colors" as *;

.hero {
  min-height: calc(100vh - 64px);
  padding: 40px 20px 16px;
  background: radial-gradient(
    circle at 30% 20%,
    $secondaryColor 0%,
    $primaryColor 55%,
    #001a18 100%
  );
  display: flex;
  align-items: center;
}

.heroInner {
  width: min(920px, 95vw);
  margin: 0 auto;
  color: $fourthColor;
}

.searchCard {
  margin-top: 24px;
  background: rgba($fourthColor, 0.96);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}
</style>
