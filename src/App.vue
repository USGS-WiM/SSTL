<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon
        @click="drawerState = !drawerState"
      ></v-app-bar-nav-icon
      ><img
        style="height: 90%; margin-right: 20px; "
        src="./assets/USGS_Green_web.png"
      />
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
