<template>
  <div class="routeFormCard">
    <h3>Please enter the details</h3>

    <div class="inputs">
      <label class="field">
        <span>Route name</span>
        <input v-model="routeName" placeholder="Route" />
      </label>

      <label class="field">
        <span>Origin</span>
        <input v-model="originText" placeholder="CDMX" />
      </label>

      <label class="field">
        <span>Destination</span>
        <input v-model="destinationText" placeholder="Toluca" />
      </label>
    </div>
    <div class="actions">
      <button
        class="traceBtn"
        :disabled="!originText || !destinationText"
        @click="emitTrace"
      >
      Draw route
      </button>

      <button
        class="saveBtn"
        :disabled="!isTraced || !routeName"
        @click="emitSave"
      >
        Save route
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  isTraced: {
    type: Boolean,
    default: false,
  },
});

const routeName = ref("");
const originText = ref("");
const destinationText = ref("");

const emit = defineEmits(["save", "trace"]);

const emitSave = () => {
  emit("save", {
    name: routeName.value,
    originText: originText.value,
    destinationText: destinationText.value,
  });
};

const emitTrace = () => {
  emit("trace", {
    originText: originText.value,
    destinationText: destinationText.value,
  });
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.routeFormCard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba($fourthColor, 0.95);
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;

  h3 {
    margin: 0 0 16px;
    color: $primaryColor;
    font-weight: 1000;
    font-size: clamp(22px, 2.5vw, 28px);
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      span {
        font-weight: 900;
        color: $primaryColor;
      }

      input {
        height: 44px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid rgba($primaryColor, 0.35);
        background: $fourthColor;
        outline: none;
        transition: all 0.2s ease;
      }

      input:focus {
        border-color: $thirdColor;
        box-shadow: 0 0 0 4px rgba($thirdColor, 0.25);
      }
    }
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .traceBtn {
    flex: 1;
    height: 48px;
    border-radius: 14px;
    border: 2px dashed $thirdColor;
    background: transparent;
    font-weight: 900;
    cursor: pointer;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .saveBtn {
    flex: 1;
    height: 48px;
    border: none;
    border-radius: 14px;
    background: $thirdColor;
    color: $primaryColor;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }
  }
}
</style>
