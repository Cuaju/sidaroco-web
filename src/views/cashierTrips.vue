<template>
  <CashierLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Available Schedules</h1>
        <p>Select a departure time for the customer</p>

        <div class="searchCard">
          <div v-if="schedules.length === 0" class="emptyState">
            No available schedules for this route and date.
          </div>

          <div v-else class="grid">
            <button v-for="s in schedules" :key="s.hour" class="scheduleBtn" @click="selectHour(s.hour)">
              <span class="time">{{ s.hour }}</span>
              <span class="label">Departure</span>
            </button>
          </div>

          <button class="backBtn" @click="goBack">
            ← Back to Search
          </button>
        </div>
      </div>
    </section>
  </CashierLayout>
</template>

<script>
import CashierLayout from "../layouts/cashierLayout.vue";
import { getAvailableSchedules, selectSchedule } from "@/services/tripsApi";

export default {
  components: { CashierLayout },

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
        name: "cashierSeatSelection",
        params: { tripId: trip.id },
        query: {
          date: this.$route.query.date,
          time: trip.departureTime
        }
      });
    },

    goBack() {
      this.$router.push({ name: "cashierHome" });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;
@use "sass:color";

.hero {
  min-height: calc(100vh - 140px);
  padding: 44px 18px 28px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
  display: flex;
  align-items: center;
}

.heroInner {
  width: min(700px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
  text-align: center;
}

p {
  margin: 10px 0 18px;
  opacity: 0.9;
  font-weight: 700;
  text-align: center;
}

.searchCard {
  background: rgba($fourthColor, 0.94);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba($secondaryColor, 0.15), rgba($primaryColor, 0.08));
  color: color.adjust($primaryColor, $lightness: -8%);
  font-weight: 800;
  font-size: 16px;
  text-align: center;
  letter-spacing: 0.3px;
  border: 2px dashed rgba($primaryColor, 0.25);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
}

.scheduleBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 80px;
  border: 2px solid rgba($primaryColor, 0.2);
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba($primaryColor, 0.08), rgba($secondaryColor, 0.08));
    border-color: $primaryColor;
    transform: translateY(-2px);
  }

  .time {
    font-size: 24px;
    font-weight: 900;
    color: $primaryColor;
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
}

.backBtn {
  margin-top: 20px;
  width: 100%;
  height: 48px;
  border: 2px solid rgba($primaryColor, 0.3);
  border-radius: 12px;
  background: transparent;
  color: $primaryColor;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($primaryColor, 0.08);
    border-color: $primaryColor;
  }
}
</style>
