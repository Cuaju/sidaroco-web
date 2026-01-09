<template>
  <CashierLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Point of Sale</h1>
        <p>Search for available trips to sell tickets</p>

        <div class="searchCard">
          <div class="grid">
            <select v-model="selectedOriginName">
              <option value="" disabled>Select origin</option>
              <option v-for="o in origins" :key="o.name" :value="o.name">
                {{ o.name }}
              </option>
            </select>

            <select v-model="selectedDestinationId" :disabled="!selectedOriginName">
              <option value="" disabled>Select destination</option>
              <option v-for="d in destinations" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>

            <label class="field">
              <span>Date</span>
              <input type="date" v-model="selectedDate" :min="today" />
            </label>
          </div>

          <button class="cta" :disabled="!canSearch" @click="searchTrip">
            Search Trips
          </button>
        </div>
      </div>
    </section>
  </CashierLayout>
</template>

<script>
import CashierLayout from "../layouts/cashierLayout.vue";
import { getRoutes } from "@/services/routesApi";

export default {
  components: { CashierLayout },

  data() {
    const today = new Date();
    const yyyyMmDd = today.toISOString().split("T")[0];
    return {
      routes: [],
      origins: [],
      destinations: [],
      selectedOriginId: "",
      selectedDestinationId: "",
      selectedDate: "",
      selectedOriginName: "",
      today: yyyyMmDd
    };
  },

  computed: {
    canSearch() {
      return this.selectedOriginName && this.selectedDestinationId && this.selectedDate;
    }
  },

  async mounted() {
    this.routes = await getRoutes({ take: 100 });

    const originMap = new Map();

    this.routes.forEach(r => {
      if (r.origin) {
        const normalizedName = this.normalizeName(r.origin.name);

        if (!originMap.has(normalizedName)) {
          originMap.set(normalizedName, {
            name: normalizedName,
            originIds: new Set()
          });
        }

        originMap.get(normalizedName).originIds.add(r.origin.id);
      }
    });

    this.origins = Array.from(originMap.values())
      .map(o => ({
        name: o.name,
        originIds: Array.from(o.originIds)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  },

  watch: {
    selectedOriginName(originName) {
      this.selectedDestinationId = "";

      const origin = this.origins.find(o => o.name === originName);
      if (!origin) {
        this.destinations = [];
        return;
      }

      const originIds = origin.originIds;
      const destinationMap = new Map();

      this.routes
        .filter(r => originIds.includes(r.originId))
        .forEach(r => {
          if (r.destination) {
            const normalizedName = this.normalizeName(r.destination.name);
            destinationMap.set(r.destination.id, normalizedName);
          }
        });

      this.destinations = Array.from(destinationMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    },
    selectedDestinationId(newVal) {
      if (!newVal) return;

      if (!this.selectedDate || this.selectedDate < this.today) {
        this.selectedDate = this.today;
      }
    }
  },

  methods: {
    normalizeName(name) {
      if (!name) return "";
      return name.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    },

    searchTrip() {
      if (!this.canSearch) return;

      const origin = this.origins.find(o => o.name === this.selectedOriginName);
      if (!origin) return;

      const route = this.routes.find(
        r =>
          origin.originIds.includes(r.originId) &&
          r.destinationId === this.selectedDestinationId
      );

      if (!route) return;

      this.$router.push({
        name: "cashierTrips",
        query: {
          routeId: route.id,
          date: this.selectedDate
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;
@use "sass:color";

.hero {
  min-height: calc(100vh - 140px);
  padding: 44px 18px 28px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
  display: flex;
  align-items: center;
}

.heroInner {
  width: min(600px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
  text-align: center;
}

p {
  margin: 10px 0 18px;
  opacity: 0.9;
  font-weight: 700;
  text-align: center;
}

.searchCard {
  background: rgba($fourthColor, 0.94);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.grid {
  display: grid;
  gap: 14px;
}

select,
input {
  height: 50px;
  border-radius: 12px;
  border: 2px solid color.adjust($primaryColor, $lightness: 28%);
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
  background: white;

  &:focus {
    outline: none;
    border-color: $primaryColor;
  }

  &:disabled {
    background: #eee;
    cursor: not-allowed;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-weight: 700;
    color: $primaryColor;
    font-size: 13px;
  }
}

.cta {
  margin-top: 20px;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: $fourthColor;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

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
