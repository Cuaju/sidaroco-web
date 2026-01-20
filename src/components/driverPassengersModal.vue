<template>
    <div class="modalOverlay" @click.self="$emit('close')">
        <div class="passengersModal">
            <header class="modalHeader">
                <div class="headerInfo">
                    <h3>Passenger List</h3>
                    <p class="tripMeta" v-if="trip">
                        {{ formatDate(trip.serviceDate) }} • {{ formatTime(trip.departureTimeHHmm) }} • Route {{
                        trip.routeId }}
                    </p>
                </div>
                <button class="closeBtn" @click="$emit('close')">✕</button>
            </header>

            <div class="modalBody">
                <div v-if="loading" class="loadingState">
                    <p>Loading passengers...</p>
                </div>

                <div v-else-if="error" class="errorState">
                    <p>{{ error }}</p>
                    <button class="retryBtn" @click="loadPassengers">Retry</button>
                </div>

                <template v-else>
                    <div class="summaryBar">
                        <span class="passengerCount">
                            <strong>{{ passengerCount }}</strong> passenger{{ passengerCount !== 1 ? 's' : '' }}
                        </span>
                        <input type="text" v-model="searchQuery" placeholder="Search by name or seat..."
                            class="searchInput" />
                    </div>

                    <div v-if="filteredPassengers.length === 0" class="emptyState">
                        <p v-if="searchQuery">No passengers found matching "{{ searchQuery }}"</p>
                        <p v-else>No passengers registered for this trip</p>
                    </div>

                    <div v-else class="passengersList">
                        <div v-for="passenger in filteredPassengers" :key="passenger.ticketId" class="passengerRow"
                            :class="{ canceled: passenger.status === 'CANCELLED' }">
                            <div class="seatNumber">
                                <span class="seatLabel">Seat</span>
                                <span class="seatValue">{{ passenger.seatNumber }}</span>
                            </div>
                            <div class="passengerInfo">
                                <span class="passengerName">{{ passenger.passengerName }}</span>
                                <span class="ticketId">Ticket #: {{ passenger.ticketId }}</span>
                            </div>
                            <div class="passengerMeta">
                                <span class="statusBadge" :class="passenger.status?.toLowerCase()">
                                    {{ statusLabel(passenger.status) }}
                                </span>
                                <span class="paymentMethod" v-if="passenger.paymentMethod">
                                    {{ paymentLabel(passenger.paymentMethod) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <footer class="modalFooter" v-if="!loading && !error && passengers.length > 0">
                <button class="printBtn" @click="handlePrint">
                    🖨️ Print List
                </button>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getDriverTripPassengers } from "@/services/driverApi";

const props = defineProps({
    trip: { type: Object, required: true },
});

const emit = defineEmits(["close"]);

const loading = ref(true);
const error = ref(null);
const passengers = ref([]);
const passengerCount = ref(0);
const searchQuery = ref("");

const filteredPassengers = computed(() => {
    if (!searchQuery.value.trim()) {
        return passengers.value;
    }
    const q = searchQuery.value.toLowerCase();
    return passengers.value.filter(
        (p) =>
            p.passengerName?.toLowerCase().includes(q) ||
            String(p.seatNumber).includes(q) ||
            String(p.ticketId).includes(q)
    );
});

function statusLabel(status) {
    const map = {
        ACTIVE: "Active",
        CANCELLED: "Canceled",
        USED: "Used",
    };
    return map[status] || status;
}

function paymentLabel(method) {
    const map = {
        CASH: "Cash",
        CARD: "Card",
        TRANSFER: "Transfer",
    };
    return map[method] || method;
}

function formatTime(timeHHmm) {
    if (!timeHHmm) return "--:--";
    const [hours, minutes] = timeHHmm.split(":").map(Number);
    const period = hours >= 12 ? "p.m." : "a.m.";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

async function loadPassengers() {
    loading.value = true;
    error.value = null;

    try {
        const data = await getDriverTripPassengers(props.trip.id);
        passengers.value = data.passengers || [];
        passengerCount.value = data.passengerCount || passengers.value.length;
    } catch (err) {
        console.error("Error loading passengers:", err);
        error.value = err.message || "Error loading passengers";
    } finally {
        loading.value = false;
    }
}

function handlePrint() {
    // Simple print - opens browser print dialog with current content
    const printContent = passengers.value
        .map((p) => `Seat ${p.seatNumber}: ${p.passengerName} (Ticket #: ${p.ticketId})`)
        .join("\n");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
        printWindow.document.write(`
      <html>
        <head>
          <title>Passenger List - Route ${props.trip.routeId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            h2 { font-size: 14px; color: #666; margin-bottom: 20px; }
            .passenger { padding: 8px 0; border-bottom: 1px solid #eee; }
            .seat { font-weight: bold; display: inline-block; width: 80px; }
          </style>
        </head>
        <body>
          <h1>Passenger List - Route ${props.trip.routeId}</h1>
          <h2>${formatDate(props.trip.serviceDate)} • ${formatTime(props.trip.departureTimeHHmm)}</h2>
          <p><strong>Total: ${passengerCount.value} passengers</strong></p>
          <hr/>
          ${passengers.value
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map(
                    (p) =>
                        `<div class="passenger"><span class="seat">Seat ${p.seatNumber}</span> ${p.passengerName} <small>(${p.ticketId})</small></div>`
                )
                .join("")}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    }
}

onMounted(loadPassengers);
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.passengersModal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modalHeader {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba($primaryColor, 0.1);

    h3 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 900;
        color: $primaryColor;
    }

    .tripMeta {
        margin: 6px 0 0;
        font-size: 0.9rem;
        color: rgba($primaryColor, 0.6);
        font-weight: 600;
        text-transform: capitalize;
    }
}

.closeBtn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: rgba($primaryColor, 0.08);
    color: $primaryColor;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: rgba($primaryColor, 0.15);
    }
}

.modalBody {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
}

.loadingState,
.errorState,
.emptyState {
    padding: 40px;
    text-align: center;
    color: rgba($primaryColor, 0.5);
    font-weight: 600;
}

.retryBtn {
    margin-top: 12px;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    background: $secondaryColor;
    color: white;
    font-weight: 700;
    cursor: pointer;
}

.summaryBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .passengerCount {
        font-size: 1rem;
        color: $primaryColor;
        font-weight: 600;

        strong {
            font-size: 1.3rem;
            color: $secondaryColor;
        }
    }
}

.searchInput {
    flex: 1;
    min-width: 180px;
    max-width: 280px;
    height: 42px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba($primaryColor, 0.15);
    background: $fourthColor;
    font-size: 0.9rem;
    font-weight: 600;
    color: $primaryColor;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
        border-color: $secondaryColor;
        box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
    }

    &::placeholder {
        color: rgba($primaryColor, 0.4);
    }
}

.passengersList {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.passengerRow {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    background: $fourthColor;
    border-radius: 12px;
    transition: all 0.15s ease;

    &:hover {
        background: rgba($thirdColor, 0.15);
    }

    &.canceled {
        opacity: 0.6;
        text-decoration: line-through;
    }
}

.seatNumber {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;

    .seatLabel {
        font-size: 0.65rem;
        font-weight: 700;
        color: rgba($primaryColor, 0.5);
        text-transform: uppercase;
    }

    .seatValue {
        font-size: 1.4rem;
        font-weight: 900;
        color: $secondaryColor;
    }
}

.passengerInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .passengerName {
        font-weight: 700;
        color: $primaryColor;
    }

    .ticketId {
        font-size: 0.8rem;
        color: rgba($primaryColor, 0.5);
    }
}

.passengerMeta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.statusBadge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;

    &.active {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
    }

    &.cancelled {
        background: rgba(220, 53, 69, 0.15);
        color: #dc3545;
    }

    &.used {
        background: rgba(108, 117, 125, 0.15);
        color: #6c757d;
    }
}

.paymentMethod {
    font-size: 0.75rem;
    color: rgba($primaryColor, 0.5);
    font-weight: 600;
}

.modalFooter {
    padding: 16px 24px;
    border-top: 1px solid rgba($primaryColor, 0.1);
    display: flex;
    justify-content: flex-end;
}

.printBtn {
    padding: 12px 24px;
    border-radius: 12px;
    border: none;
    background: $primaryColor;
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        filter: brightness(1.2);
    }
}

@media (max-width: 500px) {
    .passengerRow {
        flex-wrap: wrap;
    }

    .passengerMeta {
        width: 100%;
        flex-direction: row;
        justify-content: flex-start;
        margin-top: 8px;
    }
}
</style>
