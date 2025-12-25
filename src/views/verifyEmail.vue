<script>
import { verifyRegisterCode } from "../services/usersApi";

export default {
  data() {
    return { email: "", code: "", loading: false, error: "" };
  },
  created() {
    this.email = (this.$route.query.email || "").toString();
  },
  computed: {
    canSubmit() {
      return this.email.trim().length > 0 && this.code.trim().length === 6 && !this.loading;
    }
  },
  methods: {
    async onSubmit() {
      this.error = "";
      this.loading = true;
      try {
        const out = await verifyRegisterCode({
          email: this.email.trim().toLowerCase(),
          code: this.code.trim()
        });
        this.$router.push({ name: "registerProfile", query: { accountId: out.accountId } });
      } catch (e) {
        this.error = e.message || "verify failed";
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
      <h1>Verify email</h1>
        <p class="muted">We sent a 6-digit code to: <b>{{ email }}</b></p>
      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>Verification code</span>
          <input v-model.trim="code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" maxlength="6"/>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn" type="submit" :disabled="!canSubmit">
          {{ loading ? "Verifying..." : "Verify" }}
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
    padding:28px; 
    border-radius:18px; 
    background:$fourthColor; 
    box-shadow:0 18px 60px rgba(0,0,0,.35); 
    display:flex; 
    flex-direction:column; 
    gap:12px;
}

.muted{
     opacity:.8;
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
    background:$fourthColor; outline:none; 
    letter-spacing:4px; 
    font-weight:800;
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
