<script>
import { requestRegisterCode } from "../services/usersApi";

export default {
  data() {
    return {
      email: "",
      username: "",
      password: "",
      verifyPassword: "",
      loading: false,
      error: "",

      focusUsername: false,
      focusEmail: false,
      focusPassword: false,
    };
  },

  computed: {
    emailChecks() {
      const e = (this.email || "").trim();

      const hasAt = e.indexOf("@") > 0;
      const atIndex = e.indexOf("@");
      const dotIndex = e.lastIndexOf(".");
      const hasDomain =
        hasAt && dotIndex > atIndex + 1 && dotIndex < e.length - 1;

      return {
        nonEmpty: e.length > 0,
        noSpaces: !/\s/.test(e),
        hasAt,
        hasDomain,
        valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
      };
    },

    emailRules() {
      const c = this.emailChecks;
      return [
        { key: "nonEmpty", label: "Email is not empty", ok: c.nonEmpty },
        { key: "noSpaces", label: "No spaces", ok: c.noSpaces },
        { key: "hasAt", label: 'Contains "@"', ok: c.hasAt },
        { key: "hasDomain", label: "Has a valid domain (example.com)", ok: c.hasDomain },
      ];
    },

    emailAllGood() {
      return this.emailChecks.valid;
    },

    usernameChecks() {
      const u = (this.username || "").trim();
      return {
        minLen: u.length >= 3,
        noSpaces: !/\s/.test(u),
        safeChars: /^[a-zA-Z0-9._-]+$/.test(u),
      };
    },

    usernameRules() {
      const c = this.usernameChecks;
      return [
        { key: "minLen", label: "At least 3 characters", ok: c.minLen },
        { key: "noSpaces", label: "No spaces", ok: c.noSpaces },
        { key: "safeChars", label: "Only letters, numbers, . _ -", ok: c.safeChars },
      ];
    },

    usernameAllGood() {
      const c = this.usernameChecks;
      return c.minLen && c.noSpaces && c.safeChars;
    },

    passwordChecks() {
      const pw = this.password || "";
      const vpw = this.verifyPassword || "";
      return {
        minLen: pw.length >= 12,
        hasUpper: /[A-Z]/.test(pw),
        hasNumber: /\d/.test(pw),
        hasSpecial: /[#$!*]/.test(pw),
        matches: pw.length > 0 && pw === vpw,
      };
    },

    passwordRules() {
      const c = this.passwordChecks;
      return [
        { key: "minLen", label: "At least 12 characters", ok: c.minLen },
        { key: "hasUpper", label: "At least 1 uppercase letter (A-Z)", ok: c.hasUpper },
        { key: "hasNumber", label: "At least 1 number (0-9)", ok: c.hasNumber },
        { key: "hasSpecial", label: "At least 1 special character (# $ ! *)", ok: c.hasSpecial },
        { key: "matches", label: "Password matches confirmation", ok: c.matches },
      ];
    },

    passwordAllGood() {
      const c = this.passwordChecks;
      return c.minLen && c.hasUpper && c.hasNumber && c.hasSpecial && c.matches;
    },

    showUsernameRules() {
      return this.focusUsername || this.username.trim().length > 0;
    },
    showEmailRules() {
      return this.focusEmail || this.email.trim().length > 0;
    },
    showPasswordRules() {
      return this.focusPassword || (this.password || "").length > 0 || (this.verifyPassword || "").length > 0;
    },

    canSubmit() {
      return (
        this.emailAllGood &&
        this.usernameAllGood &&
        this.passwordAllGood &&
        !this.loading
      );
    },
  },

  methods: {
    async onSubmit() {
      this.error = "";

      if (!this.canSubmit) {
        this.error = "Fix the requirements to continue.";
        return;
      }

      this.loading = true;
      try {
        await requestRegisterCode({
          email: this.email,
          username: this.username,
          password: this.password,
          verifyPassword: this.verifyPassword,
        });

        this.$router.push({ name: "verifyEmail", query: { email: this.email } });
      } catch (e) {
        this.error = e?.message || "request failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div id="background">
    <div id="card">
      <h1>Create account</h1>

      <form @submit.prevent="onSubmit" class="form">
        <label class="field">
          <span>Username</span>
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            @focus="focusUsername = true"
            @blur="focusUsername = false"
          />
        </label>

        <transition name="collapse">
          <div v-show="showUsernameRules" class="rulesCard" aria-live="polite">
            <p class="rulesTitle">Username requirements</p>
            <ul class="rules">
              <li
                v-for="r in usernameRules"
                :key="r.key"
                class="rule"
                :class="r.ok ? 'ok' : 'bad'"
              >
                <span class="icon" aria-hidden="true"></span>
                <span class="ruleText">{{ r.label }}</span>
              </li>
            </ul>
          </div>
        </transition>

        <label class="field">
          <span>Email</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            @focus="focusEmail = true"
            @blur="focusEmail = false"
          />
        </label>

        <transition name="collapse">
          <div v-show="showEmailRules" class="rulesCard" aria-live="polite">
            <p class="rulesTitle">Email requirements</p>
            <ul class="rules">
              <li
                v-for="r in emailRules"
                :key="r.key"
                class="rule"
                :class="r.ok ? 'ok' : 'bad'"
              >
                <span class="icon" aria-hidden="true"></span>
                <span class="ruleText">{{ r.label }}</span>
              </li>
            </ul>
          </div>
        </transition>

        <label class="field">
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            @focus="focusPassword = true"
            @blur="focusPassword = false"
          />
        </label>

        <label class="field">
          <span>Verify password</span>
          <input
            v-model="verifyPassword"
            type="password"
            autocomplete="new-password"
            @focus="focusPassword = true"
            @blur="focusPassword = false"
          />
        </label>

        <transition name="collapse">
          <div v-show="showPasswordRules" class="rulesCard" aria-live="polite">
            <p class="rulesTitle">Password requirements</p>
            <ul class="rules">
              <li
                v-for="r in passwordRules"
                :key="r.key"
                class="rule"
                :class="r.ok ? 'ok' : 'bad'"
              >
                <span class="icon" aria-hidden="true"></span>
                <span class="ruleText">{{ r.label }}</span>
              </li>
            </ul>
          </div>
        </transition>

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

#background {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
}

#card {
  width: min(460px, 92vw);
  padding: 28px;
  border-radius: 18px;
  background: $fourthColor;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form {
  display: grid;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  color: $thirdColor;
  font-weight: 800;
}

input {
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba($primaryColor, 0.35);
  background: $fourthColor;
  outline: none;
  color: $primaryColor;
  font-weight: 800;
}

input:focus {
  border-color: $thirdColor;
  box-shadow: 0 0 0 4px rgba($thirdColor, 0.25);
}

.btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: $primaryColor;
  color: $fourthColor;
  font-weight: 900;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b00020;
  font-weight: 900;
}


.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.22s ease, opacity 0.18s ease, transform 0.18s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 260px; 
  opacity: 1;
  transform: translateY(0);
}


.rulesCard {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba($primaryColor, 0.12);
  background: rgba($primaryColor, 0.03);
}

.rulesTitle {
  margin: 0 0 8px;
  color: $primaryColor;
  font-weight: 1000;
  opacity: 0.9;
}

.rules {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.rule {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba($primaryColor, 0.10);
  background: rgba($fourthColor, 0.75);
}

.icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 1000;
  flex: 0 0 auto;
}

.ruleText {
  color: rgba($primaryColor, 0.78);
  font-weight: 800;
}

.rule.bad {
  border-color: rgba(176, 0, 32, 0.25);
  background: rgba(176, 0, 32, 0.08);
}
.rule.bad .icon {
  border: 2px solid rgba(176, 0, 32, 0.55);
  color: rgba(176, 0, 32, 0.95);
}
.rule.bad .icon::before {
  content: "✕";
}
.rule.bad .ruleText {
  color: rgba(176, 0, 32, 0.95);
}

.rule.ok {
  border-color: rgba(0, 120, 80, 0.25);
  background: rgba(0, 120, 80, 0.08);
}
.rule.ok .icon {
  border: 2px solid rgba(0, 120, 80, 0.55);
  color: #006b4a;
}
.rule.ok .icon::before {
  content: "✓";
}
.rule.ok .ruleText {
  color: #006b4a;
}
</style>
