<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <div v-if="loading" class="loadingState">
          <div class="spinner"></div>
          <p>Loading trip information...</p>
        </div>

        <div v-else-if="success" class="successState">
          <div class="successIcon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1>Purchase Successful!</h1>
          <p>Your tickets have been confirmed</p>

          <div class="ticketInfo">
            <div class="ticketNumbers">
              <div class="label">Ticket Numbers</div>
              <div class="numbers">
                <span v-for="ticket in createdTickets" :key="ticket.id" class="ticketChip">
                  #{{ ticket.id }}
                </span>
              </div>
            </div>
          </div>

          <button class="backBtn" @click="goToTrips">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Trips
          </button>
        </div>

        <div v-else class="confirmCard">
          <div class="header">
            <h1>Confirm Your Purchase</h1>
            <p>Review your trip details before completing</p>
          </div>

          <div class="summarySection">
            <div class="summaryCard">
              <div class="cardHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <h2>Trip Information</h2>
              </div>

              <div class="infoGrid">
                <div class="infoItem">
                  <span class="infoLabel">Route</span>
                  <span class="infoValue">{{ route?.origin }} → {{ route?.destination }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Date</span>
                  <span class="infoValue">{{ formatDate(trip?.date) }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Time</span>
                  <span class="infoValue">{{ trip?.hour }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Bus</span>
                  <span class="infoValue">{{ bus?.plateNumber }}</span>
                </div>
              </div>
            </div>

            <div class="summaryCard">
              <div class="cardHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h2>Passenger Information</h2>
              </div>

              <div class="infoGrid">
                <div class="infoItem">
                  <span class="infoLabel">Name</span>
                  <span class="infoValue">{{ user?.name }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Email</span>
                  <span class="infoValue">{{ user?.email }}</span>
                </div>
              </div>
            </div>

            <div class="summaryCard highlight">
              <div class="cardHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <h2>Selected Seats</h2>
              </div>

              <div class="seatsDisplay">
                <div v-for="seat in selectedSeats" :key="seat" class="seatBadge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5z" />
                    <path d="M5 18v3" />
                    <path d="M19 18v3" />
                  </svg>
                  <span>Seat {{ seat }}</span>
                </div>
              </div>

              <div class="totalSection">
                <div class="totalRow">
                  <span>Price per ticket</span>
                  <span>${{ route?.price }}</span>
                </div>
                <div class="totalRow">
                  <span>Number of tickets</span>
                  <span>{{ selectedSeats.length }}</span>
                </div>
                <div class="totalRow total">
                  <span>Total Amount</span>
                  <span>${{ totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="cancelBtn" @click="goBack">Cancel</button>
            <button class="confirmBtn" @click="processPurchase" :disabled="processing">
              <span v-if="processing">Processing...</span>
              <span v-else>Confirm Purchase</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import { getTripById } from "@/services/scheduleApi";
import { getBusById } from "@/services/fleetApi";
import { getRouteById } from "@/services/routesApi";
import { createTicket } from "@/services/ticketsApi";
import { jwtDecode } from "jwt-decode";

export default {
  components: { ClientLayout },
  data() {
    return {
      loading: true,
      processing: false,
      success: false,
      trip: null,
      bus: null,
      route: null,
      user: null,
      selectedSeats: [],
      createdTickets: []
    };
  },
  computed: {
    totalAmount() {
      return this.route?.price * this.selectedSeats.length || 0;
    }
  },
  async mounted() {
    try {
      const { tripId } = this.$route.params;
      const { seats } = this.$route.query;
      const token = localStorage.getItem("token");

      if (!token) {
        this.$router.push({ name: "login" });
        return;
      }

      const decoded = jwtDecode(token);
      this.user = decoded;

      this.selectedSeats = seats ? seats.split(',').map(Number) : [];

      if (this.selectedSeats.length === 0) {
        this.$router.push({ name: "seatSelection", params: { tripId } });
        return;
      }

      this.trip = await getTripById(Number(tripId));
      this.bus = await getBusById(this.trip.busId);
      this.route = await getRouteById(this.trip.routeId);

      this.loading = false;
    } catch (error) {
      console.error("Error loading trip data:", error);
      this.$router.push({ name: "trips" });
    }
  },
  methods: {
    async processPurchase() {
      this.processing = true;
      const token = localStorage.getItem("token");
      const { tripId } = this.$route.params;

      try {
        const ticketPromises = this.selectedSeats.map(seatNumber =>
          createTicket({
            userId: this.user.id,
            tripId: Number(tripId),
            seatNumber,
            price: this.route.price
          }, token)
        );

        this.createdTickets = await Promise.all(ticketPromises);
        this.success = true;
      } catch (error) {
        console.error("Error creating tickets:", error);
        alert("Error processing purchase. Please try again.");
      } finally {
        this.processing = false;
      }
    },
    goBack() {
      const { tripId } = this.$route.params;
      this.$router.push({ name: "seatSelection", params: { tripId } });
    },
    goToTrips() {
      this.$router.push({ name: "trips" });
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
  width: min(800px, 95vw);
  margin: 0 auto;
}

.loadingState,
.successState {
  text-align: center;
  color: $fourthColor;
  padding: 60px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba($fourthColor, 0.2);
  border-top-color: $fourthColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.successState {
  background: rgba($fourthColor, 0.98);
  border-radius: 24px;
  padding: 48px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.successIcon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.successState h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: $primaryColor;
}

.successState p {
  color: #666;
  margin-bottom: 32px;
}

.ticketInfo {
  margin: 32px 0;
}

.ticketNumbers {
  background: linear-gradient(135deg, rgba($primaryColor, 0.08), rgba($secondaryColor, 0.08));
  padding: 24px;
  border-radius: 16px;
  border: 2px solid rgba($primaryColor, 0.2);
}

.label {
  font-weight: 700;
  color: $primaryColor;
  margin-bottom: 16px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.numbers {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

.ticketChip {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.backBtn {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba($primaryColor, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba($primaryColor, 0.4);
  }
}

.confirmCard {
  background: rgba($fourthColor, 0.98);
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: $primaryColor;
    font-size: clamp(24px, 4vw, 32px);
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 15px;
  }
}

.summarySection {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.summaryCard {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba($primaryColor, 0.1);

  &.highlight {
    background: linear-gradient(135deg, rgba($primaryColor, 0.05), rgba($secondaryColor, 0.05));
    border-color: rgba($primaryColor, 0.25);
  }
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba($primaryColor, 0.1);

  svg {
    color: $primaryColor;
  }

  h2 {
    color: $primaryColor;
    font-size: 18px;
    margin: 0;
  }
}

.infoGrid {
  display: grid;
  gap: 16px;
}

.infoItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.infoLabel {
  color: #666;
  font-weight: 600;
  font-size: 14px;
}

.infoValue {
  color: #222;
  font-weight: 800;
  font-size: 15px;
}

.seatsDisplay {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.seatBadge {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.totalSection {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid rgba($primaryColor, 0.15);
}

.totalRow {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 15px;
  color: #555;
  font-weight: 600;

  &:not(:last-child) {
    border-bottom: 1px solid rgba($primaryColor, 0.1);
  }

  &.total {
    font-size: 20px;
    font-weight: 900;
    color: $primaryColor;
    padding-top: 16px;
    margin-top: 8px;
  }
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cancelBtn,
.confirmBtn {
  flex: 1;
  max-width: 200px;
  border: none;
  border-radius: 16px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancelBtn {
  background: #e0e0e0;
  color: #555;

  &:hover {
    background: #d0d0d0;
    transform: translateY(-2px);
  }
}

.confirmBtn {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  box-shadow: 0 4px 16px rgba($primaryColor, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba($primaryColor, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>