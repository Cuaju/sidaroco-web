<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import mapboxgl from "mapbox-gl";

const props = defineProps({
  origin: Object,
  destination: Object,
});

const mapContainer = ref(null);
let map;
let originMarker;
let destinationMarker;

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-99.1332, 19.4326],
    zoom: 5,
  });
});

watch(
  () => [props.origin, props.destination],
  async () => {
    if (!map || !props.origin || !props.destination) return;

    drawMarkers();
    await drawRoute();
    fitBounds();
  }
);

const drawMarkers = () => {
  if (originMarker) originMarker.remove();
  if (destinationMarker) destinationMarker.remove();

  originMarker = new mapboxgl.Marker({ color: "green" })
    .setLngLat([props.origin.lng, props.origin.lat])
    .addTo(map);

  destinationMarker = new mapboxgl.Marker({ color: "red" })
    .setLngLat([props.destination.lng, props.destination.lat])
    .addTo(map);
};

const drawRoute = async () => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${props.origin.lng},${props.origin.lat};${props.destination.lng},${props.destination.lat}?geometries=geojson&access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  const routeGeoJSON = {
    type: "Feature",
    geometry: data.routes[0].geometry,
  };

  if (map.getSource("route")) {
    map.getSource("route").setData(routeGeoJSON);
  } else {
    map.addSource("route", {
      type: "geojson",
      data: routeGeoJSON,
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#2563eb",
        "line-width": 5,
      },
    });
  }
};

const fitBounds = () => {
  const bounds = new mapboxgl.LngLatBounds();
  bounds.extend([props.origin.lng, props.origin.lat]);
  bounds.extend([props.destination.lng, props.destination.lat]);

  map.fitBounds(bounds, {
    padding: 60,
    duration: 800,
  });
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 100%;
  min-height: 420px;
}
</style>
