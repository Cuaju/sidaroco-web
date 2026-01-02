<template>
    <section class="createRoutePage">
      <div class="pageHeader">
        <h2>Create new route</h2>

        <button class="backBtn" @click="goBack">
          ←Back
        </button>
      </div>

      <p class="subtitle">
        Please enter the route name, origin, and destination to register the route
      </p>

      <div class="content">
        <div class="form-card">
          <RouteForm
             :isTraced="isTraced"
             @trace="traceRoute"
             @save="saveRoute"
              />
        </div>
        <div class="map-card">
          <MapPicker
            class="map"
            :origin="origin"
            :destination="destination"
          />
        </div>
      </div>
    </section>
</template>

<script setup>

import { ref } from "vue";
import { useRouter } from "vue-router";
import RouteForm from "@/components/routeForm.vue";
import MapPicker from "@/components/mapPicker.vue";
import { createRoute } from "@/services/routesApi";
import { useToast } from "vue-toastification";
import RouteManagerLayout from "@/layouts/routeManagerLayout.vue";
const toast = useToast();

const router = useRouter();
const isTraced = ref(false);
const origin = ref(null);
const destination = ref(null);

const goBack = () => {
  router.back();
};

const geocode = async (place) => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place
    )}.json?access_token=${token}`
  );

  const data = await res.json();
  if (!data.features.length) return null;

  const [lng, lat] = data.features[0].center;
  return { name: place, lat, lng };
};

const saveRoute = async ({ name, originText, destinationTex, ticketPrice }) => {
  if (!isTraced.value) {
    toast.warning("You must draw the route first");
    return;
  }
  try {
    const originCoords = await geocode(originText);
    const destinationCoords = await geocode(destinationText);

    if (!originCoords || !destinationCoords) {
      toast.warning("Could not find the origin or destination");
      return;
    }

    origin.value = originCoords;
    destination.value = destinationCoords;

    await createRoute({
      name,
      ticketPrice,
      origin: originCoords,
      destination: destinationCoords,
    });

    toast.success("Route saved successfully");
    router.back();
  } catch (err) {
    console.error("Error al guardar ruta:", err);
    toast.error("Error saving the route");
  }
};
const traceRoute = async ({ originText, destinationText }) => {
  try {
    const originCoords = await geocode(originText);
    const destinationCoords = await geocode(destinationText);

    if (!originCoords || !destinationCoords) {
      toast.error("Error drawing route");
      return;
    }

    origin.value = originCoords;
    destination.value = destinationCoords;
    isTraced.value = true;

    toast.success("Route drawn successfully");
  } catch (e) {
    console.error(e);
    toast.error("Error drawing route");
  }
};


</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.createRoutePage {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 24px 0;
}

.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pageHeader h2 {
  margin: 0;
  font-weight: 900;
  color: $primaryColor;
}

.subtitle {
  margin: 6px 0 18px;
  color: rgba($primaryColor, 0.75);
  font-weight: 700;
}

.backBtn {
  background: transparent;
  border: none;
  color: $primaryColor;
  font-weight: 900;
  cursor: pointer;
  padding: 6px 0;

  &:hover {
    text-decoration: underline;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-card {
  background: rgba($fourthColor, 0.96);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
}

.map-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
}

.map {
  width: 100%;
  min-height: 420px;
}
</style>
