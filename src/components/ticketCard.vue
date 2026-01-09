<template>
  <article class="ticketCard" :class="{ expanded }" @click="toggleExpand">
    <div v-if="!expanded" class="collapsedRow">
      <span class="cell route">{{ routeName }}</span>
      <span class="cell seat">Seat {{ ticket.seatNumber }}</span>
      <span class="cell date">{{ formatDate(tripDateTime) }}</span>
      <span class="cell price">${{ ticket.price }}</span>
      <span class="cell statusBadge" :class="tripStatus.class">
        {{ tripStatus.label }}
      </span>
      <span class="cell expandIcon">▼</span>
    </div>

    <template v-else>
      <div class="cardBody">
        <div class="header">
          <div class="titleRow">
            <span class="route">{{ routeName }}</span>
            <span class="ticketId">#{{ ticket.id }}</span>
          </div>
          <div class="headerRight">
            <div class="statusBadge" :class="tripStatus.class">
              {{ tripStatus.label }}
            </div>
            <span class="collapseIcon">▲</span>
          </div>
        </div>

        <div class="details">
          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Date</span>
              <span class="value">{{ formatDate(tripDateTime) }}</span>
            </div>
          </div>

          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Time</span>
              <span class="value">{{ formatTime(tripDateTime) }}</span>
            </div>
          </div>

          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Seat Number</span>
              <span class="value">{{ ticket.seatNumber }}</span>
            </div>
          </div>

          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Price</span>
              <span class="value">${{ ticket.price }}</span>
            </div>
          </div>
        </div>

        <button class="downloadBtn" @click.stop="downloadPdf">
          Download PDF ticket
        </button>

      </div>
    </template>
  </article>
</template>

<script>
import sidarocoLogo from "@/assets/images/logoBase64";
import { buildTicketPdf } from "@/utils/ticketPdfBuilder";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "TicketCard",

  props: {
    ticket: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      expanded: false
    };
  },

  computed: {
    routeName() {
      if (this.ticket?.route?.origin?.name && this.ticket?.route?.destination?.name) {
        return `${this.ticket.route.origin.name} → ${this.ticket.route.destination.name}`;
      }

      if (typeof this.ticket?.route?.name === "string" && this.ticket.route.name.includes("→")) {
        const [origin, destination] = this.ticket.route.name.split("→").map(p => p.trim());
        return `${origin} → ${destination}`;
      }

      return "Route not available";
    }
    ,

    auth() {
      return useAuthStore();
    },

    tripDateTime() {
      if (!this.ticket?.trip?.departureTime) return null;
      return new Date(this.ticket.trip.departureTime);
    },

    tripStatus() {
      if (!this.tripDateTime) {
        return { label: "Unknown", class: "unknown" };
      }

      const now = new Date();
      return this.tripDateTime < now
        ? { label: "Completed", class: "completed" }
        : { label: "Upcoming", class: "upcoming" };
    }
  },

  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },

    formatDate(date) {
      if (!date) return "N/A";
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    },

    formatTime(date) {
      if (!date) return "N/A";
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    },

    async downloadPdf() {
      const purchaseDate = new Date(this.ticket.createdAt);
      const account = this.auth.account;

      let origin = "—";
      let destination = "—";

      if (this.ticket?.route?.origin?.name && this.ticket?.route?.destination?.name) {
        origin = this.ticket.route.origin.name;
        destination = this.ticket.route.destination.name;
      } else if (typeof this.ticket?.route?.name === "string" && this.ticket.route.name.includes("→")) {
        const [o, d] = this.ticket.route.name.split("→").map(p => p.trim());
        origin = o;
        destination = d;
      }


      await buildTicketPdf({
        ticketId: this.ticket.id,
        routeName: `${origin} → ${destination}`,
        origin,
        destination,
        travelDate: this.formatDate(this.tripDateTime),
        travelTime: this.formatTime(this.tripDateTime),
        purchaseDateTime: purchaseDate.toLocaleString("en-US"),
        seat: this.ticket.seatNumber,
        price: this.ticket.price,
        username: account?.username ?? "—",
        email: account?.email ?? "—",
        logoBase64: sidarocoLogo
      });
    }
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.ticketCard {
  border-radius: 12px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba($secondaryColor, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.expanded {
    cursor: default;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    &:hover {
      transform: none;
    }
  }
}

/* COLLAPSED ROW */
.collapsedRow {
  display: grid;
  grid-template-columns: 2fr 80px 1fr 100px 120px 40px;
  align-items: center;
  padding: 14px 20px;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto;
    gap: 8px;
    padding: 12px 16px;
  }
}

.cell {
  font-size: 14px;
  font-weight: 600;
  color: $primaryColor;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.route {
    font-weight: 800;

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      font-size: 15px;
    }
  }

  &.seat {
    background: linear-gradient(135deg, $primaryColor, $secondaryColor);
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 800;
    font-size: 12px;
    text-align: center;

    @media (max-width: 768px) {
      justify-self: start;
    }
  }

  &.date {
    @media (max-width: 768px) {
      font-size: 13px;
      color: rgba($primaryColor, 0.7);
    }
  }

  &.price {
    font-weight: 700;
    color: $secondaryColor;

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  &.statusBadge {
    @media (max-width: 768px) {
      padding: 4px 8px;
      font-size: 10px;
    }
  }

  &.expandIcon {
    @media (max-width: 768px) {
      display: none;
    }
  }
}

.expandIcon,
.collapseIcon {
  font-size: 12px;
  color: rgba($primaryColor, 0.4);
  transition: transform 0.2s ease;
}

.collapseIcon {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: rgba($primaryColor, 0.1);
  }
}

/* EXPANDED CARD */
.cardBody {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 12px;
}

.titleRow {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cardBody .route {
  font-size: 20px;
  font-weight: 900;
  color: $primaryColor;
}

.cardBody .ticketId {
  font-size: 13px;
  font-weight: 700;
  color: rgba($primaryColor, 0.5);
}

.statusBadge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.upcoming {
    background: rgba($secondaryColor, 0.15);
    color: $secondaryColor;
  }

  &.completed {
    background: rgba($primaryColor, 0.12);
    color: $primaryColor;
  }

  &.unknown {
    background: rgba(#999, 0.15);
    color: #666;
  }
}

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detailItem {
  display: flex;
  align-items: center;
  gap: 10px;

  &.full {
    grid-column: 1 / -1;
  }
}

.detailContent {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: rgba($primaryColor, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.value {
  font-size: 14px;
  font-weight: 700;
  color: $primaryColor;
}

.downloadBtn {
  margin-top: 18px;
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #1f2933, #111827);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
    opacity: 0.95;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
}
</style>
