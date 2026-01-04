<template>
  <div class="tripCard" :class="{ canceled: trip.status === 'canceled', completed: trip.status === 'completed' }">
    <div class="tripMain">
      <div class="tripTime">
        {{ formatTime(trip.departureTime) }}
      </div>

      <div class="tripInfo">
        <div class="tripRoute">
          <span class="label">Ruta</span>
          <span class="value">{{ trip.routeId }}</span>
        </div>
        <div class="tripBus">
          <span class="label">Camión</span>
          <span class="value">{{ trip.busId }}</span>
        </div>
        <div class="tripDriver">
          <span class="label">Conductor</span>
          <span class="value">{{ trip.driverId }}</span>
        </div>
      </div>

      <div class="tripStatus">
        <span class="statusBadge" :class="trip.status">
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <div class="tripActions" v-if="!isLocked">
      <template v-if="trip.status === 'scheduled'">
        <button class="actionBtn complete" @click="$emit('complete', trip.id)" title="Completar">
          ✓
        </button>
        <button class="actionBtn cancel" @click="$emit('cancel', trip.id)" title="Cancelar">
          ✕
        </button>
        <button class="actionBtn edit" @click="$emit('edit', trip)" title="Editar">
          ✎
        </button>
        <button class="actionBtn delete" @click="confirmDelete" title="Eliminar">
          🗑
        </button>
      </template>
      <template v-else>
        <span class="finalized">Finalizado</span>
      </template>
    </div>
    <div class="tripActions" v-else>
      <span class="lockedLabel">Bloqueado</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Swal from "sweetalert2";

const props = defineProps({
  trip: { type: Object, required: true },
  isLocked: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete", "cancel", "complete"]);

const statusLabel = computed(() => {
  const map = {
    scheduled: "Programado",
    canceled: "Cancelado",
    completed: "Completado",
  };
  return map[props.trip.status] || props.trip.status;
});

function formatTime(dateStr) {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

async function confirmDelete() {
  const result = await Swal.fire({
    title: "¿Eliminar viaje?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    emit("delete", props.trip.id);
  }
}
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.tripCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid $secondaryColor;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.canceled {
    border-left-color: #dc3545;
    opacity: 0.7;
  }

  &.completed {
    border-left-color: #28a745;
  }
}

.tripMain {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.tripTime {
  font-size: 1.4rem;
  font-weight: 900;
  color: $primaryColor;
  min-width: 70px;
}

.tripInfo {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.tripRoute,
.tripBus,
.tripDriver {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba($primaryColor, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 700;
    color: $primaryColor;
  }
}

.tripStatus {
  margin-left: auto;
}

.statusBadge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;

  &.scheduled {
    background: rgba($secondaryColor, 0.15);
    color: $secondaryColor;
  }

  &.canceled {
    background: rgba(220, 53, 69, 0.15);
    color: #dc3545;
  }

  &.completed {
    background: rgba(40, 167, 69, 0.15);
    color: #28a745;
  }
}

.tripActions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.actionBtn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &.complete {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;

    &:hover {
      background: #28a745;
      color: white;
    }
  }

  &.cancel {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;

    &:hover {
      background: #dc3545;
      color: white;
    }
  }

  &.edit {
    background: rgba($secondaryColor, 0.1);
    color: $secondaryColor;

    &:hover {
      background: $secondaryColor;
      color: white;
    }
  }

  &.delete {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;

    &:hover {
      background: #6c757d;
      color: white;
    }
  }
}

.finalized,
.lockedLabel {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba($primaryColor, 0.4);
  font-style: italic;
}

@media (max-width: 640px) {
  .tripCard {
    flex-direction: column;
    align-items: flex-start;
  }

  .tripMain {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tripInfo {
    gap: 16px;
  }

  .tripStatus {
    margin-left: 0;
  }

  .tripActions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid rgba($primaryColor, 0.1);
  }
}
</style>