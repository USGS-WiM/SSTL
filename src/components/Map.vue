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
            ><l-popup>
              <div>
                <h3>{{ marker.cameraName }}</h3>
                <h4>USGS Site: {{ marker.usgsSiteNumber }}</h4>
                <h4>{{ marker.cameraDescription }}</h4>
                <div>
                  <a :href="marker.cameraURL_full" target="_blank"
                    ><video
                      autoplay
                      controls
                      width="250"
                      title="Click to open full-size video"
                    >
                      <source
                        :src="marker.cameraURL_small"
                        type="video/mp4"
                      /></video
                  ></a>
                </div>
              </div> </l-popup
          ></l-marker>
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
      zoom: 5,
      center: latLng(37.0902, -95.71),
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
          cameraDescription: site.cameraDescription,
          usgsSiteNumber: site.usgsSiteNumber,
          videoNameBase: site.videoNameBase,
          lastProcessedDateTime: site.lastProcessedDateTime,
          cameraURL_full: "",
          cameraURL_small: "",
          cameraName: "",
        };
        tempSiteArr.position = {
          lat: site.nwis_values.lat,
          lng: site.nwis_values.lng,
        };
        tempSiteArr.id = cameraID;
        markerArray.push(tempSiteArr);
        //console.log("markerArray", markerArray);
        let cameraURL =
          "https://apps.usgs.gov/sstl/media/cameras/" +
          site.usgsSiteNumber +
          "_" +
          site.videoNameBase +
          "/" +
          site.videoNameBase;
        tempSiteArr.cameraURL_full = cameraURL + "_full.webm";
        tempSiteArr.cameraURL_small = cameraURL + "_small.webm";
        let editedCameraName = site.cameraName.replace(/_/g, " ");
        tempSiteArr.cameraName = editedCameraName;

        console.log("tempSiteArr.cameraName", tempSiteArr.cameraName);
      }
    }
    console.log("markerArray", markerArray);
    this.markers = markerArray;

    console.log("this.markers", this.markers);
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
