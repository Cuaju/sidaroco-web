<template>
  <section class="driversPage">
    <h2>Conductores</h2>

    <div class="toolbar">
      <button class="addBtn" @click="goToCreateDriver">
        Registrar Conductor
      </button>

      <div class="filters">
        <input
          v-model="idSearch"
          type="text"
          class="idInput"
          placeholder="ID"
        />
        <input
          v-model="searchQuery"
          type="text"
          class="searchInput"
          placeholder="Buscar por nombre o licencia..."
        />
        <select v-model="statusFilter" class="filterSelect">
          <option value="">Todos los status</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Licencia">Licencia</option>
        </select>
      </div>
    </div>

    <div v-if="loading">Cargando conductores...</div>
    <div v-else-if="filteredDrivers.length === 0" class="empty">
      {{
        drivers.length === 0
          ? "No hay conductores registrados"
          : "No se encontraron resultados"
      }}
    </div>
    <div v-else class="driversList">
      <DriverCard
        v-for="driver in filteredDrivers"
        :key="driver.id"
        :driver="driver"
        @delete="removeDriver"
        @edit="goToEditDriver"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import DriverCard from "@/components/driverCard.vue";
import { getAllDrivers, deleteDriver } from "@/services/fleetApi";

const drivers = ref([]);
const loading = ref(true);
const router = useRouter();

const searchQuery = ref("");
const statusFilter = ref("");
const idSearch = ref("");

const filteredDrivers = computed(() => {
  let result = drivers.value;

  if (idSearch.value) {
    result = result.filter(
      (driver) => String(driver.id) === idSearch.value.trim()
    );
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (driver) =>
        driver.name?.toLowerCase().includes(q) ||
        driver.licenseNumber?.toLowerCase().includes(q)
    );
  }

  if (statusFilter.value) {
    result = result.filter((driver) => driver.status === statusFilter.value);
  }

  return result;
});

const removeDriver = async (id) => {
  try {
    await deleteDriver(id);
    drivers.value = drivers.value.filter((d) => d.id !== id);
  } catch (err) {
    console.error("Error eliminando conductor", err);
  }
};

const goToEditDriver = (id) => {
  router.push(`/drivers/${id}/edit`);
};

const goToCreateDriver = () => {
  router.push("/drivers/create");
};

onMounted(async () => {
  try {
    drivers.value = await getAllDrivers();
  } catch (err) {
    console.error("Error cargando conductores", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.driversPage {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 24px 0;
}

h2 {
  color: $primaryColor;
  font-weight: 900;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.addBtn {
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: $thirdColor;
  color: $primaryColor;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    filter: brightness(1.05);
  }
}

.filters {
  display: flex;
  flex: 1;
  gap: 12px;
  justify-content: flex-end;
}

.idInput {
  width: 70px;
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba($primaryColor, 0.2);
  background: $fourthColor;
  font-size: 14px;
  font-weight: 700;
  color: $primaryColor;
  text-align: center;
  outline: none;

  &::placeholder {
    color: rgba($primaryColor, 0.4);
  }

  &:focus {
    border-color: $secondaryColor;
    box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
  }
}

.searchInput {
  flex: 1;
  max-width: 280px;
  height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba($primaryColor, 0.2);
  background: $fourthColor;
  font-size: 14px;
  font-weight: 600;
  color: $primaryColor;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba($primaryColor, 0.4);
  }

  &:focus {
    border-color: $secondaryColor;
    box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
  }
}

.filterSelect {
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba($primaryColor, 0.2);
  background: $fourthColor;
  font-size: 14px;
  font-weight: 700;
  color: $primaryColor;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: $secondaryColor;
  }
}

.driversList {
  display: grid;
  gap: 12px;
}

.empty {
  padding: 40px;
  text-align: center;
  color: rgba($primaryColor, 0.6);
  font-weight: 700;
}
</style>
