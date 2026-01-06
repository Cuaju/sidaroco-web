<template>
  <section class="schedulePage">
    <h2>Trip Scheduling</h2>

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
            v-if="!schedule && !isPastDay"
            @click="createScheduleForDay"
            :disabled="loadingSchedule"
          >
          Create Schedule
          </button>

          <template v-else-if="schedule">
            <template v-if="!isPastDay">
              <button
                class="actionBtn lock"
                v-if="!schedule.isLocked"
                @click="toggleLock"
              >
              Lock Day
              </button>
              <button class="actionBtn unlock" v-else @click="toggleLock">
                Unlock Day
              </button>
            </template>

            <button class="actionBtn duplicate" @click="showDuplicateModal = true">
              Duplicate to Another Day
            </button>

            <button
              class="actionBtn delete"
              v-if="!schedule.isLocked && !isPastDay"
              @click="confirmDeleteSchedule"
            >
            Delete Schedule
            </button>
          </template>
          <p v-if="isPastDay && !schedule" class="pastDayNote">Cannot create schedule for past days</p>
        </div>
      </div>

      <div class="daySide">
        <div v-if="!selectedDate" class="placeholder">
          <p>Select a date on the calendar</p>
        </div>

        <div v-else-if="loadingSchedule" class="placeholder">
          <p>Loading...</p>
        </div>

        <div v-else-if="!schedule" class="placeholder">
          <p>No schedule for {{ formattedDate }}</p>
          <p class="hint" v-if="!isPastDay">Create a schedule to start adding trips</p>
          <p class="hint" v-else>Cannot create schedules for past days</p>
        </div>

        <div v-else class="dayDetail">
          <div class="dayHeader">
            <div class="dayTitle">
              <h3>{{ formattedDate }}</h3>
              <span class="lockBadge" v-if="schedule.isLocked">Locked</span>
              <span class="lockBadge past" v-else-if="isPastDay">Past day</span>
            </div>
            <button
              class="addTripBtn"
              v-if="!schedule.isLocked && !isPastDay"
              @click="openTripForm(null)"
            >
              + Add trip
            </button>
          </div>

          <div v-if="schedule.trips?.length === 0" class="emptyTrips">
            No trips scheduled for this day
          </div>

          <div v-else class="tripsList">
            <TripCard
              v-for="trip in sortedTrips"
              :key="trip.id"
              :trip="trip"
              :isLocked="schedule.isLocked || isPastDay"
              @edit="openTripForm"
              @delete="handleDeleteTrip"
              @cancel="handleCancelTrip"
              @complete="handleCompleteTrip"
            />
          </div>
        </div>
      </div>
    </div>

    <TripForm
      v-if="showTripForm"
      :trip="editingTrip"
      :selectedDate="selectedDate"
      @close="closeTripForm"
      @submit="handleTripSubmit"
    />

    <div class="modalOverlay" v-if="showDuplicateModal" @click.self="showDuplicateModal = false">
      <div class="duplicateModal">
        <h3>Duplicate Schedule</h3>
        <p>Copy trips from <strong>{{ formattedDate }}</strong> to:</p>
        <input type="date" v-model="duplicateTargetDate" :min="todayDateStr" />
        <div class="modalActions">
          <button class="cancelBtn" @click="showDuplicateModal = false">Cancel</button>
          <button class="submitBtn" @click="handleDuplicate" :disabled="!duplicateTargetDate || duplicateTargetDate < todayDateStr">
            Duplicate
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

const showTripForm = ref(false);
const editingTrip = ref(null);

const showDuplicateModal = ref(false);
const duplicateTargetDate = ref("");

const formattedDate = computed(() => {
  if (!selectedDate.value) return "";
  const d = new Date(selectedDate.value + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const isPastDay = computed(() => {
  if (!selectedDate.value) return false;
  const now = new Date();
  const todayMX = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const todayStr = `${todayMX.getFullYear()}-${String(todayMX.getMonth() + 1).padStart(2, "0")}-${String(todayMX.getDate()).padStart(2, "0")}`;
  return selectedDate.value < todayStr;
});

const todayDateStr = computed(() => {
  const now = new Date();
  const todayMX = new Date(now.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  return `${todayMX.getFullYear()}-${String(todayMX.getMonth() + 1).padStart(2, "0")}-${String(todayMX.getDate()).padStart(2, "0")}`;
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
    toast.success("Schedule created");
  } catch (err) {
    toast.error(err.message || "Error creating schedule");
  }
}

async function confirmDeleteSchedule() {
  const result = await Swal.fire({
    title: "Delete schedule?",
    text: "All trips for this day will be deleted",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      await deleteSchedule(selectedDate.value);
      schedule.value = null;
      calendarRef.value?.refresh();
      toast.success("Schedule deleted");
    } catch (err) {
      toast.error(err.message || "Error deleting");
    }
  }
}

async function toggleLock() {
  try {
    if (schedule.value.isLocked) {
      await unlockSchedule(selectedDate.value);
      toast.success("Schedule unlocked");
    } else {
      await lockSchedule(selectedDate.value);
      toast.success("Schedule locked");
    }
    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
  } catch (err) {
    toast.error(err.message || "Error changing lock status");
  }
}

async function handleDuplicate() {
  try {
    await duplicateSchedule(selectedDate.value, duplicateTargetDate.value);
    toast.success("Schedule duplicated");
    showDuplicateModal.value = false;
    duplicateTargetDate.value = "";
    calendarRef.value?.refresh();
  } catch (err) {
    toast.error(err.message || "Error duplicating");
  }
}

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
      toast.success("Trip updated");
    } else {
      await addTrip(selectedDate.value, tripData);
      toast.success("Trip added");
    }

    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
    closeTripForm();
  } catch (err) {
    toast.error(err.message || "Error saving trip");
  }
}

async function handleDeleteTrip(tripId) {
  try {
    await deleteTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    calendarRef.value?.refresh();
    toast.success("Trip deleted");
  } catch (err) {
    toast.error(err.message || "Error deleting trip");
  }
}

async function handleCancelTrip(tripId) {
  try {
    await cancelTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    toast.success("Trip canceled");
  } catch (err) {
    toast.error(err.message || "Error canceling trip");
  }
}

async function handleCompleteTrip(tripId) {
  try {
    await completeTrip(selectedDate.value, tripId);
    schedule.value = await getScheduleForDay(selectedDate.value);
    toast.success("Trip completed");
  } catch (err) {
    toast.error(err.message || "Error completing trip");
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
    
    &.past {
      background: rgba(108, 117, 125, 0.2);
      color: #6c757d;
    }
  }
}

.pastDayNote {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 600;
  text-align: center;
  margin: 8px 0 0;
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
