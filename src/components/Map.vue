<template>
  <v-main>
    <l-map
      v-if="showMap"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height: 80%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
      @mousemove="getLatLng"
    >
      <div id="base" class="initial-loader">
        <l-tile-layer :url="url" :attribution="attribution" />

        <l-control position="bottomleft">
          <button>Latitude: {{ lat }}, Longitude: {{ long }}</button>
        </l-control>
        <l-control-scale position="bottomleft" :metric="true" />
        <!-- markers (these ones use custom wim divIcon styling not leaflet default) -->
        <l-feature-group ref="features">
          <l-popup>
            <div>
              <h3>{{ caller.cameraName }}</h3>
              <h4>USGS Site: {{ caller.usgsSiteNumber }}</h4>
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
                <div>Last updated at: {{ caller.lastProcessedDateTime }}</div>
                <div>
                  <a :href="caller.dashboardURL" target="_blank"
                    >Open Dashboard</a
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
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        v-model="selectedRows"
        :headers="headers"
        :items="markers"
        :search="search"
        ><template v-slot:item="{ item }">
          <tr
            :class="selectedRows.indexOf(item.id) > -1 ? 'cyan' : ''"
            @click="openPopUp(item.position, item)"
          >
            <td>{{ item.cameraName }}</td>
            <td>{{ item.id }}</td>
            <td>{{ item.state }}</td>
            <td>{{ item.lastProcessedDateTime }}</td>
            <td>{{ item.imagesBatchSize }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
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
        lastProcessedDateTime: null,
        dashboardURL: "",
        cameraURL_full: "",
        cameraURL_small: "",
        cameraName: "",
        state: null,
        imagesBatchSize: null,
        center: [],
      },
      search: "",
      selectedRows: [],
      headers: [
        {
          text: "Camera Name",
          align: "start",
          sortable: true,
          value: "cameraName",
        },
        { text: "USGS Site", value: "id" },
        { text: "State", value: "state" },
        { text: "Last Processed Time", value: "lastProcessedDateTime" },
        { text: "Img Batch Size", value: "imagesBatchSize" },
      ],
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
          lastProcessedDateTime: site.lastProcessedDateTime,
          dashboardURL: "",
          cameraURL_full: "",
          cameraURL_small: "",
          cameraName: "",
          state: site.state,
          imagesBatchSize: site.imagesBatchSize,
          center: [],
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
