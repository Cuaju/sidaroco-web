<template>
    <div class="driverTripCard" :class="{
        past: isPast,
        canceled: trip.status === 'canceled',
        completed: trip.status === 'completed'
    }" @click="$emit('select', trip)">
        <div class="tripTime">
            <span class="time">{{ formatTime(trip.departureTimeHHmm) }}</span>
            <span class="date">{{ formatDate(trip.serviceDate) }}</span>
        </div>

        <div class="tripInfo">
            <div class="tripRoute">
                <span class="label">Route</span>
                <span class="value">{{ trip.routeId }}</span>
            </div>
            <div class="tripBus">
                <span class="label">Bus</span>
                <span class="value">{{ trip.busId }}</span>
            </div>
        </div>

        <div class="tripStatus">
            <span class="statusBadge" :class="trip.status">
                {{ statusLabel }}
            </span>
        </div>

        <div class="tripAction">
            <button class="viewBtn" @click.stop="$emit('viewPassengers', trip)">
                View Passengers
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    trip: { type: Object, required: true },
    isPast: { type: Boolean, default: false },
});

defineEmits(["select", "viewPassengers"]);

const statusLabel = computed(() => {
    const map = {
        scheduled: "Scheduled",
        canceled: "Canceled",
        completed: "Completed",
    };
    return map[props.trip.status] || props.trip.status;
});

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
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.driverTripCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    background: white;
    border-radius: 14px;
    border-left: 5px solid $secondaryColor;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    &.past {
        border-left-color: #6c757d;
        opacity: 0.85;
    }

    &.canceled {
        border-left-color: #dc3545;
        opacity: 0.7;
    }

    &.completed {
        border-left-color: #28a745;
    }
}

.tripTime {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 100px;

    .time {
        font-size: 1.3rem;
        font-weight: 900;
        color: $primaryColor;
    }

    .date {
        font-size: 0.8rem;
        font-weight: 600;
        color: rgba($primaryColor, 0.6);
        text-transform: capitalize;
    }
}

.tripInfo {
    display: flex;
    gap: 28px;
    flex: 1;
}

.tripRoute,
.tripBus {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .label {
        font-size: 0.7rem;
        font-weight: 700;
        color: rgba($primaryColor, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .value {
        font-size: 1rem;
        font-weight: 700;
        color: $primaryColor;
    }
}

.tripStatus {
    min-width: 100px;
    text-align: center;
}

.statusBadge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;

    &.scheduled {
        background: rgba($secondaryColor, 0.15);
        color: $secondaryColor;
    }

    &.canceled {
        background: rgba(220, 53, 69, 0.15);
        color: #dc3545;
    }

    &.completed {
        background: rgba(40, 167, 69, 0.15);
        color: #28a745;
    }
}

.tripAction {
    flex-shrink: 0;
}

.viewBtn {
    padding: 10px 18px;
    border-radius: 10px;
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

@media (max-width: 700px) {
    .driverTripCard {
        flex-wrap: wrap;
        gap: 12px;
    }

    .tripInfo {
        width: 100%;
        order: 3;
    }

    .tripAction {
        width: 100%;
        order: 4;

        .viewBtn {
            width: 100%;
        }
    }
}
</style>
