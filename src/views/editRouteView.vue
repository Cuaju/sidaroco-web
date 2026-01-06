<template>
    <section class="editRoutePage">
      <div class="pageHeader">
        <h2>Edit route</h2>
        <button class="backBtn" @click="goBack">
          ← Back
        </button>
      </div>
      <p class="subtitle">
        Edit the route name, origin, and destination
      </p>
      <div class="content">
        <form @submit.prevent="save" class="routeFormCard">
          <h3>Route details</h3>
          <div class="inputs">
            <label class="field">
              <span>Route name</span>
              <input v-model="form.name" placeholder="Ruta" required />
            </label>
            <label class="field">
              <span>Ticket price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                v-model.number="form.ticketPrice"
                placeholder="0.00"
                />
              </label>

            <label class="field">
              <span>Origin</span>
              <input v-model="form.originText" placeholder="CDMX" />
            </label>
            <label class="field">
              <span>Destination</span>
              <input v-model="form.destinationText" placeholder="Toluca" />
            </label>
          </div>
          <div class="imageBlock">
            <div class="imagePreview">
              <img
                v-show="previewImage"
                :src="previewImage"
                alt="Route image"
              />
            </div>
            <div class="imageActions">
              <label class="imageBtn">
                Change image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  @change="onImageChange"
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            class="traceBtn"
            @click="traceNewRoute"
            :disabled="!canTrace"
          >
          Draw new route
          </button>
          <button
            type="submit"
            class="saveBtn"
            :disabled="!canSave"
          >
             Save changes
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
import { compressImage } from "@/utils/imageCompressor";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const form = ref({
  name: "",
  originText: "",
  destinationText: "",
  ticketPrice: 0,
  photo: null,
});


const origin = ref(null);
const destination = ref(null);

const originalOrigin = ref("");
const originalDestination = ref("");

const routeTraced = ref(true);

const imageFile = ref(null);
const previewImage = ref(null);

const goBack = () => router.back();

const geocode = async (place) => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place
    )}.json?access_token=${token}`
  );

  const data = await res.json();
  if (!data.features?.length) return null;

  const feature = data.features[0];
  const [lng, lat] = feature.center;

  return {
    mapboxId: feature.id,         
    name: feature.text,            
    fullName: feature.place_name,  
    lat,
    lng,
  };
};

onMounted(async () => {
  const data = await getRouteById(route.params.id);
  console.log("Photo URL:", data.photoKey);

  form.value = {
    name: data.name,
    originText: data.origin.name,
    destinationText: data.destination.name,
    ticketPrice: data.ticketPrice ?? 0,
  };

  originalOrigin.value = data.origin.name;
  originalDestination.value = data.destination.name;

  origin.value = data.origin;
  destination.value = data.destination;

  previewImage.value = data.photoKey || null;
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

const onImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only image files allowed");
    return;
  }

  const compressedFile = await compressImage(file);
  imageFile.value = compressedFile;
  previewImage.value = URL.createObjectURL(compressedFile);
};

const traceNewRoute = async () => {
  const o = await geocode(form.value.originText);
  const d = await geocode(form.value.destinationText);

  if (!o || !d) {
    toast.error("Error drawing route");
    return;
  }

  origin.value = o;
  destination.value = d;
  routeTraced.value = true;
};

const save = async () => {
  try {
    const fd = new FormData();

    fd.append("name", form.value.name);
    fd.append("ticketPrice", String(form.value.ticketPrice));
    fd.append("origin", JSON.stringify(origin.value));
    fd.append("destination", JSON.stringify(destination.value));

    if (imageFile.value) {
      fd.append("photo", imageFile.value);
    }

    await updateRoute(route.params.id, fd);

    toast.success("Route updated");
    router.push("/routes");

  } catch (e) {
    console.error("UPDATE ERROR:", e);

    if (e.message === "ROUTE_NAME_EXISTS") {
      toast.error("A route with this name already exists");
      return;
    }

    if (e.message === "ROUTE_ORIGIN_DESTINATION_EXISTS") {
      toast.error("This origin and destination already exist");
      return;
    }

    toast.error("Error updating route");
  }
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
.imageBlock {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 12px;
}

.imagePreview {
  width: 140px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba($primaryColor, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  display: block;   

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 12px;
    font-weight: 900;
    color: rgba($primaryColor, 0.6);
  }
}

.imageActions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.imageBtn {
  padding: 10px 16px;
  border-radius: 14px;
  background: rgba($thirdColor, 0.18);
  color: $thirdColor;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    background: rgba($thirdColor, 0.28);
  }
}


</style>
