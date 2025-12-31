<template>
  <div class="bus">
    <div class="busFront">
      <div class="driver">Driver</div>
      <div class="door">Door</div>
    </div>

    <div class="busGrid">
      <template v-for="seat in visualLayout" :key="seat.key">
        <div v-if="seat.type === 'aisle'" class="aisle"></div>

        <button
          v-else
          class="seat"
          :class="{ taken: !seat.available, selected: seat.number === selected }"
          :disabled="!seat.available"
          @click="select(seat.number)"
        >
          {{ seat.number }}
        </button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    seats: { type: Array, required: true }
  },
  data() {
    return {
      selected: null
    };
  },
  computed: {
    visualLayout() {
      const layout = [];
      let index = 0;

      for (let row = 0; row < 10; row++) {
        layout.push(
          this.seats[index++] || null,
          this.seats[index++] || null,
          { type: "aisle", key: `a-${row}` },
          this.seats[index++] || null,
          this.seats[index++] || null
        );
      }

      return layout
        .filter(Boolean)
        .map(s =>
          s.type === "aisle"
            ? s
            : { ...s, type: "seat", key: s.number }
        );
    }
  },
  methods: {
    select(n) {
      this.selected = n;
      this.$emit("select", n);
    }
  }
};
</script>


<style lang="scss" scoped>
@use "@/styles/colors" as *;
.bus {
  background: #f4f0e2;
  border-radius: 26px;
  padding: 18px 22px 22px;
  width: fit-content;
  margin: 0 auto;
}

.busFront {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.driver,
.door {
  background: rgba(0, 0, 0, 0.1);
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 12px;
}

.busGrid {
  display: grid;
  grid-template-columns: repeat(2, 60px) 30px repeat(2, 60px);
  gap: 12px;
}

.aisle {
  width: 30px;
}

.seat {
  height: 42px;
  border-radius: 10px;
  border: none;
  background: #e3c24d;
  font-weight: 900;
  cursor: pointer;
}

.seat.taken {
  background: #9aa7a3;
  cursor: not-allowed;
}

.seat.selected {
  background: #1f7f6d;
  color: white;
}

</style>
