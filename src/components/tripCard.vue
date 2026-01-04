<template>
  <article class="tripCard" :class="{ expanded }" @click="toggleExpand">
    <div v-if="!expanded" class="collapsedRow">
      <span class="cell route">{{ routeName }}</span>
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

          <div v-if="ticket.route" class="detailItem full">
            <div class="detailContent">
              <span class="label">Route</span>
              <span class="value">{{ ticket.route.name }}</span>
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
  name: "TripCard",

  props: {
    ticket: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      expanded: false,
    };
  },

  computed: {
    routeName() {
      console.log('🔍 ROUTE DATA:', this.ticket.route);

      if (this.ticket.route?.name) {
        return this.ticket.route.name;
      }
      return "Route not available";
    },

    auth() {
      return useAuthStore();
    },

    tripDateTime() {
      if (!this.ticket.trip?.departureTime) return null;
      return new Date(this.ticket.trip.departureTime);
    },

    tripStatus() {
      console.log('🔍 TRIP DATA:', this.ticket.trip);

      if (!this.tripDateTime) {
        return { label: "Unknown", class: "unknown" };
      }

      const now = new Date();

      if (this.tripDateTime < now) {
        return { label: "Completed", class: "completed" };
      } else {
        return { label: "Upcoming", class: "upcoming" };
      }
    },

    debugInfo() {
      return {
        ticket: this.ticket,
        routeName: this.routeName,
        tripStatus: this.tripStatus,
        tripDateTime: this.tripDateTime,
        route: this.ticket.route,
        trip: this.ticket.trip
      };
    }
  },

  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },

    formatDate(date) {
      if (!date) return "N/A";

      const dateObj = date instanceof Date ? date : new Date(date);

      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatTime(date) {
      if (!date) return "N/A";

      const dateObj = date instanceof Date ? date : new Date(date);

      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    async downloadPdf() {
      const purchaseDate = new Date(this.ticket.createdAt);

      const account = this.auth.account;

      await buildTicketPdf({
        ticketId: this.ticket.id,
        routeName: this.normalizeRouteName(this.routeName),
        travelDate: this.formatDate(this.tripDateTime),
        travelTime: this.formatTime(this.tripDateTime),
        purchaseDateTime: purchaseDate.toLocaleString("en-US"),
        seat: this.ticket.seatNumber,
        price: this.ticket.price,
        username: account?.username ?? "—",
        email: account?.email ?? "—",
        logoBase64: sidarocoLogo
      });
    },
    normalizeRouteName(name) {
      if (typeof name !== "string") return "—";
      return name.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "").replace(/\s+/g, " ").trim().replace(" ", " -> ");
    }
  },
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.tripCard {
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
  grid-template-columns: 2fr 1fr 100px 120px 40px;
  align-items: center;
  padding: 14px 20px;
  gap: 16px;
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
  }

  &.price {
    font-weight: 700;
    color: $secondaryColor;
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