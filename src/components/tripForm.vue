<template>
  <div class="tripFormOverlay" @click.self="$emit('close')">
    <div class="tripFormModal">
      <h3>{{ isEdit ? "Edit trip" : "Add trip" }}</h3>

      <form @submit.prevent="handleSubmit">
        <div class="formGroup">
          <label>Departure time</label>
          <input
            type="time"
            v-model="form.departureTime"
            required
          />
        </div>

        <div class="formGroup">
          <label>Route</label>
          <select v-model="form.routeId" required>
            <option value="" disabled>Select a route</option>
            <option v-for="route in routes" :key="route.id" :value="route.id">
              {{ route.id }} - {{ route.origin.name }} → {{ route.destination.name }}
            </option>
          </select>
        </div>

        <div class="formGroup"> 
          <label>Bus</label>
          <select v-model="form.busId" required>
            <option value="" disabled>Select a bus</option>
            <option v-for="bus in filteredBuses" :key="bus.id" :value="bus.id">
              {{ bus.id }} - {{ bus.name }} ({{ bus.plateNumber }})
            </option>
          </select>
          <small v-if="form.routeId && filteredBuses.length === 0" class="hint">
            There are no buses assigned to this route
          </small>
        </div>

        <div class="formGroup">
          <label>Driver</label>
          <select v-model="form.driverId" required>
            <option value="" disabled>Select a driver</option>
            <option v-for="driver in activeDrivers" :key="driver.id" :value="driver.id">
              {{ driver.id }} - {{ driver.name }}
            </option>
          </select>
        </div>

        <div class="formActions">
          <button type="button" class="cancelBtn" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="submitBtn" :disabled="submitting">
            {{ submitting ? "Saving..." : isEdit ? "Save changes" : "Add trip" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getRoutes } from "@/services/routesApi";
import { getAllBuses, getAllDrivers } from "@/services/fleetApi";

const props = defineProps({
  trip: { type: Object, default: null }, // null = create, object = edit
});

const emit = defineEmits(["close", "submit"]);

const isEdit = computed(() => props.trip !== null);

const form = ref({
  departureTime: "",
  routeId: "",
  busId: "",
  driverId: "",
});

const routes = ref([]);
const buses = ref([]);
const drivers = ref([]);
const submitting = ref(false);

// Filter buses by selected route (routeId match or null routeId)
const filteredBuses = computed(() => {
  if (!form.value.routeId) return buses.value.filter((b) => b.status === "Activo");
  
  return buses.value.filter(
    (b) =>
      b.status === "Activo" &&
      (b.routeId == null || Number(b.routeId) === Number(form.value.routeId))
  );
});

// Only active drivers
const activeDrivers = computed(() => {
  return drivers.value.filter((d) => d.status === "Activo");
});

// Reset busId when route changes if current bus is not valid
watch(
  () => form.value.routeId,
  () => {
    const validBusIds = filteredBuses.value.map((b) => b.id);
    if (!validBusIds.includes(Number(form.value.busId))) {
      form.value.busId = "";
    }
  }
);

onMounted(async () => {
  try {
    const [routesData, busesData, driversData] = await Promise.all([
      getRoutes(),
      getAllBuses(),
      getAllDrivers(),
    ]);

    routes.value = routesData.data || routesData;
    buses.value = busesData;
    drivers.value = driversData;

    // If editing, populate form
    if (props.trip) {
      const t = props.trip;
      form.value.routeId = t.routeId;
      form.value.busId = t.busId;
      form.value.driverId = t.driverId;

      // Extract time from departureTime
      if (t.departureTime) {
        const d = new Date(t.departureTime);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        form.value.departureTime = `${hh}:${mm}`;
      }
    }
  } catch (err) {
    console.error("Error loading form data:", err);
  }
});

async function handleSubmit() {
  submitting.value = true;

  try {
    emit("submit", {
      departureTime: form.value.departureTime,
      routeId: Number(form.value.routeId),
      busId: Number(form.value.busId),
      driverId: Number(form.value.driverId),
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.tripFormOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.tripFormModal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  h3 {
    margin: 0 0 24px;
    color: $primaryColor;
    font-weight: 900;
    font-size: 1.4rem;
  }
}

.formGroup {
  margin-bottom: 18px;

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 700;
    font-size: 0.9rem;
    color: $primaryColor;
  }

  input,
  select {
    width: 100%;
    // ESTA LÍNEA ES LA SOLUCIÓN:
    box-sizing: border-box; 
    height: 46px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba($primaryColor, 0.2);
    background: $fourthColor;
    font-size: 1rem;
    font-weight: 600;
    color: $primaryColor;
    outline: none;
    transition: all 0.2s ease;
    
    // Aseguramos que la tipografía sea consistente
    font-family: inherit; 

    &:focus {
      border-color: $secondaryColor;
      box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
    }
  }

  select {
    cursor: pointer;
    // Opcional: para que se vea idéntico en altura en todos los navegadores
    appearance: none; 
    // Si usas appearance: none, necesitarás volver a poner la flechita con background-image, 
    // si no quieres complicarte, solo con el box-sizing basta.
  }

  .hint {
    display: block;
    margin-top: 6px;
    font-size: 0.8rem;
    color: #dc3545;
  }
}

.formActions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.cancelBtn,
.submitBtn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: none;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancelBtn {
  background: rgba($primaryColor, 0.1);
  color: $primaryColor;

  &:hover {
    background: rgba($primaryColor, 0.15);
  }
}

.submitBtn {
  background: $secondaryColor;
  color: white;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>