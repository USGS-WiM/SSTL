<template>
  <v-main>
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 100%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @mousemove="getLatLng"
    >
      <div id="base" class="initial-loader">
        <l-tile-layer :url="url" :attribution="attribution" />

        <l-control position="bottomleft">
          <div class="latlng">Latitude: {{ lat }}, Longitude: {{ long }}</div>
        </l-control>
        <l-control-scale position="bottomleft" :metric="true" />
        <!-- markers (these ones use custom wim divIcon styling not leaflet default) -->
        <l-feature-group ref="features">
          <l-popup>
            <div>
              <h3>{{ caller.cameraName }}</h3>
              <div>
                <h4>
                  USGS Site:
                  <a :href="caller.nexGenLink" target="_blank">{{
                    caller.usgsSiteNumber
                  }}</a>
                </h4>
              </div>
              <h4>{{ caller.cameraDescription }}</h4>
              <div>
                <a :href="caller.cameraURL_full" target="_blank"
                  ><video
                    id="sampleMovie"
                    autoplay
                    controls
                    width="250"
                    title="Click to open full-size video"
                  >
                    <source
                      id="myMovie"
                      :src="caller.cameraURL_small"
                      type="video/mp4"
                    /></video
                ></a>
                <div>Last updated on: {{ caller.dateTime }}</div>
                <div>
                  <a :href="caller.dashboardURL" target="_blank"
                    >Details Page</a
                  >
                </div>
              </div>
            </div></l-popup
          >
        </l-feature-group>
        <l-marker
          v-for="marker in markers"
          :key="marker.id"
          :visible="marker.visible"
          :lat-lng="marker.position"
          :icon="nwisIcon"
          @click="openPopUp(marker.center, marker)"
        ></l-marker>
      </div>
    </l-map>
  </v-main>
</template>

<script>
import { latLng, Icon, divIcon } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LControl,
  LControlScale,
  LFeatureGroup,
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
export default {
  name: "Example",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LControl,
    LControlScale,
    LFeatureGroup,
  },
  data() {
    return {
      zoom: 5,
      lat: 37.0902,
      long: -95.71,
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
      caller: {
        id: null,
        position: null,
        draggable: true,
        visible: true,
        cameraDescription: null,
        usgsSiteNumber: null,
        videoNameBase: null,
        dateTime: null,
        dashboardURL: "",
        cameraURL_full: "",
        cameraURL_small: "",
        cameraName: "",
        state: null,
        imagesBatchSize: null,
        center: [],
      },
    };
  },
  async created() {
    //to be populated with data for all camera sites
    let markerArray = [];

    //get camera data
    const response = await fetch(
      "https://apps.usgs.gov/sstl/php/getAllEnabledCameras.php"
    );

    //camera data
    let cameraJSON = await response.json();

    //loop through camera data to prepare for populating map
    for (let i = 0; i < cameraJSON.data.length; i++) {
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
          dateTime: null,
          dashboardURL: "",
          cameraURL_full: "",
          cameraURL_small: "",
          cameraName: "",
          state: site.state,
          imagesBatchSize: site.imagesBatchSize,
          center: [],
          nexGenLink: "",
        };
        tempSiteArr.position = {
          lat: site.nwis_values.lat,
          lng: site.nwis_values.lng,
        };
        tempSiteArr.id = cameraID;
        markerArray.push(tempSiteArr);

        //these urls are for the camera live feed and links in popup
        let cameraURL =
          "https://apps.usgs.gov/sstl/media/cameras/" +
          site.usgsSiteNumber +
          "_" +
          site.videoNameBase +
          "/" +
          site.videoNameBase;
        if (site.mostRecentImageDateTime) {
          let tempDateTime = new Date(site.mostRecentImageDateTime);
          tempDateTime = tempDateTime.toLocaleString();
          tempSiteArr.dateTime = tempDateTime;
        }
        if (!site.mostRecentImageDateTime) {
          tempSiteArr.dateTime = "Date not available";
        }

        tempSiteArr.center = [site.nwis_values.lat, site.nwis_values.lng];
        tempSiteArr.cameraURL_full = cameraURL + "_full.webm";
        tempSiteArr.cameraURL_small = cameraURL + "_small.webm";
        let editedCameraName = site.cameraName.replace(/_/g, " ");
        tempSiteArr.cameraName = editedCameraName;
        tempSiteArr.dashboardURL =
          "https://apps.usgs.gov/sstl/camera/" +
          site.usgsSiteNumber +
          "_" +
          site.videoNameBase;
        tempSiteArr.nexGenLink =
          "https://waterdata.usgs.gov/monitoring-location/" +
          site.usgsSiteNumber;
      }
    }
    this.markers = markerArray;

    //remove the loader
    let backgroundDiv = document.getElementById("base");
    backgroundDiv.classList.remove("initial-loader");
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    getLatLng: function(event) {
      this.lat = parseFloat(event.latlng.lat).toFixed(6);
      this.long = parseFloat(event.latlng.lng).toFixed(6);
    },
    openPopUp(latLng, caller) {
      this.caller = caller;
      this.$refs.features.mapObject.openPopup(latLng);
      //If you don't reload the video, the old one starts playing
      document.getElementById("sampleMovie").load();
    },
  },
};
</script>

<style scoped>
/*placing "scoped" after style affects only the current file*/
@import "../styles/markers.css";
@import "../styles/sstlMap.css";
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
