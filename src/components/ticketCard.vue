<template>
    <article class="ticketCard">
        <div class="route">
            <span class="label">Route</span>
            <span class="value">#{{ ticket.routeId }}</span>
        </div>

        <div class="date">
            <span class="label">Date</span>
            <span class="value">{{ formattedDate }}</span>
        </div>

        <div class="price">
            <span class="label">Price</span>
            <span class="value">${{ ticket.price.toFixed(2) }}</span>
        </div>

        <div class="status" :data-state="tripState">
            {{ tripLabel }}
        </div>
    </article>
</template>

<script>
export default {
    name: "ticketCard",
    props: {
        ticket: {
            type: Object,
            required: true
        }
    },
    computed: {
        formattedDate() {
            if (!this.ticket.saleDate) return "";

            const date = new Date(this.ticket.saleDate);

            return date.toLocaleString("es-MX", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
        },

        tripState() {
            const now = new Date();
            const start = new Date(this.ticket.saleDate);

            const DURATION_MS = 4 * 60 * 60 * 1000;
            const end = new Date(start.getTime() + DURATION_MS);

            if (now < start) return "UPCOMING";
            if (now >= start && now < end) return "ONGOING";
            return "FINISHED";
        },

        tripLabel() {
            switch (this.tripState) {
                case "UPCOMING": return "Upcoming";
                case "ONGOING": return "Ongoing";
                case "FINISHED": return "Finished";
            }
        }
    }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.ticketCard {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 14px;
    align-items: center;

    padding: 16px;
    border-radius: 16px;
    background: $fourthColor;
    border: 1px solid rgba($primaryColor, 0.12);

    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: rgba($primaryColor, 0.6);
}

.value {
    font-weight: 900;
    color: $primaryColor;
}

.status {
    padding: 6px 12px;
    border-radius: 12px;
    font-weight: 900;
    font-size: 1.1rem;
    text-align: center;
}

.status[data-state="UPCOMING"] {
    background: rgba(#ff9800, 0.15);
    color: #ff9800;
}

.status[data-state="ONGOING"] {
    background: rgba($thirdColor, 0.2);
    color: $thirdColor;
}

.status[data-state="FINISHED"] {
    background: rgba($primaryColor, 0.12);
    color: rgba($primaryColor, 0.6);
}
</style>
