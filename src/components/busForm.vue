<template>
  <div class="busFormCard">
    <h3>{{ isEditing ? "Edit bus" : "Register bus" }}</h3>

    <div class="formGrid">
      <div class="formFields">
        <label class="field">
          <span>Name</span>
          <input v-model="form.name" placeholder="Bus 01" @blur="touched.name = true" />
          <p v-if="nameError" class="fieldError">{{ nameError }}</p>
        </label>

        <label class="field">
          <span>Model</span>
          <input v-model="form.model" placeholder="Mercedes-Benz Sprinter" @blur="touched.model = true" />
          <p v-if="modelError" class="fieldError">{{ modelError }}</p>
        </label>

        <label class="field">
          <span>VIN</span>
          <input v-model="form.vin" placeholder="1HGBH41JXMN109186" maxlength="17" @blur="touched.vin = true" />
          <p v-if="vinError" class="fieldError">{{ vinError }}</p>
        </label>

        <label class="field">
          <span>Plate</span>
          <input v-model="form.plateNumber" placeholder="ABC-12-34" @blur="touched.plateNumber = true" />
          <p v-if="plateError" class="fieldError">{{ plateError }}</p>
        </label>

        <label class="field">
          <span>Bus ID</span>
          <input v-model.number="form.id" type="number" placeholder="ID" disabled v-if="isEditing" />
          <input v-else v-model.number="form.id" type="number" placeholder="ID (auto)" disabled />
        </label>

        <label class="field">
          <span>Capacity</span>
          <input v-model.number="form.capacity" type="number" placeholder="40" min="1" max="60"
            @blur="touched.capacity = true" />
          <p v-if="capacityError" class="fieldError">{{ capacityError }}</p>
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="form.status" @blur="touched.status = true">
            <option value="">Select...</option>
            <option value="Activo">Active</option>
            <option value="Inactivo">Inactive</option>
            <option value="Mantenimiento">Maintenance</option>
          </select>
          <p v-if="statusError" class="fieldError">{{ statusError }}</p>
        </label>

        <label class="field">
          <span>Route</span>
          <select v-model="form.routeId">
            <option :value="null">No route assigned</option>
            <option v-for="route in routes" :key="route.id" :value="route.id">
              {{ route.name }} ({{ route.origin.name }} → {{ route.destination.name }})
            </option>
          </select>
        </label>
      </div>

      <div class="photoSection">
        <div class="photoPreview">
          <img v-if="photoPreview" :src="photoPreview" alt="Preview" />
          <div v-else class="placeholder">Photo</div>
        </div>
        <label class="photoInput">
          <span>Select photo</span>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" @change="onPhotoChange" />
        </label>
        <p v-if="photoError" class="fieldError">{{ photoError }}</p>
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
import { ref, computed, watch, onMounted } from "vue";
import { compressImage } from "@/utils/imageCompressor";
import { getRoutes } from "@/services/routesApi";

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
const photoError = ref("");
const routes = ref([]);

onMounted(async () => {
  try {
    const data = await getRoutes();
    routes.value = data.routes || data || [];
  } catch (e) {
    console.error("Failed to load routes:", e);
  }
});

const touched = ref({
  name: false,
  model: false,
  vin: false,
  plateNumber: false,
  capacity: false,
  status: false,
});

// VIN is 17 alphanumeric characters without I, O, Q
const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

// Plaac mexa: ABC-12-34, ABC-123-A, 123-ABC, etc.
const plateRegex = /^[A-Z]{2,3}[-\s]?\d{2,3}[-\s]?[A-Z0-9]{1,3}$/i;

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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

const nameError = computed(() => {
  if (!touched.value.name) return "";
  if (!form.value.name) return "Name is required";
  return "";
});

const modelError = computed(() => {
  if (!touched.value.model) return "";
  if (!form.value.model) return "Model is required";
  return "";
});

const vinError = computed(() => {
  if (!touched.value.vin) return "";
  if (!form.value.vin) return "VIN is required";
  if (!vinRegex.test(form.value.vin)) return "VIN must be 17 alphanumeric characters (no I, O, Q)";
  return "";
});

const plateError = computed(() => {
  if (!touched.value.plateNumber) return "";
  if (!form.value.plateNumber) return "Plate number is required";
  if (!plateRegex.test(form.value.plateNumber)) return "Invalid Mexican plate format (e.g., ABC-12-34)";
  return "";
});

const capacityError = computed(() => {
  if (!touched.value.capacity) return "";
  if (!form.value.capacity) return "Capacity is required";
  if (form.value.capacity < 1) return "Capacity must be at least 1";
  if (form.value.capacity > 60) return "Capacity cannot exceed 60 passengers";
  return "";
});

const statusError = computed(() => {
  if (!touched.value.status) return "";
  if (!form.value.status) return "Status is required";
  return "";
});

const isValid = computed(() => {
  const hasRequiredFields =
    form.value.name &&
    form.value.model &&
    form.value.vin &&
    form.value.plateNumber &&
    form.value.capacity &&
    form.value.status;

  const noErrors =
    !nameError.value &&
    !modelError.value &&
    !vinError.value &&
    !plateError.value &&
    !capacityError.value &&
    !statusError.value &&
    !photoError.value;

  return hasRequiredFields && noErrors;
});

const touchAll = () => {
  touched.value.name = true;
  touched.value.model = true;
  touched.value.vin = true;
  touched.value.plateNumber = true;
  touched.value.capacity = true;
  touched.value.status = true;
};

const onPhotoChange = async (event) => {
  const file = event.target.files[0];
  photoError.value = "";

  if (file) {
    if (!allowedImageTypes.includes(file.type)) {
      photoError.value = "Only JPG, PNG, and WebP images are allowed";
      event.target.value = "";
      return;
    }

    const compressedFile = await compressImage(file);
    photoFile.value = compressedFile;
    photoPreview.value = URL.createObjectURL(compressedFile);
  }
};

const emitSave = () => {
  touchAll();
  if (!isValid.value) return;

  const formData = new FormData();
  formData.append("name", form.value.name);
  formData.append("model", form.value.model);
  formData.append("vin", form.value.vin.toUpperCase());
  formData.append("plateNumber", form.value.plateNumber.toUpperCase());
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

.fieldError {
  font-size: 0.85rem;
  font-weight: 700;
  color: #b00020;
  margin: 0;
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
