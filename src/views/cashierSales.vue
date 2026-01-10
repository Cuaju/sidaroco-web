<template>
    <CashierLayout>
        <section class="salesPage">
            <h1>My Sales</h1>

            <div v-if="loading" class="state">
                Loading sales…
            </div>

            <div v-else-if="error" class="state error">
                <p>{{ error }}</p>
                <RouterLink to="/cashier" class="cta">
                    Back to Home
                </RouterLink>
            </div>

            <div v-else-if="tickets.length === 0" class="state empty">
                <p>No sales recorded yet.</p>
                <RouterLink to="/cashier" class="cta">
                    Start Selling
                </RouterLink>
            </div>

            <div v-else class="tripGroups">
                <div v-for="group in groupedTickets" :key="group.tripId" class="tripGroup">
                    <div class="tripHeader">
                        <div class="tripInfo">
                            <span class="routeName">{{ group.routeName }}</span>
                            <span class="tripDate">{{ formatDate(group.departureTime) }} at {{
                                formatTime(group.departureTime) }}</span>
                        </div>
                        <div class="tripMeta">
                            <span class="ticketCount">{{ group.tickets.length }} ticket{{ group.tickets.length > 1 ? 's'
                                : '' }}</span>
                            <span class="totalAmount">${{ formatPrice(group.totalPrice) }}</span>
                            <span class="statusBadge" :class="getTripStatus(group.departureTime).class">
                                {{ getTripStatus(group.departureTime).label }}
                            </span>
                        </div>
                    </div>
                    <div class="ticketsList">
                        <div v-for="ticket in group.tickets" :key="ticket.id" class="ticketRow">
                            <span class="ticketId">#{{ ticket.id }}</span>
                            <span class="seatBadge">Seat {{ ticket.seatNumber }}</span>
                            <span class="passengerName">{{ ticket.passengerName || 'Guest' }}</span>
                            <span class="paymentMethod">{{ ticket.paymentMethod || 'N/A' }}</span>
                            <span class="price">${{ formatPrice(ticket.price) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </CashierLayout>
</template>

<script>
import CashierLayout from "../layouts/cashierLayout.vue";
import { getCashierSales } from "@/services/ticketsApi";
import { getTripsByIds } from "@/services/tripsApi";
import { getScheduleById } from "@/services/scheduleApi";
import { getRouteById } from "@/services/routesApi";

export default {
    components: { CashierLayout },

    data() {
        return {
            tickets: [],
            loading: false,
            error: ""
        };
    },

    computed: {
        groupedTickets() {
            const groups = {};

            for (const ticket of this.tickets) {
                const tripId = ticket.tripId;
                if (!groups[tripId]) {
                    groups[tripId] = {
                        tripId,
                        routeName:
                            ticket.route?.origin?.name && ticket.route?.destination?.name
                                ? `${ticket.route.origin.name} → ${ticket.route.destination.name}`
                                : ticket.route?.name || 'Route not available',
                        departureTime: ticket.trip?.departureTime ? new Date(ticket.trip.departureTime) : null,
                        tickets: [],
                        totalPrice: 0
                    };
                }
                groups[tripId].tickets.push(ticket);
                groups[tripId].totalPrice += ticket.price || 0;
            }

            return Object.values(groups).sort((a, b) => {
                if (!a.departureTime) return 1;
                if (!b.departureTime) return -1;
                return b.departureTime - a.departureTime;
            });
        }
    },

    mounted() {
        this.loadSales();
    },

    methods: {
        formatDate(date) {
            if (!date) return 'N/A';
            const d = date instanceof Date ? date : new Date(date);

            const year = d.getUTCFullYear();
            const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
            const day = d.getUTCDate();

            return `${month} ${day}, ${year}`;
        },

        formatTime(date) {
            if (!date) return 'N/A';
            const d = date instanceof Date ? date : new Date(date);

            const hours = d.getUTCHours();
            const minutes = d.getUTCMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;

            return `${hour12}:${minutes} ${ampm}`;
        },

        formatPrice(price) {
            if (price === null || price === undefined) return "0.00";
            return Number(price).toFixed(2);
        },

        getTripStatus(departureTime) {
            if (!departureTime) {
                return { label: 'Unknown', class: 'unknown' };
            }
            const now = new Date();
            if (departureTime < now) {
                return { label: 'Completed', class: 'completed' };
            }
            return { label: 'Upcoming', class: 'upcoming' };
        },

        async loadSales() {
            this.loading = true;
            this.error = "";

            try {
                const token = localStorage.getItem("token");

                const tickets = await getCashierSales(token);
                console.log('🎫 Cashier tickets received:', tickets);

                const tripIds = [...new Set(tickets.map(t => t.tripId))];
                console.log('🚌 Trip IDs:', tripIds);

                const trips = await getTripsByIds(tripIds, token);
                console.log('🚌 Trips received:', trips);

                const scheduleIds = [...new Set(trips.map(t => t.dailyScheduleId).filter(Boolean))];

                const schedules = await Promise.all(
                    scheduleIds.map(async (id) => {
                        try {
                            return await getScheduleById(id);
                        } catch {
                            return null;
                        }
                    })
                );

                const schedulesById = Object.fromEntries(
                    schedules.filter(Boolean).map(s => [s.id, s])
                );

                const tripsById = Object.fromEntries(
                    trips.map(t => {
                        const schedule = schedulesById[t.dailyScheduleId];
                        if (schedule?.serviceDate && t.departureTime) {
                            const timeOnly = new Date(t.departureTime);
                            const serviceDate = new Date(schedule.serviceDate);

                            const combinedDateTime = new Date(serviceDate);
                            combinedDateTime.setUTCHours(
                                timeOnly.getUTCHours(),
                                timeOnly.getUTCMinutes(),
                                timeOnly.getUTCSeconds(),
                                0
                            );

                            return [t.id, { ...t, departureTime: combinedDateTime.toISOString() }];
                        }
                        return [t.id, t];
                    })
                );

                const routeIds = [...new Set(trips.map(t => t.routeId))];

                const routes = await Promise.all(
                    routeIds.map(routeId => getRouteById(routeId))
                );

                const routesById = Object.fromEntries(
                    routes.map(r => [r.id, r])
                );

                this.tickets = tickets.map(t => {
                    const trip = tripsById[t.tripId];
                    const route = trip ? routesById[trip.routeId] : null;

                    return {
                        ...t,
                        trip,
                        route,
                        price: t.price || route?.ticketPrice || 0
                    };
                });

                console.log('✅ Final sales array:', this.tickets);

            } catch (e) {
                console.error('❌ Error loading sales:', e);
                this.error = "Unable to load sales.";
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.salesPage {
    width: min(980px, 96vw);
    margin: 0 auto;
    padding: 24px 16px;
}

h1 {
    color: $primaryColor;
    font-weight: 900;
    margin-bottom: 20px;
}

.tripGroups {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.tripGroup {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tripHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba($primaryColor, 0.05);
    border-bottom: 1px solid rgba($primaryColor, 0.1);
    gap: 12px;
    flex-wrap: wrap;
}

.tripInfo {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.routeName {
    font-weight: 800;
    font-size: 1.1rem;
    color: $primaryColor;
}

.tripDate {
    font-size: 0.9rem;
    color: rgba($primaryColor, 0.7);
}

.tripMeta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.ticketCount {
    font-size: 0.85rem;
    color: rgba($primaryColor, 0.6);
    font-weight: 600;
}

.totalAmount {
    font-size: 1rem;
    color: $secondaryColor;
    font-weight: 800;
}

.statusBadge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;

    &.upcoming {
        background: #e3f2fd;
        color: #1976d2;
    }

    &.completed {
        background: #e8f5e9;
        color: #388e3c;
    }

    &.unknown {
        background: #f5f5f5;
        color: #757575;
    }
}

.ticketsList {
    display: flex;
    flex-direction: column;
}

.ticketRow {
    display: grid;
    grid-template-columns: 80px 90px 1fr 100px 100px;
    align-items: center;
    padding: 14px 20px;
    gap: 12px;
    border-bottom: 1px solid rgba($primaryColor, 0.08);

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 8px;
    }
}

.ticketId {
    font-size: 13px;
    font-weight: 700;
    color: rgba($primaryColor, 0.6);
}

.seatBadge {
    background: linear-gradient(135deg, $primaryColor, $secondaryColor);
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 800;
    font-size: 12px;
    text-align: center;
}

.passengerName {
    font-weight: 700;
    color: $primaryColor;
    font-size: 14px;
}

.paymentMethod {
    font-size: 13px;
    color: rgba($primaryColor, 0.6);
    font-weight: 600;
    text-transform: capitalize;
}

.price {
    font-weight: 800;
    color: $secondaryColor;
    font-size: 15px;
    text-align: right;
}

.state {
    padding: 40px;
    text-align: center;
    font-weight: 700;
    color: rgba($primaryColor, 0.6);
    background: white;
    border-radius: 16px;
}

.state.empty p {
    margin-bottom: 16px;
}

.state.error {
    color: #e53935;
}

.cta {
    display: inline-block;
    padding: 10px 16px;
    border-radius: 12px;
    background: $thirdColor;
    color: $primaryColor;
    font-weight: 900;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
        filter: brightness(1.05);
    }
}
</style>
