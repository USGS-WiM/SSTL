import Vue from 'vue'
import Vuex from 'vuex'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import uswds from 'uswds/dist/js/uswds'
import leaflet from 'leaflet/dist/leaflet'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// UI Framework
Vue.use(vuetify)

// For tracking states
Vue.use(Vuex)

// USWDS (may not use this)
Vue.use(uswds);

// Leaflet
Vue.use(leaflet);

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
