<template>
  <div class="routeFormCard">
    <h3>Please enter the details</h3>

    <div class="inputs">
      <label class="field">
        <span>Route name</span>
        <input v-model="routeName" placeholder="Route" />
      </label>

      <label class="field">
        <span>Ticket price</span>
        <input
          type="number"
          min="0"
          step="0.01"
          v-model.number="ticketPrice"
          placeholder="250.00"
        />
      </label>

      <label class="field">
        <span>Origin</span>
        <input v-model="originText" placeholder="CDMX" />
      </label>

      <label class="field">
        <span>Destination</span>
        <input v-model="destinationText" placeholder="Toluca" />
      </label>
      <label class="field">
        <span>Route image</span>
        <input type="file" accept="image/*" @change="onFileChange" />

        <div v-if="preview" class="imagePreview">
          <img :src="preview" alt="Route preview" />
        </div>
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
import { compressImage } from "@/utils/imageCompressor";
import { useToast } from "vue-toastification";
defineProps({
  isTraced: Boolean,
});

const routeName = ref("");
const originText = ref("");
const destinationText = ref("");
const ticketPrice = ref(0);
const featured = ref(false);
const photo = ref(null);
const preview = ref(null);
const toast = useToast();
const emit = defineEmits(["save", "trace"]);

const onFileChange = async (e) => {
  const file = e.target.files[0] || null;

  if (!file) {
    photo.value = null;
    preview.value = null;
    return;
  }
  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed");
    e.target.value = "";
    return;
  }
  const MAX_SIZE = 5 * 1024 * 1024; 
  if (file.size > MAX_SIZE) {
    toast.warning("Only image files are allowed");
    e.target.value = "";
    return;
  }
  const compressedFile = await compressImage(file);

  photo.value = compressedFile;
  preview.value = URL.createObjectURL(compressedFile);
};


const emitSave = () => {
  emit("save", {
    name: routeName.value,
    originText: originText.value,
    destinationText: destinationText.value,
    ticketPrice: ticketPrice.value,
    featured: featured.value,
    photo: photo.value,
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

      input[type="file"] {
        height: auto;
        padding: 10px;
        border: 1px dashed rgba($primaryColor, 0.45);
        cursor: pointer;

        &::file-selector-button {
          margin-right: 12px;
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          background: $thirdColor;
          color: $primaryColor;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        &::file-selector-button:hover {
          filter: brightness(0.95);
        }
      }
    }

    .imagePreview {
      margin-top: 10px;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid rgba($primaryColor, 0.25);

      img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        display: block;
      }
    }

    .field.checkbox {
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid rgba($primaryColor, 0.35);
      background: rgba($fourthColor, 0.85);

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: $thirdColor;
        cursor: pointer;
      }

      span {
        font-weight: 900;
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
