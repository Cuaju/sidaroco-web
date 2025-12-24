<template>
  <ClientLayout>
    <section class="hero">
      <div class="heroInner">
        <h1>Where are we taking you?</h1>
        <p>Find your bus trip fast — choose origin, destination and date.</p>

        <div class="searchCard">
          <div class="grid">
            <label class="field">
              <span>Origin</span>
              <input type="text" placeholder="From where do you travel?" />
            </label>

            <label class="field">
              <span>Destination</span>
              <input type="text" placeholder="Where are you going?" />
            </label>

            <label class="field">
              <span>Date</span>
              <input type="date" />
            </label>
          </div>

          <button class="cta">Search trip</button>
        </div>
      </div>
    </section>

    <section class="reco">
      <div class="recoHead">
        <h2>Recommended places</h2>
        <p>Ideas for your next trip</p>
      </div>

      <div class="cards">
        <article class="placeCard">
          <div class="thumb" :style="{ backgroundImage: `url(${destinationImage})` }"></div>
          <div class="meta">
            <h3>Veracruz</h3>
            <p>Beach + food + vibes</p>
          </div>
        </article>

        <article class="placeCard">
          <div class="thumb" :style="{ backgroundImage: `url(${destinationImage})` }"></div>
          <div class="meta">
            <h3>CDMX</h3>
            <p>Museums + city life</p>
          </div>
        </article>

        <article class="placeCard">
          <div class="thumb" :style="{ backgroundImage: `url(${destinationImage})` }"></div>
          <div class="meta">
            <h3>Puebla</h3>
            <p>Culture + architecture</p>
          </div>
        </article>
      </div>
    </section>
  </ClientLayout>
</template>

<script>
import ClientLayout from "../layouts/clientLayout.vue";
import destinationImage from "@/assets/images/destinationPlaceholder.jpg";
export default {
  components: { ClientLayout },
  setup() {
    return {
      destinationImage: destinationImage,
    };
  },
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.hero {
  padding: 44px 18px 28px;
  background: radial-gradient(circle at 30% 20%,
      $secondaryColor 0%,
      $primaryColor 55%,
      #001a18 100%);
}

.heroInner {
  width: min(980px, 96vw);
  margin: 0 auto;
  color: $fourthColor;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
  letter-spacing: -0.8px;
}

p {
  margin: 10px 0 18px;
  opacity: 0.9;
  font-weight: 700;
}

.searchCard {
  background: rgba($fourthColor, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
}

.grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}

@media (min-width: 820px) {
  .grid {
    grid-template-columns: 1fr 1fr 220px;
    align-items: end;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  color: $primaryColor;
  font-weight: 900;
  opacity: 0.9;
}

input {
  height: 44px;
  width: 100%;
  box-sizing: border-box;

  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba($primaryColor, 0.35);
  background: $fourthColor;

  outline: none;
}

input:focus {
  border-color: $thirdColor;
  box-shadow: 0 0 0 4px rgba($thirdColor, 0.35);
}

.cta {
  margin-top: 14px;
  height: 46px;
  width: 100%;
  border: none;
  border-radius: 14px;

  background: $thirdColor;
  color: $primaryColor;
  font-weight: 1000;
  letter-spacing: 0.4px;

  cursor: pointer;
}

@media (min-width: 820px) {
  .cta {
    margin-top: 16px;
    width: 260px;
  }
}

.cta:hover {
  filter: brightness(0.96);
}

.reco {
  width: min(980px, 96vw);
  margin: 0 auto;
  padding: 26px 0 50px;
}

.recoHead h2 {
  margin: 0;
  color: $primaryColor;
  font-weight: 1000;
}

.recoHead p {
  margin: 6px 0 18px;
  color: rgba($primaryColor, 0.75);
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 820px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.placeCard {
  overflow: hidden;
  border-radius: 18px;
  background: $fourthColor;
  border: 1px solid rgba($primaryColor, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.thumb {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
}

.meta {
  padding: 14px;
}

.meta h3 {
  margin: 0;
  color: $primaryColor;
  font-weight: 1000;
}

.meta p {
  margin: 6px 0 0;
  color: rgba($primaryColor, 0.75);
  font-weight: 700;
}
</style>
