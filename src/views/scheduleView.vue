<template>
  <section class="schedulePage">
    <h2>Programación de Viajes</h2>

    <div class="scheduleLayout">
      <!-- Calendar sidebar -->
      <div class="calendarSide">
        <ScheduleCalendar
          ref="calendarRef"
          :selectedDate="selectedDate"
          @select="selectDate"
        />

        <div class="calendarActions" v-if="selectedDate">
          <button
            class="actionBtn create"
            v-if="!schedule"
            @click="createScheduleForDay"
            :disabled="loadingSchedule"
          >
            Crear Programación
          </button>

          <template v-else>
            <button
              class="actionBtn lock"
              v-if="!schedule.isLocked"
              @click="toggleLock"
            >
              Bloquear Día
            </button>
            <button class="actionBtn unlock" v-else @click="toggleLock">
              Desbloquear Día
            </button>

            <button class="actionBtn duplicate" @click="showDuplicateModal = true">
              Duplicar a otro día
            </button>

            <button
              class="actionBtn delete"
              v-if="!schedule.isLocked"
              @click="confirmDeleteSchedule"
            >
              Eliminar Programación
            </button>
          </template>
        </div>
      </div>

      <!-- Day detail -->
      <div class="daySide">
        <div v-if="!selectedDate" class="placeholder">
          <p>Selecciona una fecha en el calendario</p>
        </div>

        <div v-else-if="loadingSchedule" class="placeholder">
          <p>Cargando...</p>
        </div>

        <div v-else-if="!schedule" class="placeholder">
          <p>No hay programación para {{ formattedDate }}</p>
          <p class="hint">Crea una programación para comenzar a agregar viajes</p>
        </div>

        <div v-else class="dayDetail">
          <div class="dayHeader">
            <div class="dayTitle">
              <h3>{{ formattedDate }}</h3>
              <span class="lockBadge" v-if="schedule.isLocked">Bloqueado</span>
            </div>
            <button
              class="addTripBtn"
              v-if="!schedule.isLocked"
              @click="openTripForm(null)"
            >
              + Agregar Viaje
            </button>
          </div>

          <div v-if="schedule.trips?.length === 0" class="emptyTrips">
            No hay viajes programados para este día
          </div>

          <div v-else class="tripsList">
            <TripCard
              v-for="trip in sortedTrips"
              :key="trip.id"
              :trip="trip"
              :isLocked="schedule.isLocked"
              @edit="openTripForm"
              @delete="handleDeleteTrip"
              @cancel="handleCancelTrip"
              @complete="handleCompleteTrip"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Trip Form Modal -->
    <TripForm
      v-if="showTripForm"
      :trip="editingTrip"
      @close="closeTripForm"
      @submit="handleTripSubmit"
    />

    <!-- Duplicate Modal -->
    <div class="modalOverlay" v-if="showDuplicateModal" @click.self="showDuplicateModal = false">
      <div class="duplicateModal">
        <h3>Duplicar Programación</h3>
        <p>Copiar viajes de <strong>{{ formattedDate }}</strong> a:</p>
        <input type="date" v-model="duplicateTargetDate" />
        <div class="modalActions">
          <button class="cancelBtn" @click="showDuplicateModal = false">Cancelar</button>
          <button class="submitBtn" @click="handleDuplicate" :disabled="!duplicateTargetDate">
            Duplicar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import ScheduleCalendar from "@/components/scheduleCalendar.vue";
import TripCard from "@/components/tripCard.vue";
import TripForm from "@/components/tripForm.vue";
import {
  getScheduleForDay,
  createEmptySchedule,
  deleteSchedule,
  lockSchedule,
  unlockSchedule,
  duplicateSchedule,
  addTrip,
  updateTrip,
  deleteTrip,
  cancelTrip,
  completeTrip,
} from "@/services/scheduleApi";

const toast = useToast();

const selectedDate = ref(null);
const schedule = ref(null);
const loadingSchedule = ref(false);

const calendarRef = ref(null);

// Trip form state
const showTripForm = ref(false);
const editingTrip = ref(null);

// Duplicate modal state
const showDuplicateModal = ref(false);
const duplicateTargetDate = ref("");

