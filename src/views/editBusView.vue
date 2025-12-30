<template>
  <section class="editBusPage">
    <div class="pageHeader">
      <h2>Editar camión</h2>
      <button class="backBtn" @click="goBack">← Regresar</button>
    </div>

    <p class="subtitle">Modifica los datos del camión</p>

    <div v-if="loading" class="loading">Cargando datos...</div>
    <div v-else class="content">
      <BusForm :initialData="bus" :isEditing="true" @save="saveBus" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BusForm from "@/components/busForm.vue";
import { getBusById, updateBus } from "@/services/fleetApi";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const bus = ref({});
const loading = ref(true);

const goBack = () => {
  router.back();
};

onMounted(async () => {
  try {
    const id = parseInt(route.params.id);
    bus.value = await getBusById(id);
  } catch (err) {
    console.error("Error al cargar camión:", err);
    toast.error("Error al cargar los datos del camión");
    router.push("/buses");
  } finally {
    loading.value = false;
  }
});

const saveBus = async (formData) => {
  try {
    const id = parseInt(route.params.id);
    await updateBus(id, formData);
    toast.success("Camión actualizado correctamente");
    router.push("/buses");
  } catch (err) {
    console.error("Error al actualizar camión:", err);
    toast.error(err.message || "Error al actualizar el camión");
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.editBusPage {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 24px 0;
}

.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
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
  background: transparent;
  border: none;
  color: $primaryColor;
  font-weight: 900;
  cursor: pointer;
  padding: 6px 0;

  &:hover {
    text-decoration: underline;
  }
}

.loading {
  padding: 40px;
  text-align: center;
  color: rgba($primaryColor, 0.6);
  font-weight: 700;
}

.content {
  margin-top: 16px;
}
</style>
