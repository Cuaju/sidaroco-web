<script>
import FinanceManagerLayout from "../layouts/financeManagerLayout.vue";
import { getAdminAccounts, setAdminActive } from "../services/usersApi";

export default {
  components: { FinanceManagerLayout },
  data() {
    return {
      loading: true,
      error: "",
      accounts: []
    };
  },
  async created() {
    await this.reload();
  },
  methods: {
    async reload() {
      this.loading = true;
      this.error = "";
      try {
        const out = await getAdminAccounts();
        this.accounts = out.accounts || [];
      } catch (e) {
        this.error = e.message || "could not load accounts";
      } finally {
        this.loading = false;
      }
    },
    async toggle(a) {
      this.error = "";
      const next = !a.isActive;
      try {
        await setAdminActive(a.id, next);
        a.isActive = next;
      } catch (e) {
        this.error = e.message || "update failed";
      }
    },
    goRegister() {
      this.$router.push({ name: "registerAdmin" });
    }
  }
};
</script>

<template>
    <div id="background">
      <div id="wrap">
        <div class="topbar">
          <div>
            <h1>Admin Accounts</h1>
            <p class="muted">Manage Route Managers, Finance Managers and Cashiers.</p>
          </div>

          <button class="btn" @click="goRegister">+ Register account</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <div class="card" v-if="loading">
          Loading...
        </div>

        <div class="card" v-else>
          <div class="row head">
            <div>User</div>
            <div>Role</div>
            <div>Profile</div>
            <div>Status</div>
            <div></div>
          </div>

          <div v-if="accounts.length === 0" class="empty">
            No admin accounts found.
          </div>

          <div v-for="a in accounts" :key="a.id" class="row">
            <div class="user">
              <div class="strong">{{ a.username }}</div>
              <div class="muted small">{{ a.email }}</div>
            </div>

            <div class="pill">{{ a.userType }}</div>

            <div>
              <div class="strong">{{ a.profile?.fullName || "No profile" }}</div>
              <div class="muted small">{{ a.profile?.phoneNumber || "" }}</div>
            </div>

            <div>
              <span :class="['status', a.isActive ? 'on' : 'off']">
                {{ a.isActive ? "Active" : "Inactive" }}
              </span>
            </div>

            <div class="actions">
              <button class="btn ghost" @click="toggle(a)">
                {{ a.isActive ? "Deactivate" : "Reactivate" }}
              </button>
            </div>
          </div>
        </div>

        <button class="btn ghost" style="margin-top:12px" @click="reload">Refresh</button>
      </div>
    </div>
</template>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

#background{
  min-height:100vh;
  padding:24px;
  background: radial-gradient(circle at 30% 20%, $secondaryColor 0%, $primaryColor 55%, #001a18 100%);
}

#wrap{
  width:min(1100px,96vw);
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:12px;
}

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:12px;
}

.card{
  padding:18px;
  border-radius:18px;
  background:$fourthColor;
  box-shadow:0 18px 60px rgba(0,0,0,.35);
}

.row{
  display:grid;
  grid-template-columns: 2fr 1fr 1.6fr .9fr 1fr;
  gap:12px;
  padding:12px 10px;
  align-items:center;
  border-top: 1px solid rgba(255,255,255,.08);
}
.head{
  border-top:none;
  padding-top:6px;
  font-weight:900;
  color:$thirdColor;
}

.user .strong{ font-weight:900; }
.strong{ font-weight:800; }
.small{ font-size:.9rem; }
.muted{ opacity:.8; }

.pill{
  display:inline-flex;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  font-weight:800;
  justify-self:start;
}

.status{
  font-weight:900;
}
.status.on{ color: #1fbf6b; }
.status.off{ color: #ff6b6b; }

.actions{
  display:flex;
  justify-content:flex-end;
}

.btn{
  height:44px;
  padding:0 14px;
  border:none;
  border-radius:12px;
  background:$secondaryColor;
  color:$fourthColor;
  font-weight:900;
  cursor:pointer;
}
.btn.ghost{
  background:transparent;
  border:1px solid rgba(255,255,255,.18);
  color: $thirdColor; 
}

.btn.ghost:hover{
  background: rgba(255,255,255,.06);
}

.error{
  color:#b00020;
  font-weight:800;
  background: rgba(176,0,32,.12);
  border:1px solid rgba(176,0,32,.25);
  padding:10px 12px;
  border-radius:12px;
}
.empty{
  padding:16px 10px;
  opacity:.85;
}

@media (max-width: 900px){
  .row{ grid-template-columns: 1fr; }
  .actions{ justify-content:flex-start; }
  .topbar{ flex-direction:column; align-items:stretch; }
}
</style>
