<script>
import { createProfile } from "../services/usersApi";

export default {
  data() {
    return {
      accountId: this.$route.query.accountId || "",
      fullName: "",
      phoneNumber: "",
      loading: false,
      error: ""
    };
  },
  computed: {
    canSubmit() {
      return this.accountId && this.fullName.trim().length > 0 && !this.loading;
    }
  },
  methods: {
    async onSubmit() {
      this.error = "";
      this.loading = true;
      try {
        await createProfile({
          accountId: this.accountId,
          fullName: this.fullName,
          phoneNumber: this.phoneNumber || undefined
        });
        this.$router.push({ name: "login" });
      } catch (e) {
        this.error = e.message || "profile failed";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div id="background">
    <div id="card">
      <h1>Create profile</h1>

      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>Full name</span>
          <input v-model.trim="fullName" type="text" />
        </label>

        <label class="field">
          <span>Phone (optional)</span>
          <input v-model.trim="phoneNumber" type="tel" />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn" type="submit" :disabled="!canSubmit">
          {{ loading ? "Saving..." : "Finish" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;


#background{ 
    min-height:100vh; 
    display:grid; 
    place-items:center; 
    padding:24px;
    background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
}

#card{ 
    width:min(460px,92vw); 
    padding:28px; border-radius:18px; 
    background:$fourthColor; box-shadow:0 18px 60px rgba(0,0,0,.35); 
    display:flex; 
    flex-direction:column; 
    gap:14px;
}

.field{ 
    display:flex; 
    flex-direction:column; 
    gap:8px;
}

.field span{ 
    color:$thirdColor; 
    font-weight:700;
}

input{ 
    height:42px; 
    padding:0 12px; 
    border-radius:10px; 
    border:1px solid $primaryColor; 
    background:$fourthColor; 
    outline:none;
}

.btn{ 
    width:100%; 
    height:44px; 
    border:none; 
    border-radius:12px; 
    background:$primaryColor; 
    color:$fourthColor; 
    font-weight:800; 
    cursor:pointer; 
}

.btn:disabled{
    opacity:.6; 
    cursor:not-allowed;
}

.error{ 
    color:#b00020; 
    font-weight:700;
}

</style>
