<template>
  <div class="busContainer">
    <div class="bus">
      <div class="busFront">
        <div class="driver">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M20 19v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          </svg>
          <span>Driver</span>
        </div>
        <div class="door">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
          </svg>
          <span>Door</span>
        </div>
      </div>

      <div class="busGrid">
        <template v-for="seat in visualLayout" :key="seat.key">
          <div v-if="seat.type === 'aisle'" class="aisle">
            <div class="aisleLines"></div>
          </div>

          <button 
            v-else 
            class="seat" 
            :class="{
              taken: !seat.available,
              selected: selected.includes(seat.number)
            }" 
            :disabled="!seat.available" 
            @click="$emit('select', seat.number)"
          >
            <span class="seatNumber">{{ seat.number }}</span>
            <div class="seatIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/>
                <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5z"/>
                <path d="M5 18v3"/>
                <path d="M19 18v3"/>
              </svg>
            </div>
          </button>
        </template>
      </div>

      <div class="busBack">
        <div class="backPanel"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    seats: { type: Array, required: true },
    selected: { type: Array, required: true }
  },
  computed: {
    visualLayout() {
      const layout = [];
      let index = 0;
      const rows = Math.ceil(this.seats.length / 4);

      for (let row = 0; row < rows; row++) {
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
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as *;

.busContainer {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.bus {
  background: linear-gradient(180deg, #f8f5e8 0%, #ebe6d5 100%);
  border-radius: 20px;
  padding: 16px 18px 18px;
  width: fit-content;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 2px 4px rgba(255, 255, 255, 0.5);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
    border-radius: 0 0 4px 4px;
  }
}

.busFront {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 8px;
}

.driver,
.door {
  background: linear-gradient(135deg, rgba($primaryColor, 0.15), rgba($secondaryColor, 0.1));
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 10px;
  color: $primaryColor;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 2px solid rgba($primaryColor, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  svg {
    opacity: 0.8;
    width: 14px;
    height: 14px;
  }
}

.busGrid {
  display: grid;
  grid-template-columns: repeat(2, 50px) 26px repeat(2, 50px);
  gap: 8px;
}

.aisle {
  width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.aisleLines {
  width: 2px;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    rgba($primaryColor, 0.15) 0px,
    rgba($primaryColor, 0.15) 8px,
    transparent 8px,
    transparent 16px
  );
  border-radius: 2px;
}

.seat {
  height: 38px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ffd93d 0%, #f4c430 100%);
  font-weight: 900;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.12),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 12px 12px 0 0;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 6px 16px rgba(0, 0, 0, 0.18),
      inset 0 1px 2px rgba(255, 255, 255, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
}

.seatNumber {
  font-size: 13px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 1;
}

.seatIcon {
  opacity: 0.25;
  position: relative;
  z-index: 1;
  color: rgba(0, 0, 0, 0.6);
  
  svg {
    width: 14px;
    height: 14px;
  }
}

.seat.taken {
  background: linear-gradient(135deg, #9aa7a3 0%, #7a8581 100%);
  cursor: not-allowed;
  
  .seatNumber {
    color: rgba(255, 255, 255, 0.7);
  }

  .seatIcon {
    opacity: 0.4;
    color: rgba(255, 255, 255, 0.5);
  }

  &::before {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent);
  }
}

.seat.selected {
  background: linear-gradient(135deg, $primaryColor 0%, $secondaryColor 100%);
  color: white;
  box-shadow: 
    0 4px 16px rgba($primaryColor, 0.4),
    0 0 0 3px rgba($primaryColor, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  animation: selectPulse 0.4s ease;

  .seatNumber {
    color: white;
  }

  .seatIcon {
    opacity: 0.8;
    color: white;
  }

  &::before {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.25), transparent);
  }

  &:hover {
    transform: scale(1.05) translateY(-2px);
  }
}

@keyframes selectPulse {
  0%, 100% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.12);
  }
}

.busBack {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.backPanel {
  width: 80%;
  height: 10px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba($primaryColor, 0.15) 20%, 
    rgba($primaryColor, 0.15) 80%, 
    transparent 100%
  );
  border-radius: 6px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>