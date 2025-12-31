<template>
  <section class="busesPage">
    <h2>Buses</h2>

    <div class="toolbar">
      <button class="addBtn" @click="goToCreateBus">Register bus</button>

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
          placeholder="Search by name, license plate, VIN..."
        />
        <select v-model="statusFilter" class="filterSelect">
          <option value="">All statuses</option>
          <option value="Activo">Active</option>
          <option value="Inactivo">Inactive</option>
          <option value="Mantenimiento">Maintenance</option>
        </select>
      </div>
    </div>

    <div v-if="loading">Loading buses...</div>
    <div v-else-if="filteredBuses.length === 0" class="empty">
      {{
        buses.length === 0
          ? "No buses registered"
          : "No results found"
      }}
    </div>
    <div v-else class="busesList">
      <BusCard
        v-for="bus in filteredBuses"
        :key="bus.id"
        :bus="bus"
        @delete="removeBus"
        @edit="goToEditBus"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import BusCard from "@/components/busCard.vue";
import { getAllBuses, deleteBus } from "@/services/fleetApi";

const buses = ref([]);
const loading = ref(true);
const router = useRouter();

const searchQuery = ref("");
const statusFilter = ref("");
const idSearch = ref("");

const filteredBuses = computed(() => {
  let result = buses.value;

  if (idSearch.value) {
    result = result.filter((bus) => String(bus.id) === idSearch.value.trim());
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (bus) =>
        bus.name?.toLowerCase().includes(q) ||
        bus.plateNumber?.toLowerCase().includes(q) ||
        bus.vin?.toLowerCase().includes(q) ||
        bus.model?.toLowerCase().includes(q)
    );
  }

  if (statusFilter.value) {
    result = result.filter((bus) => bus.status === statusFilter.value);
  }

  return result;
});

const removeBus = async (id) => {
  try {
    await deleteBus(id);
    buses.value = buses.value.filter((b) => b.id !== id);
  } catch (err) {
    console.error("Error eliminando camión", err);
  }
};

const goToEditBus = (id) => {
  router.push(`/buses/${id}/edit`);
};

const goToCreateBus = () => {
  router.push("/buses/create");
};

onMounted(async () => {
  try {
    buses.value = await getAllBuses();
  } catch (err) {
    console.error("Error cargando camiones", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.busesPage {
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
  max-width: 320px;
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

.busesList {
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
