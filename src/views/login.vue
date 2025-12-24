<script>
import { useAuthStore } from "../stores/authStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: "",

      touched: {
        email: false,
        password: false
      }
    };
  },

  computed: {
    emailError() {
      if (!this.touched.email) return "";
      if (!this.email.trim()) return "Email is required";
      if (!emailRegex.test(this.email.trim())) return "Enter a valid email";
      return "";
    },

    passwordError() {
      if (!this.touched.password) return "";
      if (!this.password) return "Password is required";
      if (this.password.length < 6) return "Min 6 characters";
      return "";
    },

    isFormValid() {
      const emailOk = this.email.trim() && emailRegex.test(this.email.trim());
      const passOk = this.password && this.password.length >= 6;
      return Boolean(emailOk && passOk);
    },

    canSubmit() {
      return this.isFormValid && !this.loading;
    }
  },

  methods: {
    touchAll() {
      this.touched.email = true;
      this.touched.password = true;
    },

    async onSubmit() {
      this.error = "";
      this.touchAll();
      if (!this.isFormValid) return;

      this.loading = true;

      try {
        const auth = useAuthStore();
        await auth.login(this.email.trim(), this.password);

        this.$router.push("/home");
      } catch (e) {
        this.error = e?.message || "Login failed";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div id="background">
    <div id="loginCard">
    <img id="logoImg" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />

    <h1>Login</h1>
        <form @submit.prevent="onSubmit">
        <label class="field">
        <span>Email</span>
        <input v-model.trim="email" type="email" placeholder="Ej. JuaPerez123@gmail.com" autocomplete="email" @blur="touched.email = true"/>
        <p v-if="emailError" class="fieldError">{{ emailError }}</p>
        </label>

        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="********" autocomplete="current-password" @blur="touched.password = true"/>
        <p v-if="passwordError" class="fieldError">{{ passwordError }}</p>
        </label>
        <p v-if="error" class="error">{{ error }}</p>

        <button id="loginBtn" type="submit" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
        </button>
        </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

#background {
  min-height: 100vh;          
  width: 100%;
  display: grid;              
  place-items: center;        
  padding: 24px;

  background: radial-gradient(
    circle at 30% 20%,
    $secondaryColor 0%,
    $primaryColor 55%,
    #001a18 100%
  );
}

#loginCard {
  width: min(420px, 92vw);
  padding: 28px;
  border-radius: 18px;

  background: $fourthColor; 
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);

  display: flex;
  flex-direction: column;
  gap: 14px;
}

#logoImg {
  width: 100%;
  max-width: 420px;
  height: auto;
  margin: 0 auto 6px;
  display: block;
}

h1 {
  margin: 0 0 4px;
  color: $secondaryColor;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.error {
  margin-top: 10px;
  color: #b00020;
  font-weight: 700;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  color: $thirdColor;
  font-weight: 700;
  opacity: 0.9;
}
.fieldError {
  font-size: 0.9rem;
  font-weight: 700;
  color: #b00020;
  margin: -4px 0 0;
  line-height: 1.1;
}

input {
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid $primaryColor;

  outline: none;
  background: $fourthColor;
}

input:focus {
  border-color: $thirdColor;
  box-shadow: 0 0 0 4px $thirdColor;
}

#loginBtn {
  margin-top: 10px;
  height: 44px;
  width: 100%;
  border: none;
  border-radius: 12px;

  background: $primaryColor;
  color: $fourthColor;
  font-weight: 800;
  letter-spacing: 0.5px;

  cursor: pointer;
  transition: transform 0.08s ease, opacity 0.2s ease, box-shadow 0.2s ease;
}

#loginBtn:hover {
  opacity: 0.95;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

#loginBtn:active {
  transform: translateY(1px);
}

#loginBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
