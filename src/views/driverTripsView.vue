<template>
    <section class="driverTripsPage">
        <h2>My Trips</h2>

        <!-- Tabs: Upcoming / Past -->
        <div class="tabsWrapper">
            <button class="tabBtn" :class="{ active: activeTab === 'upcoming' }" @click="switchTab('upcoming')">
                Upcoming
            </button>
            <button class="tabBtn" :class="{ active: activeTab === 'past' }" @click="switchTab('past')">
                Past
            </button>
        </div>

        <!-- Date Range Filters -->
        <div class="filtersWrapper">
            <div class="dateRangeGroup">
                <label>From</label>
                <input type="date" v-model="dateFrom" :max="activeTab === 'upcoming' ? undefined : todayStr"
                    :min="activeTab === 'upcoming' ? todayStr : undefined" />
            </div>
            <div class="dateRangeGroup">
                <label>To</label>
                <input type="date" v-model="dateTo" :max="activeTab === 'upcoming' ? undefined : todayStr"
                    :min="activeTab === 'upcoming' ? todayStr : undefined" />
            </div>
            <button class="applyBtn" @click="loadTrips" :disabled="loading">
                {{ loading ? "Loading..." : "Apply" }}
            </button>
            <div class="quickFilters">
                <button v-for="preset in activePresets" :key="preset.label" class="presetBtn"
                    @click="applyPreset(preset)">
                    {{ preset.label }}
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="stateBox">
            <p>Loading trips...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="stateBox error">
            <p>{{ error }}</p>
            <button class="retryBtn" @click="loadTrips">Retry</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTrips.length === 0" class="stateBox">
            <p>No {{ activeTab === 'upcoming' ? 'upcoming' : 'past' }} trips in this range</p>
        </div>

        <!-- Trips List -->
        <div v-else class="tripsList">
            <DriverTripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" :isPast="activeTab === 'past'"
                @viewPassengers="openPassengersModal" />
        </div>

        <!-- Passengers Modal -->
        <DriverPassengersModal v-if="selectedTrip" :trip="selectedTrip" @close="selectedTrip = null" />
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useToast } from "vue-toastification";
import DriverTripCard from "@/components/driverTripCard.vue";
import DriverPassengersModal from "@/components/driverPassengersModal.vue";
import { getDriverTrips } from "@/services/driverApi";

const toast = useToast();

// === State ===
const activeTab = ref("upcoming");
const loading = ref(false);
const error = ref(null);
const trips = ref([]);
const selectedTrip = ref(null);

// Date filters
const dateFrom = ref("");
const dateTo = ref("");

// === Computed: "Today" in Mexico City timezone ===
const todayStr = computed(() => {
    const now = new Date();
    const mxDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    return formatDateYYYYMMDD(mxDate);
});

const nowKey = computed(() => {
    const now = new Date();
    const mxDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    const hh = String(mxDate.getHours()).padStart(2, "0");
    const mm = String(mxDate.getMinutes()).padStart(2, "0");
    return `${todayStr.value}T${hh}:${mm}`;
});

// === Presets for quick date selection ===
const upcomingPresets = [
    { label: "Today", days: 0 },
    { label: "Tomorrow", days: 1 },
    { label: "This week", days: 7 },
    { label: "Next 30 days", days: 30 },
];

const pastPresets = [
    { label: "Today", days: 0 },
    { label: "Last 7 days", days: -7 },
    { label: "Last 30 days", days: -30 },
    { label: "Last 90 days", days: -90 },
];

const activePresets = computed(() =>
    activeTab.value === "upcoming" ? upcomingPresets : pastPresets
);

// === Filter trips based on upcoming/past using departureKey ===
const filteredTrips = computed(() => {
    const now = nowKey.value;

    return trips.value
        .filter((trip) => {
            if (activeTab.value === "upcoming") {
                return trip.departureKey >= now;
            } else {
                return trip.departureKey < now;
            }
        })
        .sort((a, b) => {
            // Upcoming: soonest first, Past: most recent first
            if (activeTab.value === "upcoming") {
                return a.departureKey.localeCompare(b.departureKey);
            } else {
                return b.departureKey.localeCompare(a.departureKey);
            }
        });
});

