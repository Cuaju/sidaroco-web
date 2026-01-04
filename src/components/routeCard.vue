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
        Edit
      </button>
      <button class="deleteBtn" @click.stop="onDelete">
        Delete
      </button>
      <button
        class="featureBtn"
        :class="{ active: route.featured }"
        @click.stop="toggleFeatured"
        title="Featured route"
        >
      <span class="star">★</span>
      </button>
    </div>
    <div class="titleBlock">
      <span v-if="route.ticketPrice !== null" class="price">
      Ticket cost ${{ Number(route.ticketPrice).toFixed(2) }}
      </span>
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
  import { toggleFeatured } from "@/services/routesApi"; 
  
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
      async toggleFeatured() {
        console.log("CLICK FEATURED", this.route.id, this.route.featured);
  
        const previous = this.route.featured;
        this.route.featured = !previous;
  
        try {
          const updated = await toggleFeatured(this.route.id);
          this.route.featured = updated.featured;
  
          this.toast.success(
            updated.featured
              ? "Route marked as featured"
              : "Route unfeatured"
          );
        } catch (err) {
          this.route.featured = previous;
          this.toast.error("Failed to update featured status");
          console.error(err);
        }
      },
  
      onDelete() {
        Swal.fire({
          title: "¿Delete route?",
          text: "This action cannot be undone",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#e53935",
          cancelButtonText: "Cancel",
          confirmButtonText: "Yes, delete",
        }).then((result) => {
          if (result.isConfirmed) {
            this.$emit("delete", this.route.id);
            this.toast.success("Route deleted");
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
}.featureBtn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba($primaryColor, 0.25);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  transition: all 0.25s ease;
}

.featureBtn .star {
  font-size: 18px;
  color: rgba($primaryColor, 0.45);
  transition: all 0.25s ease;
}

.featureBtn:hover {
  border-color: $thirdColor;
  transform: scale(1.05);
}

.featureBtn:hover .star {
  color: $thirdColor;
}

.featureBtn.active {
  background: linear-gradient(
    135deg,
    #fbc02d,
    #f9a825
  );
  border-color: transparent;
  box-shadow: 0 6px 14px rgba(251, 192, 45, 0.45);
}

.featureBtn.active .star {
  color: #3a2b00;
  transform: scale(1.15);
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
