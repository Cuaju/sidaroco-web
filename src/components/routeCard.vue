<template>
  <article class="routeCard">
    <div class="top">
      <span class="id">#{{ route.id }}</span>
      <span class="name">{{ route.name }}</span>
    </div>

    <div class="path">
      {{ route.origin.name }} → {{ route.destination.name }}
    </div>
    <div class="actions">
      <button class="editBtn" @click.stop="onEdit">
        Editar
      </button>
      <button class="deleteBtn" @click.stop="onDelete">
        Eliminar
      </button>
    </div>


    <RouteMap
      :origin="route.origin"
      :destination="route.destination"
    />
  </article>
</template>
<script>
  import RouteMap from "./routeMap.vue";
  import { useToast } from "vue-toastification";
  import Swal from "sweetalert2";
  export default {
  name: "RouteCard",
  components: { RouteMap },

  props: {
    route: {
      type: Object,
      required: true,
    },
  },

  emits: ["delete", "edit"],

  setup() {
    const toast = useToast();
    return { toast };
  },

  methods: {
    onDelete() {
  Swal.fire({
    title: "¿Eliminar ruta?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e53935",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí, eliminar"
  }).then((result) => {
    if (result.isConfirmed) {
      this.$emit("delete", this.route.id);
      this.toast.success("Ruta eliminada");
    }
  });
},
    onEdit() {
      this.$emit("edit", this.route.id);
    },
  },
};
  </script>
  

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.routeCard {
  padding: 14px;
  border-radius: 14px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);
  cursor: pointer;

  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    background: rgba($secondaryColor, 0.08);
  }
}

.top {
  display: flex;
  justify-content: space-between;
  font-weight: 900;
  color: $primaryColor;
}

.path {
  font-weight: 700;
  color: rgba($primaryColor, 0.75);
}
.deleteBtn {
  align-self: flex-end;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background: #e53935;
  color: white;
  font-weight: 900;
  cursor: pointer;
}

.editBtn {
align-self: flex-end;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(
    135deg,
    $primaryColor,
    $secondaryColor
  );
  color: white;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.deleteBtn:hover {
  filter: brightness(0.95);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}


.editBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

.deleteBtn {
  padding: 6px 14px;
  border-radius: 10px;
  border: none;
  background: #e53935;
  color: white;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.deleteBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

</style>
