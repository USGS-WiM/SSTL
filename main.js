/*
Created By Erik Myers 3/12/2019; revised 8/25/2021
For USGS WiM and USGS UmidWisc Innovation Lab
The application and data are intended as proof of concept only and are not to be used in any official capacity.
*/

var sstlWebRoot = "https://apps.usgs.gov/sstl/";
var siteInfo;
// initialize the map
$(document).ready(function () {
  var webcamMarkers = {};
  $.getJSON(
    "https://apps.usgs.gov/sstl/php/getAllEnabledCameras.php",
    function (data) {
      //console.log(data);
      $(data.data).each(function (index, site) {
        //console.log(site);
        if (site.nwis_values) {
          var cameraID = site._id;
          var latlngArr = [site.nwis_values.lat, site.nwis_values.lng];

          var customPopup =
            "<div><h3>" +
            site.cameraDescription +
            "</h3>" +
            '<div><a href="https://apps.usgs.gov/sstl/media/cameras/' +
            site.usgsSiteNumber +
            "_" +
            site.videoNameBase +
            "/" +
            site.videoNameBase +
            '_full.webm"' +
            '" target="_blank">' +
            '<video autoplay controls width="250" title="Click to open full-size video">' +
            '<source src="https://apps.usgs.gov/sstl/media/cameras/' +
            site.usgsSiteNumber +
            "_" +
            site.videoNameBase +
            "/" +
            site.videoNameBase +
            '_small.webm" type="video/mp4">' +
            "</video></a>" +
            "<div><b>Last Updated at: " +
            site.lastProcessedDateTime +
            '</br></br><div><b>Camera dashboard page: </b><a href="https://apps.usgs.gov/sstl/camera/' +
            site.usgsSiteNumber +
            "_" +
            site.videoNameBase +
            '" target="_blank">' +
            "https://apps.usgs.gov/sstl/camera/" +
            site.usgsSiteNumber +
            "_" +
            site.videoNameBase +
            "</div></br>";

          webcamMarkers[cameraID] = L.circleMarker(latlngArr, {
            fillColor: "#31353C",
            color: "#000",
            weight: 0,
            fillOpacity: 0.6,
            radius: 7,
          }).bindPopup(customPopup, { maxWidth: "auto" });
          sitesLayer.addLayer(webcamMarkers[cameraID]);
        } else {
          console.log("no coordinates for: ", site);
        }
      });
    }
  );
}); //end self-invoking jquery func

// setup basemaps, add one in map instantiation below
var topo = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "",
  }
);

var satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "",
  }
);

var map = L.map("map", {
  center: [38.0, -97.6],
  zoom: 5,
  layers: [topo],
});

//create markercluster group

//Dev Note for Styling clusters: set className to .streamSite or .nonStream to change symbology
var markerClusterGroup = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 1.1,
  spiderfyDistanceMultiplier: 2,
  iconCreateFunction: function (cluster) {
    return new L.DivIcon({
      html: cluster.getChildCount(),
      className:
        "nonStream leaflet-marker-icon marker-cluster  leaflet-zoom-animated leaflet-interactive",
      iconSize: new L.Point(35, 35),
    });
  },
}).addTo(map);

//add markerClusters to feature group AND add to map to draw layer on init
var sitesLayer = L.featureGroup.subGroup(markerClusterGroup).addTo(map);

//leaflet tilelayer of NWIS sites
var swActTileLayer = L.tileLayer(
  "https://nwismapper.s3.amazonaws.com/sw_act/{z}/{y}/{x}.png",
  {
    zIndex: 999,
    maxZoom: 8,
    errorTileUrl: "https://nwismapper.s3.amazonaws.com/blank.png",
  }
);

//objects for layer controls
var overlayLayers = {
  "Camera Locations": sitesLayer,
  "All Nwis Sites": swActTileLayer,
};

var baseMaps = {
  Satellite: satellite,
  Topographic: topo,
};

L.control.layers(baseMaps, overlayLayers).addTo(map);
