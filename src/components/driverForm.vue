<template>
  <div class="driverFormCard">
    <h3>{{ isEditing ? "Edit driver" : "Register driver" }}</h3>

    <div class="formGrid">
      <div class="formFields">
        <label class="field">
          <span>Name</span>
          <input v-model="form.name" placeholder="Juan Pérez" @blur="touched.name = true" />
          <p v-if="nameError" class="fieldError">{{ nameError }}</p>
        </label>

        <label class="field">
          <span>License number</span>
          <input v-model="form.licenseNumber" placeholder="ABC1234567890" maxlength="18" @blur="touched.licenseNumber = true" />
          <p v-if="licenseError" class="fieldError">{{ licenseError }}</p>
        </label>

        <label class="field">
          <span>Birthdate</span>
          <input v-model="form.birdthDate" type="date" @blur="touched.birdthDate = true" />
          <p v-if="birthdateError" class="fieldError">{{ birthdateError }}</p>
        </label>

        <label class="field">
          <span>Address</span>
          <input
            v-model="form.address"
            placeholder="Street 123, Colonia, Ciudad"
            maxlength="200"
            @blur="touched.address = true"
          />
          <p v-if="addressError" class="fieldError">{{ addressError }}</p>
        </label>

        <label class="field">
          <span>Driver ID</span>
          <input
            v-model.number="form.id"
            type="number"
            placeholder="ID"
            disabled
            v-if="isEditing"
          />
          <input v-else type="number" placeholder="ID (auto)" disabled />
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="form.status" @blur="touched.status = true">
            <option value="">Select...</option>
            <option value="Activo">Active</option>
            <option value="Inactivo">Inactive</option>
            <option value="Licencia">License</option>
          </select>
          <p v-if="statusError" class="fieldError">{{ statusError }}</p>
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
  licenseNumber: "",
  birdthDate: "",
  address: "",
  status: "",
  id: null,
});

const photoFile = ref(null);
const photoPreview = ref(null);
const photoError = ref("");

const touched = ref({
  name: false,
  licenseNumber: false,
  birdthDate: false,
  address: false,
  status: false,
});

// Licencia Mexa
const licenseRegex = /^[A-Z0-9]{8,18}$/i;

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const calculateAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      form.value = {
        name: newData.name || "",
        licenseNumber: newData.licenseNumber || "",
        birdthDate: newData.birdthDate ? newData.birdthDate.split("T")[0] : "",
        address: newData.address || "",
        status: newData.status || "",
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

const licenseError = computed(() => {
  if (!touched.value.licenseNumber) return "";
  if (!form.value.licenseNumber) return "License number is required";
  if (!licenseRegex.test(form.value.licenseNumber)) return "License must be 8-18 alphanumeric characters";
  return "";
});

const birthdateError = computed(() => {
  if (!touched.value.birdthDate) return "";
  if (!form.value.birdthDate) return "Birthdate is required";
  
  const age = calculateAge(form.value.birdthDate);
  if (age === null) return "Invalid birthdate";
  if (age < 18) return "Driver must be at least 18 years old";
  if (age > 65) return "Driver cannot be older than 65 years";
  return "";
});

const addressError = computed(() => {
  if (!touched.value.address) return "";
  if (!form.value.address) return "Address is required";
  if (form.value.address.length > 200) return "Address cannot exceed 200 characters";
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
    form.value.licenseNumber &&
    form.value.birdthDate &&
    form.value.address &&
    form.value.status;
  
  const noErrors = 
    !nameError.value &&
    !licenseError.value &&
    !birthdateError.value &&
    !addressError.value &&
    !statusError.value &&
    !photoError.value;
  
  return hasRequiredFields && noErrors;
});

const touchAll = () => {
  touched.value.name = true;
  touched.value.licenseNumber = true;
  touched.value.birdthDate = true;
  touched.value.address = true;
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
  formData.append("licenseNumber", form.value.licenseNumber.toUpperCase());
  // Convert to ISO-8601 for Prisma
  const isoDate = new Date(form.value.birdthDate).toISOString();
  formData.append("birdthDate", isoDate);
  formData.append("address", form.value.address);
  formData.append("status", form.value.status);

  if (photoFile.value) {
    formData.append("photo", photoFile.value);
  }

  emit("save", formData);
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.driverFormCard {
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
  align-items: center;
}

.photoPreview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
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
    font-size: 56px;
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