// === Helpers ===
function formatDateYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return formatDateYYYYMMDD(d);
}

// === Tab switching ===
function switchTab(tab) {
    if (activeTab.value === tab) return;
    activeTab.value = tab;
    setDefaultDateRange();
    loadTrips();
}

// === Set default date range based on tab ===
function setDefaultDateRange() {
    if (activeTab.value === "upcoming") {
        // Default: today only
        dateFrom.value = todayStr.value;
        dateTo.value = todayStr.value;
    } else {
        // Default: last 7 days
        dateTo.value = todayStr.value;
        dateFrom.value = addDays(todayStr.value, -7);
    }
}

// === Apply preset ===
function applyPreset(preset) {
    if (activeTab.value === "upcoming") {
        dateFrom.value = todayStr.value;
        dateTo.value = addDays(todayStr.value, preset.days);
    } else {
        dateTo.value = todayStr.value;
        dateFrom.value = addDays(todayStr.value, preset.days);
    }
    loadTrips();
}

// === Load trips from API ===
async function loadTrips() {
    if (!dateFrom.value || !dateTo.value) {
        toast.warning("Select a date range");
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        // For past tab, we might need to swap dates if user selected them wrong
        let from = dateFrom.value;
        let to = dateTo.value;
        if (from > to) {
            [from, to] = [to, from];
        }

        trips.value = await getDriverTrips(from, to);
    } catch (err) {
        console.error("Error loading trips:", err);
        error.value = err.message || "Error loading trips";
        toast.error(error.value);
    } finally {
        loading.value = false;
    }
}

// === Open passengers modal ===
function openPassengersModal(trip) {
    selectedTrip.value = trip;
}

// === Initialize ===
onMounted(() => {
    setDefaultDateRange();
    loadTrips();
});
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.driverTripsPage {
    width: 96vw;
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
}

h2 {
    color: $primaryColor;
    font-weight: 900;
    font-size: 1.8rem;
    margin-bottom: 24px;
}

// === Tabs ===
.tabsWrapper {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
}

.tabBtn {
    flex: 1;
    max-width: 200px;
    padding: 14px 24px;
    border-radius: 12px;
    border: 2px solid transparent;
    background: rgba($primaryColor, 0.08);
    color: $primaryColor;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba($primaryColor, 0.12);
    }

    &.active {
        background: $secondaryColor;
        color: white;
        border-color: $secondaryColor;
    }
}

// === Filters ===
.filtersWrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
    padding: 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
}

.dateRangeGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
        font-size: 0.8rem;
        font-weight: 700;
        color: rgba($primaryColor, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    input[type="date"] {
        height: 44px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid rgba($primaryColor, 0.2);
        background: $fourthColor;
        font-size: 0.95rem;
        font-weight: 600;
        color: $primaryColor;
        outline: none;
        font-family: inherit;

        &:focus {
            border-color: $secondaryColor;
            box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
        }
    }
}

.applyBtn {
    height: 44px;
    padding: 0 24px;
    border-radius: 10px;
    border: none;
    background: $secondaryColor;
    color: white;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
        filter: brightness(1.1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.quickFilters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba($primaryColor, 0.08);
}

.presetBtn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: rgba($thirdColor, 0.2);
    color: $primaryColor;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: $thirdColor;
    }
}

// === States ===
.stateBox {
    padding: 60px 40px;
    background: white;
    border-radius: 16px;
    text-align: center;
    color: rgba($primaryColor, 0.5);
    font-weight: 600;
    font-size: 1.1rem;

    &.error {
        color: #dc3545;
    }
}

.retryBtn {
    margin-top: 16px;
    padding: 12px 24px;
    border-radius: 10px;
    border: none;
    background: $secondaryColor;
    color: white;
    font-weight: 700;
    cursor: pointer;
}

// === Trips List ===
.tripsList {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

@media (max-width: 600px) {
    .filtersWrapper {
        flex-direction: column;
        align-items: stretch;
    }

    .dateRangeGroup {
        width: 100%;

        input[type="date"] {
            width: 100%;
        }
    }

    .applyBtn {
        width: 100%;
    }

    .tabBtn {
        max-width: none;
    }
}
</style>
