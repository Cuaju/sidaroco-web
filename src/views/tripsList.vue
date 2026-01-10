<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <button class="backBtn" @click="goHome">
          ← Back to Home
        </button>
        <h1>Available schedules</h1>
        <p>Select a departure time</p>

        <div class="dateNavigation">
          <button class="navBtn" @click="previousDay" :disabled="isToday" :class="{ disabled: isToday }">
            ← Previous
          </button>

          <div class="dateInfo">
            <div class="currentDate">{{ formatDate(selectedDate) }}</div>
            <div v-if="isToday" class="todayBadge">Today</div>
          </div>

          <button class="navBtn" @click="nextDay">
            Next →
          </button>
        </div>

        <div class="searchCard">
          <div v-if="loading" class="loadingState">
            Loading schedules...
          </div>

          <div v-else-if="schedules.length === 0" class="emptyState">
            No available schedules for this route on this date.
          </div>

          <div v-else class="schedulesGrid">
            <div v-for="schedule in schedules" :key="schedule.hour" class="scheduleCard"
              @click="selectHour(schedule.hour, schedule.tripId)">
              <div class="scheduleTime">
                <div class="hourDisplay">{{ schedule.hour }}</div>
              </div>

              <div class="scheduleDetails">
                <div class="detailRow">
                  <span class="detailLabel">Price</span>
                  <span class="detailValue price">${{ routePrice.toFixed(2) }}</span>
                </div>

                <div class="detailRow">
                  <span class="detailLabel">Available seats</span>
                  <span class="detailValue seats" :class="{ 'lowSeats': schedule.availableSeats < 10 }">
                    {{ schedule.availableSeats }} / {{ schedule.totalSeats }}
                  </span>
                </div>
              </div>

              <div class="selectBtn">
                Select →
              </div>
            </div>
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
  selectSchedule,
  getTicketsByTrip
} from "@/services/tripsApi";
import { getRouteById } from "@/services/routesApi";
import { getTripById } from "@/services/scheduleApi";
import { getBusById } from "@/services/fleetApi";

