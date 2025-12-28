<template>
  <div class="user" @click="toggle">
    <span class="userName">{{ userName }}</span>
    <div class="avatar">{{ avatar }}</div>

    <div v-if="open" class="dropdown" @click.stop>
      <button class="logoutBtn" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "userMenu",
  props: {
    userName: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  data() {
    return { open: false };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/");
    },
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/colors.scss" as *;

.user {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 48px;

  background: rgba($secondaryColor, 0.92);
  border: 1.5px solid $primaryColor;
  border-radius: 6px;

  padding: 6px;
  min-width: 140px;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.logoutBtn {
  width: 100%;
  background: transparent;
  border: none;

  color: $fourthColor;
  font-weight: 800;

  padding: 10px 12px;
  text-align: left;
  border-radius: 4px;
}

.logoutBtn:hover {
  background: rgba($secondaryColor, 0.6);
}

.avatar {
  border-radius: 6px;
}

</style>
