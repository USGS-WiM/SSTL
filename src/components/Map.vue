<template>
  <v-main>
    <div style="height: 100%; width: 100%">
      <l-map
        v-if="showMap"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 80%"
        @update:center="centerUpdate"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <!-- markers (these ones use custom wim divIcon styling not leaflet default) -->
        <l-layer-group layer-type="overlay" name="Markers" :visible="true">
          <l-marker
            v-for="marker in markers"
            :key="marker.id"
            :visible="marker.visible"
            :lat-lng="marker.position"
            :icon="nwisIcon"
          />
          <l-popup>"marker.id"</l-popup>
        </l-layer-group>
        <l-marker :lat-lng="withPopup">
          <l-popup>
            <div @click="innerClick">
              I am a popup
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
                Donec finibus semper metus id malesuada.
              </p>
            </div>
          </l-popup>
        </l-marker>
        <l-marker :lat-lng="withTooltip">
          <l-tooltip :options="{ permanent: true, interactive: true }">
            <div @click="innerClick">
              I am a tooltip
              <p v-show="showParagraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi.
                Donec finibus semper metus id malesuada.
              </p>
            </div>
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>
  </v-main>
</template>

<script>
import { latLng, Icon, divIcon } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LLayerGroup,
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
export default {
  name: "Example",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LLayerGroup,
  },
  data() {
    return {
      zoom: 13,
      center: latLng(47.41322, -1.219482),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(47.41322, -1.219482),
      withTooltip: latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: latLng(47.41322, -1.219482),
      showParagraph: false,
      markers: [],
      nwisIcon: divIcon({
        className: "wmm-circle wmm-mutedblue  wmm-size-20",
      }), //custom WIM icons
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
    };
  },
  //if you want to load a geojson layer
  async created() {
    // const response = await fetch(
    //   "https://stn.wim.usgs.gov/STNServices/SensorViews.geojson?ViewType=baro_view&"
    //);
    // this.geojson = await response.json();
    // console.log("this.geojson", this.geojson);

    let markerArray = [];

    const response2 = await fetch(
      "https://apps.usgs.gov/sstl/php/getAllEnabledCameras.php"
    );
    let cameraJSON = await response2.json();

    console.log("cameraJSON", cameraJSON);
    for (let i = 0; i < cameraJSON.data.length; i++) {
      // console.log("cameraJSON.data[i]", cameraJSON.data[i]);
      let site = cameraJSON.data[i];
      if (site.nwis_values) {
        let cameraID = site._id;
        let tempSiteArr = {
          id: null,
          position: null,
          draggable: true,
          visible: true,
        };
        tempSiteArr.position = {
          lat: site.nwis_values.lat,
          lng: site.nwis_values.lng,
        };
        tempSiteArr.id = cameraID;
        markerArray.push(tempSiteArr);
        //console.log("markerArray", markerArray);
      }
    }
    console.log("markerArray", markerArray);
    this.markers = markerArray;

    console.log("this.markers", this.markers);

    /* let HttpClient = function() {
      this.get = function(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
          if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            aCallback(anHttpRequest.responseText);
        };
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
      };
    };
    let client = new HttpClient();
    client.get(
      "https://apps.usgs.gov/sstl/php/getAllEnabledCameras.php",
      function(response) {
        let cameraJSON = JSON.parse(response);
        for (let i = 0; i < cameraJSON.length; i++) {
          let site = cameraJSON.data[i];
          if (site.nwis_values) {
            let cameraID = site.id;
            console.log("cameraID", cameraID);
            this.testThing = 3;
          }
        }
      }
    ); */
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    },
  },
};
</script>

<style scoped>
/*placing "scoped" after style affects only the current file*/
@import "../styles/markers.css";
button {
  background-color: #eceef3;
  border-radius: 0;
  border: none;
  box-shadow: 0 3px 6px rgba(30, 39, 50, 0.2), 0 3px 6px rgba(30, 39, 50, 0.2);
  color: #6f758e;
  font-size: 9pt;
  letter-spacing: 1px;
  padding: 5px;
}
</style>
