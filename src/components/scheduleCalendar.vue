<template>
  <div class="calendarWrapper">
    <div class="calendarHeader">
      <button class="navBtn" @click="prevMonth">&lt;</button>
      <h3 class="monthTitle">{{ monthName }} {{ year }}</h3>
      <button class="navBtn" @click="nextMonth">&gt;</button>
    </div>

    <div class="weekDays">
      <span v-for="day in weekDays" :key="day">{{ day }}</span>
    </div>

    <div class="calendarGrid">
      <div
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        class="dayCell"
        :class="{
          empty: !cell.day,
          today: cell.isToday,
          selected: cell.isSelected,
          hasSchedule: cell.hasSchedule,
          locked: cell.isLocked,
        }"
        @click="cell.day && selectDate(cell.date)"
      >
        <span class="dayNumber" v-if="cell.day">{{ cell.day }}</span>
        <span class="tripCount" v-if="cell.tripCount > 0">
          {{ cell.tripCount }} trips
        </span>
        <span class="lockIcon" v-if="cell.isLocked">🔒</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { getScheduleRange } from "@/services/scheduleApi";

const props = defineProps({
  selectedDate: { type: String, default: null },
});

const emit = defineEmits(["select"]);

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth());

const scheduleSummary = ref({}); 

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];


const monthName = computed(() => monthNames[month.value]);

const calendarCells = computed(() => {
  const firstDay = new Date(year.value, month.value, 1);
  const lastDay = new Date(year.value, month.value + 1, 0);
  const startPad = firstDay.getDay(); 
  const daysInMonth = lastDay.getDate();

  const cells = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ day: null });
  }


  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year.value, month.value, d);
    const dateStr = formatDate(date);
    const summary = scheduleSummary.value[dateStr];

    cells.push({
      day: d,
      date: dateStr,
      isToday: isSameDay(date, today),
      isSelected: dateStr === props.selectedDate,
      hasSchedule: !!summary,
      tripCount: summary?.tripCount || 0,
      isLocked: summary?.isLocked || false,
    });
  }

  return cells;
});

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11;
    year.value--;
  } else {
    month.value--;
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0;
    year.value++;
  } else {
    month.value++;
  }
}

function selectDate(dateStr) {
  emit("select", dateStr);
}

async function loadMonthSummary() {
  try {
    const from = new Date(year.value, month.value, 1);
    const to = new Date(year.value, month.value + 1, 0);

    const data = await getScheduleRange(formatDate(from), formatDate(to));

    const map = {};
    for (const item of data) {
      const dateKey = item.serviceDate?.split("T")[0] || item.date;
      map[dateKey] = {
        tripCount: item.tripCount ?? item.trips?.length ?? 0,
        isLocked: item.isLocked ?? false,
      };
    }
    scheduleSummary.value = map;
  } catch (err) {
    console.error("Error loading schedule summary:", err);
    scheduleSummary.value = {};
  }
}

watch([year, month], loadMonthSummary, { immediate: true });

defineExpose({ refresh: loadMonthSummary });
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

$cell-min-height: 45px; 
$calendar-width: 340px; 

.calendarWrapper {
  background: white;
  border-radius: 16px;
  padding: 16px; 
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  width: 100%; 
  max-width: $calendar-width; 
  margin: 0 auto; 
  box-sizing: border-box;
}

.calendarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  .monthTitle {
    margin: 0 8px;
    font-size: 1rem;
    font-weight: 900;
    color: $primaryColor;
    white-space: nowrap; 
  }
}

.navBtn {
  flex-shrink: 0; 
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba($primaryColor, 0.08);
  color: $primaryColor;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primaryColor, 0.15);
  }
}

.weekDays,
.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); 
  gap: 4px; 
  width: 100%;
}

.weekDays {
  margin-bottom: 8px;

  span {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba($primaryColor, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.dayCell {
  min-height: $cell-min-height; 
  height: auto; 
  
  width: 100%; 
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; 
  padding: 4px 2px; 
  
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  background: rgba($primaryColor, 0.02);
  box-sizing: border-box; 

  overflow: hidden; 

  &.empty {
    background: transparent;
    cursor: default;
    pointer-events: none; 
  }

  &:not(.empty):hover {
    background: rgba($secondaryColor, 0.15);
  }

  &.today {
    border: 2px solid $secondaryColor;
    padding: 2px 0; 
  }

  &.selected {
    background: $secondaryColor;
    box-shadow: 0 4px 10px rgba($secondaryColor, 0.3);

    .dayNumber,
    .tripCount {
      color: white;
    }
  }

  &.hasSchedule:not(.selected) {
    background: rgba($thirdColor, 0.4);
    border: 1px solid rgba($thirdColor, 0.6);
  }

  &.locked .lockIcon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.6rem;
  }
}

.dayNumber {
  font-weight: 800;
  font-size: 0.9rem;
  color: $primaryColor;
  line-height: 1.2;
  margin-bottom: 2px;
}

.tripCount {
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba($primaryColor, 0.7);
  line-height: 1.1;
  text-align: center;
  
  word-break: break-word; 
  width: 100%;
}

@media (max-width: 400px) {
  .calendarWrapper {
    max-width: 100%; 
    padding: 10px;
  }

  .dayCell {
    min-height: 40px; 
  }
  
  .tripCount {
    font-size: 0.55rem;
  }
}
</style>