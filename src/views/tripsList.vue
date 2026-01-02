<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Available schedules</h1>
        <p>Select a departure time</p>

        <div class="searchCard">
          <div v-if="schedules.length === 0" class="emptyState">
            No available schedules for this route.
          </div>

          <div v-else class="grid">
            <button v-for="s in schedules" :key="s.hour" class="cta" @click="selectHour(s.hour)">
              {{ s.hour }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import {
  getAvailableSchedules,
  selectSchedule
} from "@/services/tripsApi";

export default {
  components: { ClientLayout },
  data() {
    return {
      schedules: []
    };
  },
  async mounted() {
    try {
      const { routeId, date } = this.$route.query;
      const token = localStorage.getItem("token");
      this.schedules = await getAvailableSchedules(routeId, date, token);
    } catch {
      this.schedules = [];
    }
  },
  methods: {
    async selectHour(hour) {
      const { routeId, date } = this.$route.query;
      const token = localStorage.getItem("token");

      const trip = await selectSchedule(routeId, date, hour, token);

      this.$router.push({
        name: "seatSelection",
        params: { tripId: trip.id }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;
@use "sass:color";

.hero {
  padding: 44px 18px 28px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
}

.heroInner {
  width: min(980px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
}

p {
  margin: 10px 0 18px;
  opacity: 0.9;
  font-weight: 700;
}

.searchCard {
  background: rgba($fourthColor, 0.94);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba($secondaryColor, 0.15),
    rgba($primaryColor, 0.08)
  );
  color: color.adjust($primaryColor, $lightness: -8%);
  font-weight: 800;
  font-size: 16px;
  text-align: center;
  letter-spacing: 0.3px;
  border: 2px dashed rgba($primaryColor, 0.25);
}

.grid {
  display: grid;
  gap: 14px;
}

.cta {
  height: 48px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg,
      $thirdColor,
      color.adjust($thirdColor, $lightness: 8%));
  color: $primaryColor;
  font-weight: 1000;
  cursor: pointer;
}
</style>
