<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Where are we taking you?</h1>
        <p>Find your bus trip fast — choose origin, destination and date.</p>

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
            Search trip
          </button>

        </div>
      </div>
    </section>
    <section class="reco">
      <div class="recoHead">
        <h2>Recommended Places</h2>
        <p>Places maybe you will be interested</p>
      </div>

      <div v-if="featuredLoading" class="cardLite">Loading featured...</div>
      <div v-else-if="featuredError" class="errorLite">{{ featuredError }}</div>

      <div v-else class="carouselWrap">
        <button class="navBtn left" @click="scrollFeatured(-1)" aria-label="Scroll left">
          ‹
        </button>

        <div ref="featuredTrack" class="carousel">
          <article v-for="r in featuredRoutes" :key="r.id" class="placeCard carouselItem" role="button" tabindex="0"
            @click="goRoute(r)" @keydown.enter="goRoute(r)">
            <div class="thumb" :style="{ backgroundImage: `url(${routePhotoUrl(r) || destinationImage})` }"></div>

            <div class="meta">
              <h3>{{ r.origin?.name }} → {{ r.destination?.name }}</h3>
              <p>${{ Number(r.ticketPrice).toFixed(0) }}</p>
            </div>
          </article>

          <div v-if="featuredRoutes.length === 0" class="emptyLite">
            No featured trips right now.
          </div>
        </div>

        <button class="navBtn right" @click="scrollFeatured(1)" aria-label="Scroll right">
          ›
        </button>
      </div>
    </section>

  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import destinationImage from "@/assets/images/destinationPlaceholder.jpg";
import { getRoutes, getFeaturedRoutes } from "@/services/routesApi";

