<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Available schedules</h1>
        <p>Select a departure time</p>
        <div v-if="selectedDate" class="dateInfo">
          Schedules for {{ formatDate(selectedDate) }}
        </div>

        <div class="searchCard">
          <div v-if="loading" class="loadingState">
            Loading schedules...
          </div>

          <div v-else-if="schedules.length === 0" class="emptyState">
            No available schedules for this route on this date.
          </div>

          <div v-else class="schedulesGrid">
            <div 
              v-for="schedule in schedules" 
              :key="schedule.hour" 
              class="scheduleCard"
              @click="selectHour(schedule.hour, schedule.tripId)"
            >
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
      loading: true
    };
  },
  async mounted() {
    try {
      const { routeId, date } = this.$route.query;
      const token = localStorage.getItem("token");

      this.selectedDate = date;
      this.loading = true;

      const route = await getRouteById(routeId);
      this.routePrice = route.ticketPrice || 0;

      const rawSchedules = await getAvailableSchedules(routeId, date, token);

      this.schedules = await Promise.all(
        rawSchedules.map(async (schedule) => {
          try {
            const trip = await selectSchedule(routeId, date, schedule.hour, token);
            
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
  methods: {
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
          date: this.$route.query.date,
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

.dateInfo {
  text-align: center;
  font-size: clamp(14px, 2vw, 16px);
  opacity: 0.85;
  margin: 0 0 18px;
  font-weight: 600;
  letter-spacing: 0.3px;
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
  0%, 100% {
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
  .schedulesGrid {
    grid-template-columns: 1fr;
  }
  
  .hourDisplay {
    font-size: 36px;
  }
}
</style>