<template>
  <v-app>
    <Sidebar></Sidebar>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawerState = !drawerState"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <Map></Map>
  </v-app>
</template>

<script>
// imports
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
export default {
  components: {
    Sidebar,
    Map,
  },
  computed: {
    drawerState: {
      get () { return this.$store.getters.drawerState },
      set (v) { return this.$store.commit('toggleDrawerState', v) }
    },
  },
};
</script>