const formattedDate = computed(() => {
  if (!selectedDate.value) return "";
  const d = new Date(selectedDate.value + "T12:00:00");
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const sortedTrips = computed(() => {
  if (!schedule.value?.trips) return [];
  return [...schedule.value.trips].sort(
    (a, b) => new Date(a.departureTime) - new Date(b.departureTime)
  );
});

async function selectDate(dateStr) {
  selectedDate.value = dateStr;
}

watch(selectedDate, async (dateStr) => {
  if (!dateStr) {
    schedule.value = null;
    return;
  }

  loadingSchedule.value = true;
  try {
    schedule.value = await getScheduleForDay(dateStr);
  } catch (err) {
    console.error("Error loading schedule:", err);
    schedule.value = null;
  } finally {
    loadingSchedule.value = false;
  }
});

async function createScheduleForDay() {
  try {
    await createEmptySchedule(selectedDate.value);
    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
    toast.success("Programación creada");
  } catch (err) {
    toast.error(err.message || "Error al crear programación");
  }
}

async function confirmDeleteSchedule() {
  const result = await Swal.fire({
    title: "¿Eliminar programación?",
    text: "Se eliminarán todos los viajes de este día",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await deleteSchedule(selectedDate.value);
      schedule.value = null;
      calendarRef.value?.refresh();
      toast.success("Programación eliminada");
    } catch (err) {
      toast.error(err.message || "Error al eliminar");
    }
  }
}

async function toggleLock() {
  try {
    if (schedule.value.isLocked) {
      await unlockSchedule(selectedDate.value);
      toast.success("Programación desbloqueada");
    } else {
      await lockSchedule(selectedDate.value);
      toast.success("Programación bloqueada");
    }
    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
  } catch (err) {
    toast.error(err.message || "Error al cambiar bloqueo");
  }
}

async function handleDuplicate() {
  try {
    await duplicateSchedule(selectedDate.value, duplicateTargetDate.value);
    toast.success("Programación duplicada");
    showDuplicateModal.value = false;
    duplicateTargetDate.value = "";
    calendarRef.value?.refresh();
  } catch (err) {
    toast.error(err.message || "Error al duplicar");
  }
}

// Trip CRUD
function openTripForm(trip) {
  editingTrip.value = trip;
  showTripForm.value = true;
}

function closeTripForm() {
  showTripForm.value = false;
  editingTrip.value = null;
}

async function handleTripSubmit(tripData) {
  try {
    if (editingTrip.value) {
      await updateTrip(selectedDate.value, editingTrip.value.id, tripData);
      toast.success("Viaje actualizado");
    } else {
      await addTrip(selectedDate.value, tripData);
      toast.success("Viaje agregado");
    }

    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
    closeTripForm();
  } catch (err) {
    toast.error(err.message || "Error al guardar viaje");
  }
}

async function handleDeleteTrip(tripId) {
  try {
    await deleteTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
    toast.success("Viaje eliminado");
  } catch (err) {
    toast.error(err.message || "Error al eliminar viaje");
  }
}

async function handleCancelTrip(tripId) {
  try {
    await cancelTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    toast.success("Viaje cancelado");
  } catch (err) {
    toast.error(err.message || "Error al cancelar viaje");
  }
}

async function handleCompleteTrip(tripId) {
  try {
    await completeTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    toast.success("Viaje completado");
  } catch (err) {
    toast.error(err.message || "Error al completar viaje");
  }
}
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.schedulePage {
  width: 96vw;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
}

h2 {
  color: $primaryColor;
  font-weight: 900;
  margin-bottom: 24px;
}

.scheduleLayout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 28px;
  align-items: start;
}

@media (max-width: 800px) {
  .scheduleLayout {
    grid-template-columns: 1fr;
  }
}

.calendarSide {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 20px;
}

.calendarActions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actionBtn {
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &.create {
    background: $secondaryColor;
    color: white;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }

  &.lock {
    background: rgba(255, 193, 7, 0.2);
    color: #856404;

    &:hover {
      background: rgba(255, 193, 7, 0.35);
    }
  }

  &.unlock {
    background: rgba(40, 167, 69, 0.2);
    color: #155724;

    &:hover {
      background: rgba(40, 167, 69, 0.35);
    }
  }

  &.duplicate {
    background: rgba($secondaryColor, 0.15);
    color: $secondaryColor;

    &:hover {
      background: rgba($secondaryColor, 0.25);
    }
  }

  &.delete {
    background: rgba(220, 53, 69, 0.15);
    color: #dc3545;

    &:hover {
      background: rgba(220, 53, 69, 0.25);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.daySide {
  min-height: 400px;
}

.placeholder {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: rgba($primaryColor, 0.5);
  font-weight: 600;

  .hint {
    font-size: 0.9rem;
    margin-top: 8px;
    opacity: 0.7;
  }
}

.dayDetail {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.dayHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.dayTitle {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: $primaryColor;
    text-transform: capitalize;
  }

  .lockBadge {
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(255, 193, 7, 0.2);
    color: #856404;
    font-size: 0.75rem;
    font-weight: 700;
  }
}

.addTripBtn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: $thirdColor;
  color: $primaryColor;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.05);
  }
}

.emptyTrips {
  padding: 40px;
  text-align: center;
  color: rgba($primaryColor, 0.4);
  font-weight: 600;
}

.tripsList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// Modals
.modalOverlay {
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

.duplicateModal {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 400px;

  h3 {
    margin: 0 0 12px;
    color: $primaryColor;
    font-weight: 900;
  }

  p {
    margin: 0 0 16px;
    color: rgba($primaryColor, 0.7);

    strong {
      color: $primaryColor;
    }
  }

  input[type="date"] {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba($primaryColor, 0.2);
    font-size: 1rem;
    font-weight: 600;
    color: $primaryColor;
    outline: none;

    &:focus {
      border-color: $secondaryColor;
    }
  }

  .modalActions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }

  .cancelBtn,
  .submitBtn {
    flex: 1;
    height: 44px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    cursor: pointer;
  }

  .cancelBtn {
    background: rgba($primaryColor, 0.1);
    color: $primaryColor;
  }

  .submitBtn {
    background: $secondaryColor;
    color: white;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