export default {
  components: { ClientLayout },

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
      today: yyyyMmDd,

      featuredRoutes: [],
      featuredLoading: true,
      featuredError: ""
    };
  },

  computed: {
    canSearch() {
      return this.selectedOriginName && this.selectedDestinationId && this.selectedDate;
    }
  },

  async mounted() {
    this.routes = await getRoutes({ take: 100 });
    console.log("ROUTES RAW FROM API:", this.routes);

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

    try {
      this.featuredLoading = true;
      this.featuredError = "";
      this.featuredRoutes = await getFeaturedRoutes();
    } catch (e) {
      this.featuredError = e?.message || "could not load featured routes";
    }
    finally {
      this.featuredLoading = false;
    }
  },

  watch: {
    selectedOriginName(originName) {
      this.selectedDestinationId = "";
      this.selectedDate = "";

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
    },
  },

  setup() {
    return { destinationImage };
  },

  methods: {
    searchTrip() {
      const origin = this.origins.find(o => o.name === this.selectedOriginName);
      if (!origin) {
        return;
      }

      const route = this.routes.find(
        r =>
          origin.originIds.includes(r.originId) &&
          r.destinationId === this.selectedDestinationId
      );

      if (!route) {
        return;
      }

      this.$router.push({
        name: "tripsList",
        query: {
          routeId: route.id,
          date: this.selectedDate
        }
      });
    },

    normalizeName(value) {
      if (!value) return "";
      return value
        .toString()
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    scrollFeatured(dir) {
      const el = this.$refs.featuredTrack;
      if (!el) return;

      const cardWidth = 320;
      el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
    },

    prettyRouteTitle(r) {
      if (r?.name) return r.name;
      return `${r?.origin?.name || "Origin"} - ${r?.destination?.name || "Destination"}`;
    },

    routePhotoUrl(r) {
      if (!r) return "";

      if (r.photoUrl && typeof r.photoUrl === "string") {
        if (r.photoUrl.startsWith("http")) return r.photoUrl;
      }
      if (r.photoKey && typeof r.photoKey === "string") {
        const base = import.meta.env.VITE_ASSETS_BASE_URL; // optional
        if (base) {
          const b = base.replace(/\/$/, "");
          const k = r.photoKey.replace(/^\//, "");
          return `${b}/${k}`;
        }
      }

      return "";
    },

    goRoute(r) {

      this.$router.push({
        name: "tripsList",
        query: { routeId: r.id }
      });
    }
  }

};
</script>


<style scoped lang="scss">
@use "../styles/colors.scss" as *;
@use "sass:color";

.hero {
  padding: 44px 18px 28px;
  background: radial-gradient(circle at 30% 20%,
      $secondaryColor 0%,
      $primaryColor 55%,
      #001a18 100%);
}

.heroInner {
  width: min(980px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
  letter-spacing: -0.8px;
}

p {
  margin: 10px 0 18px;
  opacity: 0.9;
  font-weight: 700;
}

.searchCard {
  background: rgba($fourthColor, 0.94);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}

@media (min-width: 820px) {
  .grid {
    grid-template-columns: 1fr 1fr 220px;
    align-items: end;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  color: $primaryColor;
  font-weight: 900;
  opacity: 0.9;
}

input,
select {
  height: 44px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;

  border-radius: 14px;
  border: 1px solid rgba($primaryColor, 0.35);
  background: $fourthColor;
  color: $primaryColor;
  font-weight: 700;

  outline: none;
  appearance: none;
}

select {
  background-image: linear-gradient(45deg,
      transparent 50%,
      $primaryColor 50%),
    linear-gradient(135deg,
      $primaryColor 50%,
      transparent 50%);
  background-position:
    calc(100% - 18px) 18px,
    calc(100% - 12px) 18px;
  background-size: 6px 6px;
  background-repeat: no-repeat;
}

input:focus,
select:focus {
  border-color: $thirdColor;
  box-shadow: 0 0 0 4px rgba($thirdColor, 0.35);
}

select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cta {
  margin-top: 14px;
  height: 48px;
  width: 100%;
  border: none;
  border-radius: 16px;

  background: linear-gradient(135deg,
      $thirdColor,
      color.adjust($thirdColor, $lightness: 8%));
  color: $primaryColor;
  font-weight: 1000;
  letter-spacing: 0.4px;

  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

@media (min-width: 820px) {
  .cta {
    margin-top: 16px;
    width: 260px;
  }
}

.cta:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba($thirdColor, 0.45);
}

.cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reco {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 26px 0 50px;
}

.recoHead h2 {
  margin: 0;
  color: $primaryColor;
  font-weight: 1000;
}

.recoHead p {
  margin: 6px 0 18px;
  color: rgba($primaryColor, 0.75);
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 820px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.placeCard {
  overflow: hidden;
  border-radius: 20px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.placeCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
}

.thumb {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
}

.meta {
  padding: 14px;
}

.meta h3 {
  margin: 0;
  color: $primaryColor;
  font-weight: 1000;
}

.meta p {
  margin: 6px 0 0;
  color: rgba($primaryColor, 0.75);
  font-weight: 700;
}


.cardLite {
  padding: 14px;
  border-radius: 14px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);
}

.errorLite {
  padding: 12px 14px;
  border-radius: 14px;
  color: #b00020;
  font-weight: 800;
  background: rgba(176, 0, 32, 0.12);
  border: 1px solid rgba(176, 0, 32, 0.25);
}

.carouselWrap {
  position: relative;
}

.carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 4px 14px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
}

.carousel::-webkit-scrollbar {
  display: none;
}

.carouselItem {
  min-width: 280px;
  max-width: 320px;
  flex: 0 0 auto;
  scroll-snap-align: start;
  cursor: pointer;
}

.navBtn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba($primaryColor, 0.18);
  background: rgba($fourthColor, 0.92);
  color: $primaryColor;
  font-weight: 1000;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
  z-index: 5;
}

.navBtn.left {
  left: -10px;
}

.navBtn.right {
  right: -10px;
}

@media (max-width: 820px) {
  .navBtn {
    display: none;
  }
}
</style>
