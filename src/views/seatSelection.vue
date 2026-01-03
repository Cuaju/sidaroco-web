<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <div class="header">
          <h1>Select your seat</h1>
          <p>Choose your preferred seats for this trip</p>
        </div>

        <div class="searchCard">
          <div class="mainContent">
            <div class="leftPanel">
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
                <button class="confirmBtn" @click="confirmPurchase" :disabled="selectedSeats.length === 0">
                  Continue to Payment
                </button>
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
import BusSeatGrid from "@/components/busSeatGrid.vue";
import { getTicketsByTrip } from "@/services/tripsApi";
import { getTripById } from "@/services/scheduleApi";
import { getBusById } from "@/services/fleetApi";

export default {
  components: { ClientLayout, BusSeatGrid },
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
    confirmPurchase() {
      const { tripId } = this.$route.params;

      this.$router.push({
        name: "purchaseConfirmation",
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
  min-height: calc(100vh - 64px);
  padding: 40px 20px 16px;
  background: radial-gradient(circle at 30% 20%,
      $secondaryColor 0%,
      $primaryColor 55%,
      #001a18 100%);
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.mainContent {
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
}

.leftPanel {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    flex: 1;
    width: 100%;
  }
}

.rightPanel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 700;
  color: $primaryColor;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  text-align: center;
}

.controlsSection {
  background: linear-gradient(135deg, rgba($primaryColor, 0.05), rgba($secondaryColor, 0.05));
  border-radius: 16px;
  padding: 16px;
  border: 2px solid rgba($primaryColor, 0.15);
}

.counter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.counterBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background: #d0d0d0;
    cursor: not-allowed;
    opacity: 0.5;
  }

  span {
    line-height: 1;
  }
}

.counterDisplay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 70px;
}

.counterNumber {
  font-size: 28px;
  font-weight: 900;
  color: $primaryColor;
  line-height: 1;
}

.counterLabel {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selectedInfo {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba($primaryColor, 0.08), rgba($secondaryColor, 0.08));
  border-radius: 16px;
  border: 2px solid rgba($primaryColor, 0.2);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.selectedLabel {
  font-weight: 700;
  color: $primaryColor;
  margin-bottom: 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selectedSeats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.seatChip {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 2px solid rgba($primaryColor, 0.1);
}

.actionsSection {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.confirmBtn {
  width: 100%;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba($primaryColor, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba($primaryColor, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #d0d0d0;
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.legendBox {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &.available {
    background: linear-gradient(135deg, #ffd93d, #f4c430);
  }

  &.selected {
    background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  }

  &.taken {
    background: linear-gradient(135deg, #9aa7a3, #7a8581);
  }
}
</style>