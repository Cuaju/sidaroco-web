<template>
  <ClientLayout>
    <section class="wrap">
      <div class="head">
        <h1>My profile</h1>
        <p>Your account + profile info</p>
      </div>

      <div v-if="loading" class="cardLite">Loading...</div>
      <div v-else-if="error" class="errorLite">{{ error }}</div>

      <div v-else class="grid">
        <div class="card">
          <div class="cardTop">
            <div>
              <h2>{{ profile?.fullName || "No name yet" }}</h2>
              <p class="sub">{{ account?.userType }} · {{ account?.isActive ? "Active" : "Inactive" }}</p>
            </div>
            <button class="btn ghost" @click="refresh">Refresh</button>
          </div>

          <div class="rows">
            <div class="row">
              <span class="k">Username</span>
              <span class="v">{{ account?.username }}</span>
            </div>

            <div class="row">
              <span class="k">Email</span>
              <span class="v">{{ account?.email }}</span>
            </div>

            <div class="row">
              <span class="k">Phone</span>
              <span class="v">{{ profile?.phoneNumber || "—" }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn" @click="openEmailModal">Change email</button>
            <button class="btn" @click="openPasswordModal">Change password</button>
          </div>
        </div>

        <div class="card">
          <h2>Edit profile</h2>
          <p class="sub">Update your name and phone</p>

          <form @submit.prevent="saveProfile" class="form">
            <label class="field">
              <span>Full name</span>
              <input v-model.trim="editFullName" type="text" />
            </label>

            <label class="field">
              <span>Phone</span>
              <input v-model.trim="editPhone" type="text" />
            </label>

            <p v-if="saveMsg" class="okLite">{{ saveMsg }}</p>
            <p v-if="saveErr" class="errorLite small">{{ saveErr }}</p>

            <button class="btn" type="submit" :disabled="saving">
              {{ saving ? "Saving..." : "Save changes" }}
            </button>
          </form>
        </div>
      </div>
    </section>

    <div v-if="showEmail" class="modalOverlay" @click.self="closeModals">
      <div class="modal">
        <h3>Change email</h3>
        <p class="sub">This updates your auth account email.</p>

        <label class="field">
          <span>New email</span>
          <input v-model.trim="newEmail" type="email" autocomplete="email" />
        </label>

        <p v-if="modalErr" class="errorLite small">{{ modalErr }}</p>
        <p v-if="modalOk" class="okLite">{{ modalOk }}</p>

        <div class="modalActions">
          <button class="btn ghost" @click="closeModals">Cancel</button>
          <button class="btn" :disabled="modalLoading" @click="submitEmail">
            {{ modalLoading ? "Updating..." : "Update email" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showPassword" class="modalOverlay" @click.self="closeModals">
  <div class="modal">
    <h3>Change password</h3>
    <p class="sub">Use your current password to set a new one.</p>

    <label class="field">
      <span>Current password</span>
      <input
        v-model="currentPassword"
        type="password"
        autocomplete="current-password"
      />
    </label>

    <label class="field">
      <span>New password</span>
      <input
        v-model="newPassword"
        type="password"
        autocomplete="new-password"
        @input="passwordTouched = true"
      />
    </label>

    <label class="field">
      <span>Confirm new password</span>
      <input
        v-model="confirmPassword"
        type="password"
        autocomplete="new-password"
        @input="confirmTouched = true"
      />
    </label>

    <!-- Reactive rules -->
    <div class="rulesCard" aria-live="polite">
      <p class="rulesTitle">Password requirements</p>

      <ul class="rules">
        <li
          v-for="r in passwordRules"
          :key="r.key"
          class="rule"
          :class="{ ok: r.ok, bad: !r.ok }"
        >
          <span class="mark" aria-hidden="true">{{ r.ok ? "✓" : "✕" }}</span>
          <span class="ruleText">{{ r.label }}</span>
        </li>
      </ul>

      <p v-if="passwordTouched && !passwordAllGood" class="hintLite">
        Make it stronger to continue.
      </p>
    </div>

    <p v-if="modalErr" class="errorLite small">{{ modalErr }}</p>
    <p v-if="modalOk" class="okLite">{{ modalOk }}</p>

    <div class="modalActions">
      <button class="btn ghost" @click="closeModals">Cancel</button>
      <button class="btn" :disabled="!canSubmitPassword" @click="submitPassword">
        {{ modalLoading ? "Updating..." : "Update password" }}
      </button>
    </div>
  </div>

    </div>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import { getMe, patchMe, changeMyPassword } from "@/services/usersApi";
import { useToast } from "vue-toastification";

const toast = useToast()

export default {
  components: { ClientLayout },

  data() {
    return {
      loading: true,
      error: "",
      account: null,
      profile: null,

      // edit profile
      editFullName: "",
      editPhone: "",
      saving: false,
      saveErr: "",
      saveMsg: "",

      showEmail: false,
      showPassword: false,
      modalLoading: false,
      modalErr: "",
      modalOk: "",

      newEmail: "",

      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      passwordTouched: false,
      confirmTouched: false,
    };
  },

  async mounted() {
    await this.refresh();
  },

  computed: {
  passwordChecks() {
    const pw = this.newPassword || "";
    const confirm = this.confirmPassword || "";

    return {
      minLen: pw.length >= 12,
      hasUpper: /[A-Z]/.test(pw),
      hasNumber: /\d/.test(pw),
      hasSpecial: /[#$!*]/.test(pw), // exactly what you wanted
      matches: pw.length > 0 && pw === confirm,
    };
  },

  passwordAllGood() {
    const c = this.passwordChecks;
    return c.minLen && c.hasUpper && c.hasNumber && c.hasSpecial && c.matches;
  },

  passwordRules() {
    const c = this.passwordChecks;

    return [
      { key: "minLen", label: "At least 12 characters", ok: c.minLen },
      { key: "upper", label: "At least 1 uppercase letter (A-Z)", ok: c.hasUpper },
      { key: "num", label: "At least 1 number (0-9)", ok: c.hasNumber },
      { key: "special", label: "At least 1 special character (# $ ! *)", ok: c.hasSpecial },
      { key: "match", label: "New password matches confirmation", ok: c.matches },
    ];
  },

  canSubmitPassword() {
    const hasCurrent = typeof this.currentPassword === "string" && this.currentPassword.length > 0;
    return !this.modalLoading && hasCurrent && this.passwordAllGood;
  },
},

  methods: {
    async refresh() {
      this.loading = true;
      this.error = "";
      try {
        const data = await getMe();
        this.account = data.account;
        this.profile = data.profile;

        this.editFullName = data.profile?.fullName || "";
        this.editPhone = data.profile?.phoneNumber || "";
      } catch (e) {
        this.error = e?.message || "could not load profile";
      } finally {
        this.loading = false;
      }
    },

    openEmailModal() {
      this.resetModalMsgs();
      this.newEmail = this.account?.email || "";
      this.showEmail = true;
    },

    openPasswordModal() {
      this.resetModalMsgs();
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmPassword = "";
      this.passwordTouched = false;
      this.confirmTouched = false;
      this.showPassword = true;
    },

    closeModals() {
      this.showEmail = false;
      this.showPassword = false;
      this.resetModalMsgs();
    },

    resetModalMsgs() {
      this.modalErr = "";
      this.modalOk = "";
      this.modalLoading = false;
    },

    async submitEmail() {
      this.resetModalMsgs();
      this.modalLoading = true;
      try {
        const out = await patchMe({ email: this.newEmail });
        if (out.account) this.account = out.account.account || out.account; // depending on your auth response shape
        this.modalOk = "Email updated.";
        toast.success(`Email updates to ${this.newEmail}`)
        await this.refresh();
      } catch (e) {
        this.modalErr = e?.message || "could not update email";
      } finally {
        this.modalLoading = false;
      }
    },

async submitPassword() {
  this.resetModalMsgs();

  if (!this.canSubmitPassword) {
    this.modalErr = "Fix the password requirements before updating.";
    return;
  }

  this.modalLoading = true;
  try {
    await changeMyPassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    });

    toast.success("Password Changed usccesfully")
    this.modalOk = "Password updated.";
    this.currentPassword = "";
    this.newPassword = "";
    this.confirmPassword = "";
    this.passwordTouched = false;
    this.confirmTouched = false;
  } catch (e) {
    this.modalErr = e?.message || "could not update password";
  } finally {
    this.modalLoading = false;
  }
},


    async saveProfile() {
      this.saveErr = "";
      this.saveMsg = "";
      this.saving = true;
      try {
        const out = await patchMe({
          fullName: this.editFullName,
          phoneNumber: this.editPhone
        });
        if (out.profile) this.profile = out.profile;
        this.saveMsg = "Profile saved.";
      } catch (e) {
        this.saveErr = e?.message || "could not save profile";
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.wrap {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 26px 0 60px;
}

.head h1 {
  margin: 0;
  color: $primaryColor;
  font-weight: 1000;
}

.head p {
  margin: 6px 0 18px;
  color: rgba($primaryColor, 0.75);
  font-weight: 700;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .grid { grid-template-columns: 1.1fr 0.9fr; }
}

.card {
  background: $fourthColor;
  border-radius: 20px;
  border: 1px solid rgba($primaryColor, 0.12);
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
  padding: 18px;
}

.cardTop {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

h2 { margin: 0; color: $primaryColor; font-weight: 1000; }
.sub { margin: 6px 0 0; color: rgba($primaryColor, .7); font-weight: 700; }

.rows { margin-top: 14px; display: grid; gap: 10px; }
.row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba($primaryColor, 0.04);
  border: 1px solid rgba($primaryColor, 0.10);
}
.k { color: rgba($primaryColor, .7); font-weight: 900; }
.v { color: $primaryColor; font-weight: 900; }

.actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.form { margin-top: 12px; display: grid; gap: 12px; }

.field { display: flex; flex-direction: column; gap: 8px; }
.field span { color: $primaryColor; font-weight: 900; opacity: .9; }

input {
  height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba($primaryColor, 0.35);
  background: $fourthColor;
  color: $primaryColor;
  font-weight: 800;
  outline: none;
}
input:focus { border-color: $thirdColor; box-shadow: 0 0 0 4px rgba($thirdColor, 0.35); }

.btn {
  height: 44px;
  border: none;
  border-radius: 14px;
  background: $primaryColor;
  color: $fourthColor;
  font-weight: 1000;
  padding: 0 14px;
  cursor: pointer;
}
.btn.ghost {
  background: rgba($primaryColor, 0.08);
  color: $primaryColor;
  border: 1px solid rgba($primaryColor, 0.18);
}

.cardLite {
  padding: 14px;
  border-radius: 14px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);
  font-weight: 900;
  color: $primaryColor;
}

.errorLite {
  padding: 12px 14px;
  border-radius: 14px;
  color: #b00020;
  font-weight: 900;
  background: rgba(176, 0, 32, 0.12);
  border: 1px solid rgba(176, 0, 32, 0.25);
}
.errorLite.small { padding: 10px 12px; font-weight: 800; }

.okLite {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 120, 80, 0.12);
  border: 1px solid rgba(0, 120, 80, 0.25);
  color: #006b4a;
  font-weight: 900;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 999;
}

.modal {
  width: min(520px, 92vw);
  background: $fourthColor;
  border-radius: 18px;
  border: 1px solid rgba($primaryColor, 0.14);
  box-shadow: 0 18px 60px rgba(0,0,0,.35);
  padding: 18px;
}

.modalActions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.rulesCard {
  margin-top: 10px;
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
  background: rgba($fourthColor, 0.7);
}

.rule .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid rgba($primaryColor, 0.35);
  flex: 0 0 auto;
}

.ruleText {
  color: rgba($primaryColor, 0.78);
  font-weight: 800;
}

.rule.ok {
  border-color: rgba(0, 120, 80, 0.25);
  background: rgba(0, 120, 80, 0.08);
}
.rule.ok .dot {
  border-color: rgba(0, 120, 80, 0.6);
  background: rgba(0, 120, 80, 0.6);
}
.rule.ok .ruleText {
  color: #006b4a;
}

.rule.bad {
  border-color: rgba(176, 0, 32, 0.25);
  background: rgba(176, 0, 32, 0.08);
}
.rule.bad .dot {
  border-color: rgba(176, 0, 32, 0.55);
  background: rgba(176, 0, 32, 0.25);
}
.rule.bad .ruleText {
  color: rgba(176, 0, 32, 0.95);
}

.rule.idle {
  opacity: 0.9;
}

.hintLite {
  margin: 10px 0 0;
  color: rgba($primaryColor, 0.65);
  font-weight: 800;
}
</style>
