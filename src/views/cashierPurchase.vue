<template>
  <CashierLayout>
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
          <h1>Seat Already Sold</h1>
          <p>One or more of the selected seats have already been sold</p>
          <button class="backBtn" @click="goBack">← Select Different Seats</button>
        </div>

        <div v-else-if="success" class="successState">
          <div class="successIcon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1>Sale Completed!</h1>
          <p>Tickets have been generated successfully</p>

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

          <div class="pdfActions">
            <button class="pdfBtn" @click="downloadAllPdfs">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download All Tickets (PDF)
            </button>
            <button class="pdfBtn secondary" v-for="ticket in createdTickets" :key="'dl-'+ticket.id" @click="downloadSinglePdf(ticket)">
              Download Ticket #{{ ticket.id }}
            </button>
          </div>

          <button class="newSaleBtn" @click="newSale">
            Start New Sale
          </button>
        </div>

        <div v-else class="confirmCard">
          <div class="mainGrid">
            <div class="leftSection">
              <div class="header">
                <h1>Confirm Sale</h1>
                <p>Review details before completing the transaction</p>
              </div>



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

              <div class="summaryCard highlight">
                <div class="cardHeader">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5z" />
                  </svg>
                  <h2>Selected Seats</h2>
                </div>
                <div class="seatsWithNames">
                  <div v-for="seat in selectedSeats" :key="seat" class="seatRow">
                    <div class="seatBadge">Seat {{ seat }}</div>
                    <input 
                      type="text" 
                      v-model="seatPassengers[seat]" 
                      :placeholder="'Passenger name for seat ' + seat"
                      class="passengerInput"
                    />
                  </div>
                </div>
              </div>

              <div class="totalSection">
                <div class="totalRow">
                  <span>Subtotal ({{ selectedSeats.length }} tickets)</span>
                  <span>${{ formatPrice(subtotal) }}</span>
                </div>
                <div class="totalRow">
                  <span>IVA (16%)</span>
                  <span>${{ formatPrice(iva) }}</span>
                </div>
                <div class="totalRow total">
                  <span>Total</span>
                  <span>${{ formatPrice(total) }}</span>
                </div>
              </div>
            </div>

            <div class="rightSection">
              <div class="paymentCard">
                <h2>Payment Method</h2>

                <div class="paymentOptions">
                  <button 
                    class="paymentOption" 
                    :class="{ active: paymentMethod === 'card' }"
                    @click="paymentMethod = 'card'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <span>Card Payment</span>
                  </button>

                  <button 
                    class="paymentOption" 
                    :class="{ active: paymentMethod === 'cash' }"
                    @click="paymentMethod = 'cash'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>Cash Payment</span>
                  </button>
                </div>

                <div class="actions">
                  <button class="cancelBtn" @click="goBack">Cancel</button>
                  <button 
                    class="confirmBtn" 
                    @click="processSale" 
                    :disabled="processing || !paymentMethod"
                  >
                    <span v-if="processing">Processing...</span>
                    <span v-else>Complete Sale</span>
                  </button>
                </div>
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
import { getTripById } from "@/services/scheduleApi";
import { getRouteById } from "@/services/routesApi";
import { createTicket } from "@/services/ticketsApi";
import { buildTicketPdf } from "@/utils/ticketPdfBuilder";
import logoBase64 from "@/assets/images/logoBase64";

