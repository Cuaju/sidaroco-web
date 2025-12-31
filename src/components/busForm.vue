<template>
  <div class="busFormCard">
    <h3>{{ isEditing ? "Edit bus" : "Register bus" }}</h3>

    <div class="formGrid">
      <div class="formFields">
        <label class="field">
          <span>Name</span>
          <input v-model="form.name" placeholder="Bus 01" />
        </label>

        <label class="field">
          <span>Model</span>
          <input v-model="form.model" placeholder="Mercedes-Benz Sprinter" />
        </label>

        <label class="field">
          <span>VIN</span>
          <input v-model="form.vin" placeholder="1HGBH41JXMN109186" />
        </label>

        <label class="field">
          <span>plate</span>
          <input v-model="form.plateNumber" placeholder="ABC-123" />
        </label>

        <label class="field">
          <span>Bus ID</span>
          <input
            v-model.number="form.id"
            type="number"
            placeholder="ID"
            disabled
            v-if="isEditing"
          />
          <input
            v-else
            v-model.number="form.id"
            type="number"
            placeholder="ID (auto)"
            disabled
          />
        </label>

        <label class="field">
          <span>Capacity</span>
          <input
            v-model.number="form.capacity"
            type="number"
            placeholder="40"
          />
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="form.status">
            <option value="">Select...</option>
            <option value="Activo">Active</option>
            <option value="Inactivo">Inactive</option>
            <option value="Mantenimiento">Maintenance</option>
          </select>
        </label>

        <label class="field">
          <span>Route (ID)</span>
          <input
            v-model.number="form.routeId"
            type="number"
            placeholder="Route ID (optional)"
          />
        </label>
      </div>

      <div class="photoSection">
        <div class="photoPreview">
          <img v-if="photoPreview" :src="photoPreview" alt="Preview" />
          <div v-else class="placeholder">Photo</div>
        </div>
        <label class="photoInput">
          <span>Select photo</span>
          <input type="file" accept="image/*" @change="onPhotoChange" />
        </label>
      </div>
    </div>

    <div class="actions">
      <button class="saveBtn" :disabled="!isValid" @click="emitSave">
        {{ isEditing ? "Save changes" : "Save" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { compressImage } from "@/utils/imageCompressor";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save"]);

const form = ref({
  name: "",
  model: "",
  vin: "",
  plateNumber: "",
  capacity: null,
  status: "",
  routeId: null,
  id: null,
});

const photoFile = ref(null);
const photoPreview = ref(null);

watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      form.value = {
        name: newData.name || "",
        model: newData.model || "",
        vin: newData.vin || "",
        plateNumber: newData.plateNumber || "",
        capacity: newData.capacity || null,
        status: newData.status || "",
        routeId: newData.routeId || null,
        id: newData.id || null,
      };
      // photoKey is a URL from S3 in GET responses
      if (newData.photoKey) {
        photoPreview.value = newData.photoKey;
      }
    }
  },
  { immediate: true }
);

const isValid = computed(() => {
  return (
    form.value.name &&
    form.value.model &&
    form.value.vin &&
    form.value.plateNumber &&
    form.value.capacity &&
    form.value.status
  );
});

const onPhotoChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const compressedFile = await compressImage(file);
    photoFile.value = compressedFile;
    photoPreview.value = URL.createObjectURL(compressedFile);
  }
};

const emitSave = () => {
  const formData = new FormData();
  formData.append("name", form.value.name);
  formData.append("model", form.value.model);
  formData.append("vin", form.value.vin);
  formData.append("plateNumber", form.value.plateNumber);
  formData.append("capacity", String(form.value.capacity));
  formData.append("status", form.value.status);

  if (form.value.routeId) {
    formData.append("routeId", String(form.value.routeId));
  }

  if (photoFile.value) {
    formData.append("photo", photoFile.value);
  }

  emit("save", formData);
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.busFormCard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba($fourthColor, 0.95);
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
  width: 100%;

  h3 {
    margin: 0 0 8px;
    color: $primaryColor;
    font-weight: 1000;
    font-size: clamp(22px, 2.5vw, 28px);
  }
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 24px;
}

.formFields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-weight: 900;
    color: $primaryColor;
    font-size: 14px;
  }

  input,
  select {
    height: 44px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba($primaryColor, 0.35);
    background: $fourthColor;
    outline: none;
    transition: all 0.2s ease;
    font-size: 14px;

    &:focus {
      border-color: $thirdColor;
      box-shadow: 0 0 0 4px rgba($thirdColor, 0.25);
    }

    &:disabled {
      background: rgba($primaryColor, 0.1);
      cursor: not-allowed;
    }
  }

  select {
    cursor: pointer;
  }
}

.photoSection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photoPreview {
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba($primaryColor, 0.1);
  display: grid;
  place-items: center;
  border: 2px dashed rgba($primaryColor, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 48px;
    opacity: 0.5;
  }
}

.photoInput {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  span {
    padding: 10px 16px;
    background: rgba($primaryColor, 0.1);
    border-radius: 10px;
    font-weight: 800;
    color: $primaryColor;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: rgba($primaryColor, 0.2);
    }
  }

  input {
    display: none;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.saveBtn {
  padding: 14px 28px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, $primaryColor, $secondaryColor);
  color: white;
  font-weight: 900;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
