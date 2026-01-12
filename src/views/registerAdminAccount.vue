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
    emailValid() {
      const e = this.email.trim();
      if (!e) return null;
      const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      if (!basic) return false;
      return e.toLowerCase().endsWith('@sidaroco.com');
    },
    usernameValid() {
      const u = this.username.trim();
      if (!u) return null;
      return u.length >= 3;
    },
    passwordValid() {
      if (!this.password) return null;
      return this.password.length >= 6;
    },
    passwordsMatch() {
      if (!this.verifyPassword) return null;
      return this.password === this.verifyPassword;
    },
    fullNameValid() {
      const f = this.fullName.trim();
      if (!f) return null;
      return f.length > 0;
    },
    canSubmit() {
      return this.emailValid === true &&
        this.usernameValid === true &&
        this.passwordValid === true &&
        this.passwordsMatch === true &&
        this.fullNameValid === true &&
        !this.loading;
    }
  },
  methods: {
    async onSubmit() {
      this.error = "";
      if (!this.email.toLowerCase().endsWith('@sidaroco.com')) {
        this.error = "Email must be a @sidaroco.com domain";
        return;
      }
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
          <input v-model.trim="username" type="text" autocomplete="username"
            :class="{ invalid: usernameValid === false, valid: usernameValid === true }" />
          <small v-if="usernameValid === false" class="validation-msg">Username must be at least 3 characters</small>
        </label>

        <label class="field">
          <span>Email</span>
          <input v-model.trim="email" type="email" autocomplete="email"
            :class="{ invalid: emailValid === false, valid: emailValid === true }" />
          <small v-if="emailValid === false" class="validation-msg">Email must be a valid @sidaroco.com address</small>
        </label>

        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" autocomplete="new-password"
            :class="{ invalid: passwordValid === false, valid: passwordValid === true }" />
          <small v-if="passwordValid === false" class="validation-msg">Password must be at least 6 characters</small>
        </label>

        <label class="field">
          <span>Verify password</span>
          <input v-model="verifyPassword" type="password" autocomplete="new-password"
            :class="{ invalid: passwordsMatch === false, valid: passwordsMatch === true }" />
          <small v-if="passwordsMatch === false" class="validation-msg">Passwords do not match</small>
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
          <input v-model.trim="fullName" type="text" autocomplete="name"
            :class="{ invalid: fullNameValid === false, valid: fullNameValid === true }" />
          <small v-if="fullNameValid === false" class="validation-msg">Full name is required</small>
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
  box-shadow: 0 18px 60px rgba(0, 0, 0, .35);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h1 {
  margin: 0;
}

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
  transition: border-color 0.2s;
}

input.valid {
  border-color: #1fbf6b;
}

input.invalid {
  border-color: #ff6b6b;
}

.validation-msg {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: -4px;
  font-weight: 600;
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

.radio span {
  font-weight: 700;
}

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

.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.error {
  color: #b00020;
  font-weight: 700;
}

.muted {
  opacity: .8;
}

@media (max-width: 860px) {
  #grid {
    grid-template-columns: 1fr;
  }
}
</style>
