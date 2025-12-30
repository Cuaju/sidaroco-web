<template>
  <section class="editDriverPage">
    <div class="pageHeader">
      <h2>Editar conductor</h2>
      <button class="backBtn" @click="goBack">← Regresar</button>
    </div>

    <p class="subtitle">Modifica los datos del conductor</p>

    <div v-if="loading" class="loading">Cargando datos...</div>
    <div v-else class="content">
      <DriverForm :initialData="driver" :isEditing="true" @save="saveDriver" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import DriverForm from "@/components/driverForm.vue";
import { getDriverById, updateDriver } from "@/services/fleetApi";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const driver = ref({});
const loading = ref(true);

const goBack = () => {
  router.back();
};

onMounted(async () => {
  try {
    const id = parseInt(route.params.id);
    driver.value = await getDriverById(id);
  } catch (err) {
    console.error("Error al cargar conductor:", err);
    toast.error("Error al cargar los datos del conductor");
    router.push("/drivers");
  } finally {
    loading.value = false;
  }
});

const saveDriver = async (formData) => {
  try {
    const id = parseInt(route.params.id);
    await updateDriver(id, formData);
    toast.success("Conductor actualizado correctamente");
    router.push("/drivers");
  } catch (err) {
    console.error("Error al actualizar conductor:", err);
    toast.error(err.message || "Error al actualizar el conductor");
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.editDriverPage {
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
