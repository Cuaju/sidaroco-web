<template>
  <CashierLayout>
    <section class="hero">
      <div class="heroInner">
        <div class="header">
          <h1>Seat Selection</h1>
          <p>Select seats for the customer</p>
        </div>

        <div class="searchCard">
          <div class="mainContent">
            <div class="leftPanel">
              <!-- Seat Counter -->
              <div class="controlsSection">
                <div class="sectionTitle">Number of Seats</div>
                <div class="counter">
                  <button class="counterBtn" @click="decrement" :disabled="ticketsCount === 1">
                    <span>−</span>
                  </button>
                  <div class="counterDisplay">
                    <span class="counterNumber">{{ ticketsCount }}</span>
                    <span class="counterLabel">{{ ticketsCount === 1 ? 'Seat' : 'Seats' }}</span>
                  </div>
                  <button class="counterBtn" @click="increment" :disabled="ticketsCount >= maxSelectable">
                    <span>+</span>
                  </button>
                </div>
              </div>

              <div class="selectedInfo" v-if="selectedSeats.length > 0">
                <div class="selectedLabel">Selected seats:</div>
                <div class="selectedSeats">
                  <span v-for="seat in selectedSeats" :key="seat" class="seatChip">
                    {{ seat }}
                  </span>
                </div>
              </div>

              <div class="legend">
                <div class="legendItem">
                  <div class="legendBox available"></div>
                  <span>Available</span>
                </div>
                <div class="legendItem">
                  <div class="legendBox selected"></div>
                  <span>Selected</span>
                </div>
                <div class="legendItem">
                  <div class="legendBox taken"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            <div class="rightPanel">
              <BusSeatGrid v-if="seats.length" :seats="seats" :selected="selectedSeats" @select="selectSeat" />
              <div class="actionsSection">
                <button class="backBtn" @click="goBack">← Back</button>
                <button class="confirmBtn" @click="confirmPurchase" :disabled="selectedSeats.length === 0">
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </CashierLayout>
</template>

<script>
import CashierLayout from "../layouts/cashierLayout.vue";
import BusSeatGrid from "@/components/busSeatGrid.vue";
import { getTicketsByTrip } from "@/services/tripsApi";
import { getTripById } from "@/services/scheduleApi";
import { getBusById } from "@/services/fleetApi";

export default {
  components: { CashierLayout, BusSeatGrid },

  data() {
    return {
      seats: [],
      selectedSeats: [],
      ticketsCount: 1,
      maxSelectable: 0
    };
  },

  async mounted() {
    const { tripId } = this.$route.params;
    const token = localStorage.getItem("token");

    const trip = await getTripById(Number(tripId));
    const bus = await getBusById(trip.busId);
    const tickets = await getTicketsByTrip(Number(tripId), token);

    const taken = new Set(tickets.map(t => t.seatNumber));
    const capacity = bus.capacity;

    this.maxSelectable = capacity - taken.size;

    this.seats = Array.from({ length: capacity }, (_, i) => ({
      number: i + 1,
      available: !taken.has(i + 1)
    }));
  },

  methods: {
    selectSeat(seatNumber) {
      const index = this.selectedSeats.indexOf(seatNumber);

      if (index !== -1) {
        this.selectedSeats.splice(index, 1);
        return;
      }

      if (this.selectedSeats.length >= this.ticketsCount) {
        this.selectedSeats.pop();
      }

      this.selectedSeats.push(seatNumber);
    },

    increment() {
      if (this.ticketsCount >= this.maxSelectable) return;
      this.ticketsCount++;
      this.autoSelectNextSeat();
    },

    decrement() {
      if (this.ticketsCount <= 1) return;
      this.ticketsCount--;

      if (this.selectedSeats.length > this.ticketsCount) {
        this.selectedSeats.pop();
      }
    },

    autoSelectNextSeat() {
      const nextAvailable = this.seats.find(
        seat => seat.available && !this.selectedSeats.includes(seat.number)
      );

      if (nextAvailable && this.selectedSeats.length < this.ticketsCount) {
        this.selectedSeats.push(nextAvailable.number);
      }
    },

    goBack() {
      this.$router.push({
        name: "cashierTrips",
        query: {
          routeId: this.$route.query.routeId,
          date: this.$route.query.date
        }
      });
    },

    confirmPurchase() {
      const { tripId } = this.$route.params;

      this.$router.push({
        name: "cashierPurchase",
        params: { tripId },
        query: {
          seats: this.selectedSeats.join(','),
          date: this.$route.query.date,
          time: this.$route.query.time
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;

.hero {
  min-height: calc(100vh - 140px);
  padding: 40px 20px 16px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
  display: flex;
  align-items: center;
}

.heroInner {
  width: min(950px, 95vw);
  margin: 0 auto;
  color: $fourthColor;
}

.header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: clamp(24px, 5vw, 32px);
    margin-bottom: 6px;
    font-weight: 800;
  }

  p {
    opacity: 0.9;
    font-size: 14px;
  }
}

.searchCard {
  background: rgba($fourthColor, 0.98);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.mainContent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.leftPanel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customerSection {
  .sectionTitle {
    font-weight: 800;
    color: $primaryColor;
    margin-bottom: 12px;
    font-size: 14px;
  }
}

.customerInput {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 2px solid rgba($primaryColor, 0.2);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  background: white;

  &:focus {
    outline: none;
    border-color: $primaryColor;
  }

  &::placeholder {
    color: #999;
    font-weight: 500;
  }
}

.controlsSection {
  .sectionTitle {
    font-weight: 800;
    color: $primaryColor;
    margin-bottom: 12px;
    font-size: 14px;
  }
}

.counter {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}

.counterBtn {
  width: 48px;
  height: 48px;
  border: 2px solid rgba($primaryColor, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 24px;
  font-weight: 700;
  color: $primaryColor;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba($primaryColor, 0.08);
    border-color: $primaryColor;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.counterDisplay {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.counterNumber {
  font-size: 32px;
  font-weight: 900;
  color: $primaryColor;
}

.counterLabel {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.selectedInfo {
  background: rgba($primaryColor, 0.06);
  padding: 16px;
  border-radius: 12px;
}

.selectedLabel {
  font-weight: 700;
  color: $primaryColor;
  margin-bottom: 10px;
  font-size: 13px;
}

.selectedSeats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.seatChip {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 14px;
}

.legend {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  font-weight: 600;
}

.legendBox {
  width: 24px;
  height: 24px;
  border-radius: 6px;

  &.available {
    background: $thirdColor;
    border: 2px solid darken($thirdColor, 10%);
  }

  &.selected {
    background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  }

  &.taken {
    background: #9ca3af;
    border: 2px solid #6b7280;
  }
}

.rightPanel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actionsSection {
  display: flex;
  gap: 12px;
}

.backBtn {
  flex: 0 0 auto;
  height: 48px;
  padding: 0 20px;
  border: 2px solid rgba($primaryColor, 0.3);
  border-radius: 12px;
  background: white;
  color: $primaryColor;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primaryColor, 0.08);
    border-color: $primaryColor;
  }
}

.confirmBtn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($primaryColor, 0.35);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