export default {
  components: { CashierLayout },

  data() {
    return {
      loading: true,
      processing: false,
      success: false,
      error409: false,
      trip: null,
      route: null,
      selectedSeats: [],
      createdTickets: [],
      seatPassengers: {},
      paymentMethod: ""
    };
  },

  computed: {
    subtotal() {
      const price = this.route?.ticketPrice || 0;
      return price * this.selectedSeats.length;
    },
    iva() {
      return this.subtotal * 0.16;
    },
    total() {
      return this.subtotal + this.iva;
    }
  },

  async mounted() {
    try {
      const { tripId } = this.$route.params;
      const { seats } = this.$route.query;

      this.selectedSeats = seats ? seats.split(',').map(Number) : [];
      
      this.selectedSeats.forEach(seat => {
        this.seatPassengers[seat] = '';
      });

      if (this.selectedSeats.length === 0) {
        this.$router.push({ name: "cashierHome" });
        return;
      }

      this.trip = await getTripById(Number(tripId));
      this.route = await getRouteById(this.trip.routeId);

      this.loading = false;
    } catch (error) {
      console.error("Error loading trip data:", error);
      this.$router.push({ name: "cashierHome" });
    }
  },

  methods: {
    async processSale() {
      this.processing = true;
      const token = localStorage.getItem("token");
      const { tripId } = this.$route.params;

      try {
        const ticketPromises = this.selectedSeats.map(seatNumber =>
          createTicket({
            userId: "CASHIER_SALE",
            tripId: Number(tripId),
            seatNumber,
            price: this.route.ticketPrice || 0,
            saleDate: new Date().toISOString(),
            passengerName: this.seatPassengers[seatNumber] || 'Guest',
            paymentMethod: this.paymentMethod
          }, token)
        );

        this.createdTickets = await Promise.all(ticketPromises);
        this.success = true;
      } catch (error) {
        if (error?.message?.includes("409") || error?.status === 409) {
          this.error409 = true;
          return;
        }
        console.error("Error creating tickets:", error);
        alert("Error processing sale. Please try again.");
      } finally {
        this.processing = false;
      }
    },

    async downloadAllPdfs() {
      for (const ticket of this.createdTickets) {
        await this.downloadSinglePdf(ticket);
      }
    },

    async downloadSinglePdf(ticket) {
      try {
        await buildTicketPdf({
          ticketId: ticket.id,
          routeName: `${this.route?.origin?.name} → ${this.route?.destination?.name}`,
          travelDate: this.formatDate(this.trip?.departureTime),
          travelTime: this.formatTime(this.trip?.departureTime),
          purchaseDateTime: new Date().toLocaleString(),
          seat: ticket.seatNumber,
          price: (this.route?.ticketPrice || 0).toFixed(2),
          username: this.seatPassengers[ticket.seatNumber] || 'Guest',
          email: "Point of Sale",
          logoBase64
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating ticket PDF");
      }
    },

    goBack() {
      const { tripId } = this.$route.params;
      this.$router.push({ 
        name: "cashierSeatSelection", 
        params: { tripId },
        query: {
          date: this.$route.query.date,
          time: this.$route.query.time
        }
      });
    },

    newSale() {
      this.$router.push({ name: "cashierHome" });
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
  min-height: calc(100vh - 140px);
  padding: 40px 20px 16px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
  display: flex;
  align-items: center;
}

.heroInner {
  width: min(1100px, 95vw);
  margin: 0 auto;
}

.loadingState,
.successState,
.errorState {
  text-align: center;
  color: $fourthColor;
  padding: 60px 20px;
  background: rgba($fourthColor, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba($primaryColor, 0.2);
  border-top-color: $primaryColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.successIcon,
.errorIcon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease;
}

.successIcon {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
}

.errorIcon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.successState h1,
.errorState h1 {
  font-size: 32px;
  margin-bottom: 8px;
  color: $primaryColor;
}

.successState p,
.errorState p {
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

.pdfActions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
}

.pdfBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba($primaryColor, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba($primaryColor, 0.4);
  }

  &.secondary {
    background: white;
    color: $primaryColor;
    border: 2px solid rgba($primaryColor, 0.3);
    box-shadow: none;
    padding: 10px 20px;
    font-size: 13px;

    &:hover {
      background: rgba($primaryColor, 0.08);
      border-color: $primaryColor;
    }
  }
}

.newSaleBtn,
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
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mainGrid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.leftSection {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  margin-bottom: 8px;

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

.summaryCard {
  background: white;
  border-radius: 16px;
  padding: 20px;
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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba($primaryColor, 0.1);

  svg {
    color: $primaryColor;
  }

  h2 {
    color: $primaryColor;
    font-size: 16px;
    margin: 0;
  }
}

.customerName {
  font-size: 20px;
  font-weight: 800;
  color: #222;
}

.infoGrid {
  display: grid;
  gap: 12px;
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
  font-size: 13px;
}

.infoValue {
  color: #222;
  font-weight: 800;
  font-size: 14px;
  text-align: right;
}

.seatsWithNames {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seatRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seatBadge {
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  min-width: 70px;
  text-align: center;
}

.passengerInput {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  border: 2px solid rgba($primaryColor, 0.2);
  border-radius: 10px;
  font-size: 14px;
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

.totalSection {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba($primaryColor, 0.15);
}

.totalRow {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;

  &:not(:last-child) {
    border-bottom: 1px solid rgba($primaryColor, 0.1);
  }

  &.total {
    font-size: 20px;
    font-weight: 900;
    color: $primaryColor;
    padding-top: 14px;
    margin-top: 6px;
  }
}

.rightSection {
  position: sticky;
  top: 20px;
}

.paymentCard {
  background: linear-gradient(135deg, rgba($primaryColor, 0.06), rgba($secondaryColor, 0.04));
  border-radius: 20px;
  padding: 24px;
  border: 2px solid rgba($primaryColor, 0.15);

  h2 {
    color: $primaryColor;
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
  }
}

.paymentOptions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.paymentOption {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid rgba($primaryColor, 0.2);
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    color: $primaryColor;
  }

  span {
    font-weight: 800;
    font-size: 16px;
    color: $primaryColor;
  }

  &:hover {
    border-color: $primaryColor;
    background: rgba($primaryColor, 0.04);
  }

  &.active {
    border-color: $primaryColor;
    background: linear-gradient(135deg, rgba($primaryColor, 0.12), rgba($secondaryColor, 0.08));
    box-shadow: 0 4px 16px rgba($primaryColor, 0.2);
  }
}

.actions {
  display: flex;
  gap: 12px;
}

.cancelBtn,
.confirmBtn {
  flex: 1;
  border: none;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancelBtn {
  background: #e0e0e0;
  color: #555;

  &:hover {
    background: #d0d0d0;
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
