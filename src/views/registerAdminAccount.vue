<script>
import FinanceManagerLayout from "../layouts/financeManagerLayout.vue";
import { createAdminAccount } from "../services/usersApi";

export default {
  components: { FinanceManagerLayout },
  data() {
    return {
      email: "",
      username: "",
      password: "",
      verifyPassword: "",
      userType: "RouteManager", // default
      fullName: "",
      phoneNumber: "",
      loading: false,
      error: ""
    };
  },
  computed: {
    canSubmit() {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
      const userOk = this.username.trim().length >= 3;
      const passOk = this.password.length >= 6;
      const match = this.password === this.verifyPassword;
      const nameOk = this.fullName.trim().length > 0;
      return emailOk && userOk && passOk && match && nameOk && !this.loading;
    }
  },
  methods: {
    async onSubmit() {
      this.error = "";
      this.loading = true;
      try {
        await createAdminAccount({
          email: this.email,
          username: this.username.trim(),
          password: this.password,
          userType: this.userType,
          fullName: this.fullName.trim(),
          phoneNumber: this.phoneNumber?.trim() || undefined
        });

        this.$router.push({ path: "/finance/adminAccounts" });
      } catch (e) {
        this.error = e.message || "register failed";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
    <div id="background">
      <form id="grid" @submit.prevent="onSubmit">
        <div class="card">
          <h1>Create Admin Account</h1>

          <label class="field">
            <span>Username</span>
            <input v-model.trim="username" type="text" autocomplete="username" />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model.trim="email" type="email" autocomplete="email" />
          </label>

          <label class="field">
            <span>Password</span>
            <input v-model="password" type="password" autocomplete="new-password" />
          </label>

          <label class="field">
            <span>Verify password</span>
            <input v-model="verifyPassword" type="password" autocomplete="new-password" />
          </label>

          <div class="radios">
            <p class="label">Admin type</p>

            <label class="radio">
              <input type="radio" name="adminType" value="FinanceManager" v-model="userType" />
              <span>Finance Manager</span>
            </label>

            <label class="radio">
              <input type="radio" name="adminType" value="RouteManager" v-model="userType" />
              <span>Route Manager</span>
            </label>

            <label class="radio">
              <input type="radio" name="adminType" value="Cashier" v-model="userType" />
              <span>Cashier</span>
            </label>
          </div>
        </div>

        <div class="card">
          <h1>Create profile</h1>

          <label class="field">
            <span>Full Name</span>
            <input v-model.trim="fullName" type="text" autocomplete="name" />
          </label>

          <label class="field">
            <span>Cellphone</span>
            <input v-model.trim="phoneNumber" type="tel" autocomplete="tel" />
          </label>

          <p class="muted">This profile will be linked to the new account.</p>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn" type="submit" :disabled="!canSubmit">
            {{ loading ? "Registering..." : "Register" }}
          </button>
        </div>
      </form>
    </div>
  </template>
<style scoped lang="scss">
@use "../styles/colors.scss" as *;

#background {
  min-height: 100vh;
  padding: 24px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
  display: grid;
  place-items: center;
}

#grid {
  width: min(980px, 96vw);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.card {
  padding: 28px;
  border-radius: 18px;
  background: $fourthColor;
  box-shadow: 0 18px 60px rgba(0,0,0,.35);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h1 { margin: 0; }

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field span {
  color: $thirdColor;
  font-weight: 700;
}

input {
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid $primaryColor;
  background: $fourthColor;
  outline: none;
}

.radios {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  margin: 0;
  color: $thirdColor;
  font-weight: 800;
}

.radio {
  display: flex;
  align-items: center;
  gap: 10px;
}
.radio span { font-weight: 700; }

.btn {
  margin-top: 6px;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: $secondaryColor;
  color: $fourthColor;
  font-weight: 800;
  cursor: pointer;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }

.error { color: #b00020; font-weight: 700; }
.muted { opacity: .8; }

@media (max-width: 860px) {
  #grid { grid-template-columns: 1fr; }
}
</style>
