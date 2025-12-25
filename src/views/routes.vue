<template>
  <section class="routesPage">
    <h2>Rutas guardadas</h2>
    <button class="addBtn" @click="goToCreateRoute">
      Agregar ruta
    </button>
    <div v-if="loading">Cargando rutas...</div>
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
  import { onMounted, ref } from "vue";
  import RouteCard from "@/components/routeCard.vue";
  import { getRoutes } from "@/services/routesApi";
  import { deleteRoute } from "@/services/routesApi";

  const routes = ref([]);
  const loading = ref(true);
  import { useRouter } from "vue-router";

  const router = useRouter();
  const removeRoute = async (id) => {
    try {
      await deleteRoute(id);
      routes.value = routes.value.filter(r => r.id !== id);
    } catch (err) {
      console.error("Error eliminando ruta", err);
    }
  };
  
  const goToEditRoute = (id) => {
    router.push(`/routes/${id}/edit`);
  };

const goToCreateRoute = () => {
  console.log("CLICK EN AGREGAR RUTA");
  router.push("/CreateRouteView");
};

onMounted(async () => {
  console.log("ANTES de getRoutes");
  try {
    routes.value = await getRoutes();
    console.log("DESPUÉS de getRoutes");
  } catch (err) {
    console.error("Error cargando rutas", err);
  } finally {
    loading.value = false;
  }
  });
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
    }
  
    .routesList {
      display: grid;
      gap: 12px;
    }
    </style>
  