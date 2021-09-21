<template>
  <v-app>
    <v-app-bar app>
      <a
        href="https://www.usgs.gov/"
        target="_blank"
        style="height: 90%; margin-right: 20px; "
        ><img
          src="./assets/USGS_Green_web.png"
          style="height: 100%;
        margin-right: 20px;"
      /></a>
      <v-toolbar-title>Storm Summary Time-Lapse</v-toolbar-title>
    </v-app-bar>
    <Map></Map>
  </v-app>
</template>

<script>
// imports
import Map from "./components/Map";
export default {
  components: {
    Map,
  },
  computed: {
    drawerState: {
      get() {
        return this.$store.getters.drawerState;
      },
      set(v) {
        return this.$store.commit("toggleDrawerState", v);
      },
    },
  },
};
</script>
