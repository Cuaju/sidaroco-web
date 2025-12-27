<template>
    <section class="editRoutePage">
      <div class="pageHeader">
        <h2>Editar ruta</h2>
        <button class="backBtn" @click="goBack">
          ← Regresar
        </button>
      </div>
      <p class="subtitle">
        Modifica el nombre, origen y destino de la ruta
      </p>
      <div class="content">
        <form @submit.prevent="save" class="routeFormCard">
          <h3>Datos de la ruta</h3>
          <div class="inputs">
            <label class="field">
              <span>Nombre de la ruta</span>
              <input v-model="form.name" placeholder="Ruta" required />
            </label>
            <label class="field">
              <span>Origen</span>
              <input v-model="form.originText" placeholder="CDMX" />
            </label>
            <label class="field">
              <span>Destino</span>
              <input v-model="form.destinationText" placeholder="Toluca" />
            </label>
          </div>

          <button
            type="button"
            class="traceBtn"
            @click="traceNewRoute"
            :disabled="!canTrace"
          >
             Trazar ruta nueva
          </button>
          <button
            type="submit"
            class="saveBtn"
            :disabled="!canSave"
          >
             Guardar cambios
          </button>
        </form>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MapPicker from "@/components/mapPicker.vue";
import { getRouteById, updateRoute } from "@/services/routesApi";
import { useToast } from "vue-toastification";
import RouteManagerLayout from "@/layouts/routeManagerLayout.vue";


const router = useRouter();
const route = useRoute();
const toast = useToast();

const form = ref({
  name: "",
  originText: "",
  destinationText: "",
});

const origin = ref(null);
const destination = ref(null);

const originalOrigin = ref("");
const originalDestination = ref("");

const routeTraced = ref(true);

const goBack = () => router.back();

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

onMounted(async () => {
  const data = await getRouteById(route.params.id);

  form.value = {
    name: data.name,
    originText: data.origin.name,
    destinationText: data.destination.name,
  };

  originalOrigin.value = data.origin.name;
  originalDestination.value = data.destination.name;

  origin.value = data.origin;
  destination.value = data.destination;
});

watch(
  () => [form.value.originText, form.value.destinationText],
  () => {
    routeTraced.value =
      form.value.originText === originalOrigin.value &&
      form.value.destinationText === originalDestination.value;
  }
);

const canTrace = computed(() => !routeTraced.value);
const canSave = computed(() => routeTraced.value);

const traceNewRoute = async () => {
  const o = await geocode(form.value.originText);
  const d = await geocode(form.value.destinationText);

  if (!o || !d) {
    toast.error("No se pudo trazar la ruta");
    return;
  }

  origin.value = o;
  destination.value = d;
  routeTraced.value = true;
};

const save = async () => {
  await updateRoute(route.params.id, {
    name: form.value.name,
    origin: origin.value,
    destination: destination.value,
  });

  toast.success("ruta actualizada");
  router.push("/routes");
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.editRoutePage {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 24px 0;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-weight: 900;
    color: $primaryColor;
  }
}

.subtitle {
  margin: 6px 0 18px;
  color: rgba($primaryColor, 0.75);
  font-weight: 700;
}

.backBtn {
  background: none;
  border: none;
  font-weight: 900;
  color: $primaryColor;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.routeFormCard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba($fourthColor, 0.95);
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);

  h3 {
    margin: 0 0 10px;
    color: $primaryColor;
    font-weight: 1000;
    font-size: clamp(22px, 2.5vw, 28px);
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      span {
        font-weight: 900;
        color: $primaryColor;
      }

      input {
        height: 44px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid rgba($primaryColor, 0.35);
        background: $fourthColor;
        outline: none;
        transition: all 0.2s ease;

        &:focus {
          border-color: $thirdColor;
          box-shadow: 0 0 0 4px rgba($thirdColor, 0.25);
        }
      }
    }
  }

  .traceBtn {
    height: 46px;
    border-radius: 14px;
    background: $secondaryColor;
    border: none;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .saveBtn {
    height: 48px;
    border-radius: 14px;
    background: $thirdColor;
    border: none;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.map-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
}

.map {
  min-height: 420px;
}
</style>
