<template>
    <div class="user" @click="toggle">
        <span class="userName">{{ userName }}</span>
        <div class="avatar">{{ avatar }}</div>

        <transition name="ultraDrop">
            <div v-if="open" class="dropdown" @click.stop>
                <button class="logoutBtn" @click="profile">Profile</button>
                <button class="logoutBtn" @click="logout">Logout</button>
            </div>
        </transition>
    </div>
</template>


<script>
import { Transition } from 'vue';

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
        profile(){
            this.$router.push("/profile")
        }
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
    transform-origin: top right;
    will-change: transform, opacity, filter;
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

.ultraDrop-enter-active {
    animation: ultraDropIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ultraDrop-leave-active {
    animation: ultraDropOut 220ms cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes ultraDropIn {
    0% {
        opacity: 0;
        transform:
            translateY(-22px) scale(0.92);
        filter: blur(6px);
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    }

    55% {
        opacity: 1;
        transform:
            translateY(6px) scale(1.02);
        filter: blur(1px);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }

    75% {
        transform:
            translateY(-2px) scale(0.995);
    }

    100% {
        opacity: 1;
        transform:
            translateY(0) scale(1);
        filter: blur(0);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
    }
}

@keyframes ultraDropOut {
    0% {
        opacity: 1;
        transform:
            translateY(0) scale(1);
        filter: blur(0);
    }

    100% {
        opacity: 0;
        transform:
            translateY(-10px) scale(0.96);
        filter: blur(4px);
    }
}
</style>
