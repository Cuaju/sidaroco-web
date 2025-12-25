<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const props = defineProps({
  origin: {
    type: Object,
    required: true
  },
  destination: {
    type: Object,
    required: true
  }
});

const mapContainer = ref(null);

onMounted(async () => {
  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [props.origin.lng, props.origin.lat],
    zoom: 6
  });

  map.on("load", async () => {
    new mapboxgl.Marker({ color: "#2b946b" })
      .setLngLat([props.origin.lng, props.origin.lat])
      .setPopup(new mapboxgl.Popup().setText(props.origin.name))
      .addTo(map);

    new mapboxgl.Marker({ color: "#ddb947" })
      .setLngLat([props.destination.lng, props.destination.lat])
      .setPopup(new mapboxgl.Popup().setText(props.destination.name))
      .addTo(map);
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${props.origin.lng},${props.origin.lat};` +
      `${props.destination.lng},${props.destination.lat}` +
      `?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();

    const route = data.routes[0].geometry;

    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: route
      }
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "#ddb947",
        "line-width": 5
      }
    });

    const bounds = new mapboxgl.LngLatBounds();
    route.coordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds, { padding: 40 });
  });
});
</script>

<style scoped>
.map {
  width: 100%;
  height: 280px;
  border-radius: 16px;
}
</style>
