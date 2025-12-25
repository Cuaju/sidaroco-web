<script>
import { requestRegisterCode } from "../services/usersApi";

export default {
  data() {
    return { email:"", username:"", password:"", verifyPassword:"", loading:false, error:"" };
  },
  computed: {
    canSubmit() {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
      const userOk = this.username.trim().length >= 3;
      const passOk = this.password.length >= 6;
      const match = this.password === this.verifyPassword;
      return emailOk && userOk && passOk && match && !this.loading;
    }
  },
  methods: {
    async onSubmit() {
      this.error = "";
      this.loading = true;
      try {
        await requestRegisterCode({
          email: this.email,
          username: this.username,
          password: this.password,
          verifyPassword: this.verifyPassword
        });
this.$router.push({ name: "verifyEmail", query: { email: this.email } })      } catch (e) {
        this.error = e.message || "request failed";
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
      <h1>Create account</h1>

      <form @submit.prevent="onSubmit">
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

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn" type="submit" :disabled="!canSubmit">
          {{ loading ? "Sending code..." : "Continue" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

#background{ min-height:100vh; 
    display:grid; place-items:center; 
    padding:24px;
    background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
}

#card{ 
    width:min(460px,92vw); 
    padding:28px; border-radius:18px; background:$fourthColor; box-shadow:0 18px 60px rgba(0,0,0,.35); 
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
    border-radius:10px; border:1px solid $primaryColor; 
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
    font-weight:800; cursor:pointer; 
}

.btn:disabled{ 
    opacity:.6; cursor:not-allowed;
}

.error{ 
    color:#b00020; 
    font-weight:700;
}
</style>
