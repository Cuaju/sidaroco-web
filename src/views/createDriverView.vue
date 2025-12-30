<template>
  <section class="createDriverPage">
    <div class="pageHeader">
      <h2>Registrar nuevo conductor</h2>
      <button class="backBtn" @click="goBack">← Regresar</button>
    </div>

    <p class="subtitle">
      Ingresa los datos del conductor para registrarlo en el sistema
    </p>

    <div class="content">
      <DriverForm @save="saveDriver" />
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import DriverForm from "@/components/driverForm.vue";
import { createDriver } from "@/services/fleetApi";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();

const goBack = () => {
  router.back();
};

const saveDriver = async (formData) => {
  try {
    await createDriver(formData);
    toast.success("Conductor registrado correctamente");
    router.push("/drivers");
  } catch (err) {
    console.error("Error al guardar conductor:", err);
    toast.error(err.message || "Error al guardar el conductor");
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.createDriverPage {
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

.content {
  margin-top: 16px;
}
</style>