export default {
  components: { ClientLayout },
  data() {
    return {
      schedules: [],
      routePrice: 0,
      selectedDate: null,
      loading: true,
      routeId: null
    };
  },
  computed: {
    isToday() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${currentYear}-${month}-${day}`;
      return this.selectedDate === today;
    }
  },
  async mounted() {
    const { routeId, date } = this.$route.query;
    this.routeId = routeId;
    this.selectedDate = date || this.formatDateToISO(this.getNowUtcMinus6());

    await this.loadSchedules();
  },
  watch: {
    "$route.query.date"(newDate) {
      if (!newDate || newDate === this.selectedDate) return;

      this.selectedDate = newDate;
      this.loadSchedules();
    },
    selectedDate() {
      this.loadSchedules();
    }
  },

  methods: {
    goHome() {
      this.$router.push({ name: "home" });
    },
    getNowUtcMinus6() {
      const now = new Date();
      return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    },
    formatDateToISO(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    getCurrentTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    isScheduleInFuture(scheduleHour) {
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

      const [h, m] = scheduleHour.split(":").map(Number);
      const scheduleTimeInMinutes = h * 60 + m;

      console.log("NOW (LOCAL):", currentTimeInMinutes);
      console.log("SCHEDULE:", scheduleHour, scheduleTimeInMinutes);

      return scheduleTimeInMinutes > currentTimeInMinutes;
    },

    async loadSchedules() {
      try {
        const token = localStorage.getItem("token");
        this.loading = true;

        const route = await getRouteById(this.routeId);
        this.routePrice = route.ticketPrice || 0;

        const rawSchedules = await getAvailableSchedules(
          this.routeId,
          this.selectedDate,
          token
        );        
        console.log("RAW SCHEDULES FROM API:", rawSchedules);

        let filteredSchedules;

        if (this.isToday) {
          filteredSchedules = rawSchedules
            .filter(schedule => this.isScheduleInFuture(schedule.hour))
            .sort((a, b) => {
              const [ah, am] = a.hour.split(":").map(Number);
              const [bh, bm] = b.hour.split(":").map(Number);
              return ah * 60 + am - (bh * 60 + bm);
            });
        } else {
          filteredSchedules = rawSchedules;
        }

        console.log("FILTERED + SORTED SCHEDULES:", filteredSchedules);

        this.schedules = await Promise.all(
          filteredSchedules.map(async (schedule) => {
            try {
              const trip = await selectSchedule(
                this.routeId,
                this.selectedDate,
                schedule.hour,
                token
              );

              const tripDetails = await getTripById(trip.id);
              const bus = await getBusById(tripDetails.busId);

              const tickets = await getTicketsByTrip(trip.id, token);
              const occupiedSeats = tickets.length;
              const availableSeats = bus.capacity - occupiedSeats;

              return {
                hour: schedule.hour,
                tripId: trip.id,
                totalSeats: bus.capacity,
                availableSeats: availableSeats
              };
            } catch (error) {
              console.error(`Error loading schedule ${schedule.hour}:`, error);
              return {
                hour: schedule.hour,
                tripId: null,
                totalSeats: 0,
                availableSeats: 0
              };
            }
          })
        );

        this.loading = false;
      } catch (error) {
        console.error("Error loading schedules:", error);
        this.schedules = [];
        this.loading = false;
      }
    },

    previousDay() {
      if (this.isToday) return;

      const currentDate = new Date(this.selectedDate + "T00:00:00");
      currentDate.setDate(currentDate.getDate() - 1);

      const today = this.getNowUtcMinus6();
      today.setHours(0, 0, 0, 0);

      if (currentDate.getTime() < today.getTime()) return;

      this.selectedDate = this.formatDateToISO(currentDate);
      this.updateRouteAndLoad();
    },

    nextDay() {
      const currentDate = new Date(this.selectedDate + "T00:00:00");
      currentDate.setDate(currentDate.getDate() + 1);
      this.selectedDate = this.formatDateToISO(currentDate);
      this.updateRouteAndLoad();
    },

    updateRouteAndLoad() {
      this.$router.replace({
        name: "tripsList",
        query: {
          routeId: this.routeId,
          date: this.selectedDate
        }
      });
    },

    formatDate(dateString) {
      if (!dateString) return "";

      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };

      return date.toLocaleDateString('en-US', options);
    },

    async selectHour(hour, tripId) {
      if (!tripId) {
        alert("This schedule is not available");
        return;
      }

      const trip = await getTripById(tripId);

      this.$router.push({
        name: "seatSelection",
        params: { tripId: trip.id },
        query: {
          date: this.selectedDate,
          time: trip.departureTime
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;
@use "sass:color";

.backBtn {
  margin-bottom: 44px;
  background: transparent;
  border: none;
  color: $thirdColor;
  font-weight: 800;
  cursor: pointer;
}

.hero {
  min-height: calc(100vh - 80px);
  padding: 44px 18px 60px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 45%, #001a18 100%);
  display: flex;
  flex-direction: column;
}

.heroInner {
  width: min(980px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
  flex: 1;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
}

p {
  margin: 10px 0 8px;
  opacity: 0.9;
  font-weight: 700;
}

.dateNavigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 20px 0;
  padding: 16px;
  background: rgba($fourthColor, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.navBtn {
  padding: 12px 24px;
  background: $fourthColor;
  color: $primaryColor;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover:not(.disabled) {
    background: color.adjust($fourthColor, $lightness: -5%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active:not(.disabled) {
    transform: translateY(0);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: rgba($fourthColor, 0.6);
  }
}

.dateInfo {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.currentDate {
  font-size: clamp(16px, 2.2vw, 20px);
  font-weight: 900;
  color: $fourthColor;
  letter-spacing: 0.3px;
}

.todayBadge {
  display: inline-block;
  padding: 4px 12px;
  background: $secondaryColor;
  color: $fourthColor;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.searchCard {
  background: rgba($fourthColor, 0.94);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.loadingState,
.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg,
      rgba($secondaryColor, 0.15),
      rgba($primaryColor, 0.08));
  color: color.adjust($primaryColor, $lightness: -8%);
  font-weight: 800;
  font-size: 16px;
  text-align: center;
  letter-spacing: 0.3px;
  border: 2px dashed rgba($primaryColor, 0.25);
}

.schedulesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.scheduleCard {
  background: linear-gradient(135deg,
      $thirdColor,
      color.adjust($thirdColor, $lightness: 8%));
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 2px solid transparent;
}

.scheduleCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: color.adjust($thirdColor, $lightness: 15%);
}

.scheduleTime {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba($primaryColor, 0.15);
}

.hourDisplay {
  font-size: clamp(32px, 4vw, 42px);
  font-weight: 1000;
  color: $primaryColor;
  letter-spacing: -1px;
}

.scheduleDetails {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detailRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detailLabel {
  font-size: 14px;
  color: color.adjust($primaryColor, $lightness: 10%);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detailValue {
  font-size: clamp(16px, 2.2vw, 20px);
  font-weight: 900;
  color: $primaryColor;
}

.detailValue.price {
  color: color.adjust($secondaryColor, $lightness: -10%);
}

.detailValue.seats {
  color: $primaryColor;
}

.detailValue.seats.lowSeats {
  color: #d32f2f;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.selectBtn {
  margin-top: auto;
  padding-top: 12px;
  text-align: center;
  color: $primaryColor;
  font-weight: 900;
  font-size: 15px;
  border-top: 2px solid rgba($primaryColor, 0.15);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.scheduleCard:hover .selectBtn {
  color: color.adjust($primaryColor, $lightness: -15%);
}

@media (max-width: 768px) {
  .dateNavigation {
    flex-direction: column;
    gap: 12px;
  }

  .navBtn {
    width: 100%;
    padding: 14px 20px;
  }

  .schedulesGrid {
    grid-template-columns: 1fr;
  }

  .hourDisplay {
    font-size: 36px;
  }
}
</style>