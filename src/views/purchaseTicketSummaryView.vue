<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <div v-if="loading" class="loadingState">
          <div class="spinner"></div>
          <p>Loading trip information...</p>
        </div>

        <div v-else-if="error409" class="errorState">
          <div class="errorIcon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1>Ticket Already Purchased</h1>
          <p>You have already purchased a ticket for one or more of the selected seats</p>

          <button class="backBtn" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Select Different Seats
          </button>
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
              <div class="label">Selected seat numbers</div>
              <div class="numbers">
                <span v-for="ticket in createdTickets" :key="ticket.seatNumber" class="ticketChip">
                  #{{ ticket.seatNumber }}
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
                  <span class="infoValue">{{ route?.origin?.name }} → {{ route?.destination?.name }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Date</span>
                  <span class="infoValue">{{ formatDate(trip?.departureTime) }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Time</span>
                  <span class="infoValue">{{ formatTime(trip?.departureTime) }}</span>
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
                  <span class="infoValue">{{ user?.username }}</span>
                </div>
                <div class="infoItem">
                  <span class="infoLabel">Email</span>
                  <span class="infoValue">{{ user?.email }}</span>
                </div>
              </div>
            </div>
            <div class="summaryCard amenitiesCard">
              <div class="cardHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path
                    d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                <h2>Bus Amenities</h2>
              </div>
              <div class="amenitiesList">
                <div class="amenityItem">
                  <span class="amenityIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 9.5c4.7-4 9.3-4 14 0" />
                      <path d="M8.5 12.5c2.8-2.5 4.2-2.5 7 0" />
                      <path d="M12 16h.01" />
                    </svg>
                  </span>
                  <span>WiFi</span>
                </div>

                <div class="amenityItem">
                  <span class="amenityIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path
                        d="M19.335 15.268l2.485 1.405-.492.871-2.467-1.395-.267 2.492-.994-.108.313-2.92L13 12.836v6.04l2.602 1.033-.369.93L13 19.952V22h-1v-2.048l-2.233.887-.369-.93L12 18.876v-6.04l-4.913 2.777.313 2.92-.994.108-.267-2.492-2.467 1.395-.492-.871 2.485-1.405-1.962-1.581.628-.78 2.271 1.832 4.882-2.76-4.881-2.758-2.272 1.832-.628-.78 1.963-1.582L3.18 7.286l.492-.871L6.139 7.81l.267-2.491.994.108-.312 2.919L12 11.123V5.124L9.398 4.091l.369-.93L12 4.048V2h1v2.048l2.233-.887.369.93L13 5.124v5.999l5.195-2.937-.296-2.759.995-.108.249 2.331 2.185-1.235.492.871-2.185 1.235 1.869 1.417-.605.796-2.212-1.677-5.171 2.922 4.882 2.76 2.271-1.832.628.78-1.962 1.581z" />
                    </svg>
                  </span>
                  <span>Air Conditioning</span>
                </div>

                <div class="amenityItem">
                  <span class="amenityIcon" aria-hidden="true">
                    <svg viewBox="0 0 17 17" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path
                        d="M13.074 3.098v1.84h.968V6.46l-4.135 1.52V2.93L12 2.921 9.542 0 7.031 2.959h2.058v7.566L4.959 9.426V7.92A1.5 1.5 0 1 0 4.035 7.918V10l5.054 1.585v1.479A1.5 1.5 0 1 0 9.907 13.062V9.01l5.04-1.949V4.937h.97V3.097h-2.843z" />
                    </svg>
                  </span>
                  <span>USB Charging</span>
                </div>

                <div class="amenityItem">
                  <span class="amenityIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path
                        d="M22.5 20V22C22.5 22.5523 22.0523 23 21.5 23H7.59646C6.66266 23 5.85314 22.3538 5.64619 21.4432L1.27764 2.22162C1.13542 1.59586 1.61105 1 2.25277 1H5.70799C6.17204 1 6.57512 1.31925 6.6814 1.77096L10.5 18H20.5C21.6046 18 22.5 18.8954 22.5 20Z" />
                      <path d="M6.96729 3H9C9.55228 3 10 3.44772 10 4V6L8 7.5" />
                      <path d="M13.5 14.375H9.625H7.5" />
                    </svg>
                  </span>
                  <span>Reclining Seats</span>
                </div>

                <div class="amenityItem">
                  <span class="amenityIcon" aria-hidden="true">
                    <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" aria-hidden="true">
                      <path
                        d="M130.6 96.4c26.6 0 48.2-21.6 48.2-48.2S157.2 0 130.6 0 82.4 21.6 82.4 48.2s21.6 48.2 48.2 48.2z" />
                      <path
                        d="M172.4 119.3H87.9c-23.4 0-48.8 25.4-48.8 48.8v162.1c0 11.7 9.5 21.1 21.1 21.1h14.8l8 138.2c0 12.4 10.1 22.5 22.5 22.5h49.2c12.4 0 22.5-10.1 22.5-22.5l8-138.2h14.8c11.7 0 21.1-9.5 21.1-21.1V168.1c0-23.4-25.4-48.8-48.8-48.8z" />
                      <path
                        d="M356.7 96.4c26.6 0 48.2-21.6 48.2-48.2S383.3 0 356.7 0s-48.2 21.6-48.2 48.2 21.6 48.2 48.2 48.2z" />
                      <path
                        d="M471.6 376.9l-50-117.5 16.6-83.9c1.7-31.8-22.2-55.7-45.6-55.7h-71.9c-23.4 0-47.3 23.9-45.6 55.7l16.6 83.9-50 117.5c-2.2 5.3-1.7 11.3 1.5 16.1s8.5 7.7 14.2 7.7h52.7l13.6 92.5c0 9.1 7.4 16.4 16.4 16.4h32.9c9.1 0 16.4-7.4 16.4-16.4l13.6-92.5h52.7c5.7 0 11.1-2.9 14.2-7.7 3.2-4.8 3.7-10.8 1.5-16.1z" />
                    </svg>
                  </span>
                  <span>Restroom</span>
                </div>
              </div>

            </div>

            <div class="summaryCard highlight">
              <div class="cardHeader">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                  <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5z" />
                  <path d="M5 18v3" />
                  <path d="M19 18v3" />
                </svg>
                <h2>Selected Seats</h2>
              </div>

              <div class="seatsDisplay">
                <div v-for="seat in selectedSeats" :key="seat" class="seatBadge">
                  <span>Seat {{ seat }}</span>
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
import { getRouteById } from "@/services/routesApi";
import { createTicket } from "@/services/ticketsApi";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default {
  components: { ClientLayout },
  data() {
    return {
      loading: true,
      processing: false,
      success: false,
      error409: false,
      trip: null,
      route: null,
      user: null,
      selectedSeats: [],
      createdTickets: []
    };
  },
  computed: {
    totalAmount() {
      const price = this.route?.ticketPrice || 0;
      return (price * this.selectedSeats.length).toFixed(2);
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

      const decoded = parseJwt(token);
      console.log("Decoded JWT:", decoded);
      this.user = decoded;

      this.selectedSeats = seats ? seats.split(',').map(Number) : [];

      if (this.selectedSeats.length === 0) {
        this.$router.push({ name: "seatSelection", params: { tripId } });
        return;
      }

      this.trip = await getTripById(Number(tripId));

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
      console.log(this.user);
      try {
        const ticketPromises = this.selectedSeats.map(seatNumber =>
          createTicket({
            userId: this.user.user_id,
            tripId: Number(tripId),
            seatNumber,
            price: this.route.ticketPrice || 0,
            saleDate: new Date().toISOString()
          }, token)
        );

        this.createdTickets = await Promise.all(ticketPromises);
        this.success = true;
      } catch (error) {
        if (error?.message && error.message.includes("409")) {
          this.error409 = true;
          return;
        }
        if (error?.status === 409) {
          this.error409 = true;
          return;
        }
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
      this.$router.push("/myTrips");
    },
    formatDate() {
      const date = this.$route.query.date;
      if (!date) return "";
      return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },
    formatTime() {
      const time = this.$route.query.time;
      if (!time) return "";
      return new Date(time).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    },
    formatPrice(price) {
      if (price === null || price === undefined) return "0.00";
      return Number(price).toFixed(2);
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
  gap: 16px;
}

.infoLabel {
  color: #666;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  min-width: 80px;
}

.infoValue {
  color: #222;
  font-weight: 800;
  font-size: 15px;
  text-align: right;
  word-break: break-word;
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

.amenitiesCard {
  background: linear-gradient(135deg, rgba($secondaryColor, 0.08), rgba($primaryColor, 0.04));
  border-color: rgba($secondaryColor, 0.25);
}

.amenitiesList {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.amenityItem {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: $primaryColor;
  border: 1px solid rgba($primaryColor, 0.15);
}

.amenityIcon {
  display: inline-flex;
  width: 20px;
  height: 20px;
  color: #52525b;
}

</style>