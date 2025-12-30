<template>
  <section class="createBusPage">
    <div class="pageHeader">
      <h2>Registrar nuevo camión</h2>
      <button class="backBtn" @click="goBack">← Regresar</button>
    </div>

    <p class="subtitle">
      Ingresa los datos del camión para registrarlo en el sistema
    </p>

    <div class="content">
      <BusForm @save="saveBus" />
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import BusForm from "@/components/busForm.vue";
import { createBus } from "@/services/fleetApi";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter();

const goBack = () => {
  router.back();
};

const saveBus = async (formData) => {
  try {
    await createBus(formData);
    toast.success("Camión registrado correctamente");
    router.push("/buses");
  } catch (err) {
    console.error("Error al guardar camión:", err);
    toast.error(err.message || "Error al guardar el camión");
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.createBusPage {
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
