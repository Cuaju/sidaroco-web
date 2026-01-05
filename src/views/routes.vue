<template>
  <section class="routesPage">
  <div class="pageHeader">
    <h2 class="pageTitle">Saved Routes</h2>
    <button class="addBtn" @click="goToCreateRoute">
      Add route
    </button>
  </div>
    <div class="filters">
  <div class="filtersHeader">
    <span class="filtersTitle">Filters</span>
    <button class="clearBtn" @click="clearFilters">
      Clear
    </button>
  </div>
  <div class="filtersGrid">
    <input
      v-model="name"
      type="text"
      placeholder="Route name"
    />
    <input
      v-model="origin"
      type="text"
      placeholder="Origin"
    />
    <input
      v-model="destination"
      type="text"
      placeholder="Destination"
    />
  </div>
    <label class="featuredToggle">
      <input type="checkbox" v-model="onlyFeatured" />
      <span>Featured routes only</span>
    </label>
  </div>
    <div v-if="loading">Loading routes...</div>
    <div v-else class="routesList">
      <RouteCard
        v-for="route in routes"
        :key="route.id"
        :route="route"
        @delete="removeRoute"
        @edit="goToEditRoute"
      />
    </div>
  </section>
</template>

<script setup>
  import { ref, watch, onMounted } from "vue";
  import { getRoutes, deleteRoute } from "@/services/routesApi";
  import RouteCard from "@/components/routeCard.vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  
  const routes = ref([]);
  const loading = ref(false);
  const name = ref("");
  const origin = ref("");
  const destination = ref("");
  const onlyFeatured = ref(false);
  let debounceTimer = null;
  
  async function loadRoutes() {
    loading.value = true;
    routes.value = await getRoutes({
      name: name.value,
      origin: origin.value,
      destination: destination.value,
      featured: onlyFeatured.value || undefined,
      take: 100,
    });
    loading.value = false;
  }
  
  watch(
    [name, origin, destination, onlyFeatured],
    () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadRoutes, 400);
    }
  );
  
  function clearFilters() {
    name.value = "";
    origin.value = "";
    destination.value = "";
    onlyFeatured.value = false;
  }
  
  onMounted(loadRoutes);

  const removeRoute = async (id) => {
    await deleteRoute(id);
    routes.value = routes.value.filter(r => r.id !== id);
  };
  
  const goToEditRoute = (id) => {
    router.push(`/routes/${id}/edit`);
  };
  
  const goToCreateRoute = () => {
    router.push("/CreateRouteView");
  };
  </script>
  
  <style scoped lang="scss">
    @use "../styles/colors.scss" as *;
  
    .routesPage {
      width: min(980px, 96vw);
      margin: 0 auto;
      padding: 24px 0;
    }

    .addBtn {
      margin: 12px 0;
      padding: 10px 16px;
      border-radius: 12px;
      border: none;
      background: $thirdColor;
      color: $primaryColor;
      font-weight: 900;
      cursor: pointer;
      display:grid;
    }
  
    .routesList {
      display: grid;
      gap: 12px;
    }
    .filters {
  margin: 16px 0;
  padding: 16px;
  border-radius: 14px;

  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);

  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filtersHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filtersTitle {
  font-weight: 900;
  color: $primaryColor;
  opacity: 0.9;
}

.filtersGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  input {
    padding: 10px 12px;
    border-radius: 12px;
    border: none;
    outline: none;

    background: rgba($secondaryColor, 0.12);
    color: $primaryColor;
    font-weight: 700;

    &::placeholder {
      color: rgba($primaryColor, 0.55);
    }

    &:focus {
      background: rgba($secondaryColor, 0.18);
    }
  }
}

.featuredToggle {
  display: flex;
  align-items: center;
  gap: 8px;

  font-weight: 800;
  color: rgba($primaryColor, 0.85);

  input {
    accent-color: $thirdColor;
  }
}

.clearBtn {
  padding: 6px 14px;
  border-radius: 10px;
  border: none;

  background: rgba($secondaryColor, 0.15);
  color: $primaryColor;

  font-weight: 800;
  cursor: pointer;

  transition: all 0.15s ease;

  &:hover {
    background: rgba($secondaryColor, 0.25);
  }
}
.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
}

.pageTitle {
  margin: 0;
  font-weight: 900;
  color: $primaryColor;
}

    </style>
  