<template>
  <article class="driverCard" :class="{ expanded }" @click="toggleExpand">
    <div v-if="!expanded" class="collapsedRow">
      <span class="cell id">#{{ driver.id }}</span>
      <span class="cell name">{{ driver.name }}</span>
      <span class="cell">{{ driver.licenseNumber }}</span>
      <span class="cell statusBadge" :class="driver.status?.toLowerCase()">
        {{ driver.status }}
      </span>
      <span class="cell expandIcon">▼</span>
    </div>

    <template v-else>
      <div class="photoContainer">
        <img
          v-if="driver.photoKey"
          :src="driver.photoKey"
          alt="Foto del conductor"
          class="photo"
        />
        <div v-else class="noPhoto">Foto</div>
      </div>

      <div class="cardBody">
        <div class="header">
          <div class="titleRow">
            <span class="name">{{ driver.name }}</span>
            <span class="id">#{{ driver.id }}</span>
          </div>
          <div class="headerRight">
            <div class="statusBadge" :class="driver.status?.toLowerCase()">
              {{ driver.status }}
            </div>
            <span class="collapseIcon">▲</span>
          </div>
        </div>

        <div class="details">
          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Licencia</span>
              <span class="value">{{ driver.licenseNumber }}</span>
            </div>
          </div>
          <div class="detailItem">
            <div class="detailContent">
              <span class="label">Fecha de nacimiento</span>
              <span class="value">{{ formatDate(driver.birthDate) }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="editBtn" @click.stop="onEdit">Editar</button>
          <button class="deleteBtn" @click.stop="onDelete">Eliminar</button>
        </div>
      </div>
    </template>
  </article>
</template>

<script>
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

export default {
  name: "DriverCard",

  props: {
    driver: {
      type: Object,
      required: true,
    },
  },

  emits: ["delete", "edit"],

  data() {
    return {
      expanded: false,
    };
  },

  setup() {
    const toast = useToast();
    return { toast };
  },

  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    onDelete() {
      Swal.fire({
        title: "Delete driver?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e53935",
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, delete",
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit("delete", this.driver.id);
          this.toast.success("Driver deleted");
        }
      });
    },
    onEdit() {
      this.$emit("edit", this.driver.id);
    },
  },
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.driverCard {
  border-radius: 12px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba($secondaryColor, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &.expanded {
    display: flex;
    cursor: default;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    &:hover {
      transform: none;
    }
  }
}

/* COLLAPSED ROW */
.collapsedRow {
  display: grid;
  grid-template-columns: 60px 1.5fr 1fr 100px 40px;
  align-items: center;
  padding: 14px 20px;
  gap: 16px;
}

.cell {
  font-size: 14px;
  font-weight: 600;
  color: $primaryColor;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.id {
    font-weight: 700;
    color: rgba($primaryColor, 0.5);
  }

  &.name {
    font-weight: 800;
  }
}

.expandIcon,
.collapseIcon {
  font-size: 12px;
  color: rgba($primaryColor, 0.4);
  transition: transform 0.2s ease;
}

.collapseIcon {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: rgba($primaryColor, 0.1);
  }
}

/* EXPANDED CARD */
.photoContainer {
  width: 140px;
  min-height: 180px;
  background: linear-gradient(
    135deg,
    rgba($primaryColor, 0.1),
    rgba($secondaryColor, 0.1)
  );
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.noPhoto {
  font-size: 14px;
  font-weight: 700;
  color: rgba($primaryColor, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cardBody {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 12px;
}

.titleRow {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cardBody .name {
  font-size: 20px;
  font-weight: 900;
  color: $primaryColor;
}

.cardBody .id {
  font-size: 13px;
  font-weight: 700;
  color: rgba($primaryColor, 0.5);
}

.statusBadge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.activo,
  &.active {
    background: rgba($secondaryColor, 0.15);
    color: $secondaryColor;
  }

  &.inactivo,
  &.inactive {
    background: rgba(#e53935, 0.12);
    color: #e53935;
  }

  &.licencia,
  &.vacation {
    background: rgba($thirdColor, 0.25);
    color: darken($thirdColor, 25%);
  }
}

.details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detailItem {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detailContent {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: rgba($primaryColor, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.value {
  font-size: 14px;
  font-weight: 700;
  color: $primaryColor;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba($primaryColor, 0.08);
}

.editBtn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba($secondaryColor, 0.35);
  }
}

.deleteBtn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px solid #e53935;
  background: transparent;
  color: #e53935;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e53935;
    color: white;
  }
}
</style>
