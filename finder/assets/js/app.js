Materialize.toast("Loading...");

var config, directory, map, geocoder, address, districtsGeoJSON, districtsLayer;
var geocoder = new google.maps.Geocoder();
var bounds = new google.maps.LatLngBounds();
var marker = new google.maps.Marker({
  draggable: true,
  animation: google.maps.Animation.DROP
});
var infowindow = new google.maps.InfoWindow({
  maxWidth: 250
});

marker.addListener("click", function() {
  infowindow.open(map, marker);
});

marker.addListener("dragstart", function() {
  infowindow.close();
});

marker.addListener("dragend", function() {
  geocodeLatLng(marker.getPosition().lat(), marker.getPosition().lng(), false);
});

$(".button-collapse").sideNav();

$("#search").keyup(function(event) {
  if (event.keyCode==13) {
    $("#search").blur();
    geocodeAddress();
  }
});

$("#clear-search").click(function(event) {
  $("#search").val("");
});

$("#toggle-search").click(function(event) {
  $("#search-bar").toggle("fast", function() {
    if ($("#search-bar").css("display") == "none") {
      $("#map").height($(document).height() - ($(".navbar-fixed").height()));
    } else {
      $("#map").height($(document).height() - ($(".navbar-fixed").height() * 2));
    }
  });
  return false;
});

$("#my-location").click(function(event) {
  geolocate();
  return false;
});

$("#full-extent").click(function(event) {
  map.fitBounds(bounds);
  $(".button-collapse").sideNav("hide");
  return false;
});

$("#layer-check").change(function(event) {
  if (this.checked) {
    districtsLayer.setMap(map);
  } else {
     districtsLayer.setMap(null);
  }
});

$("input[name='basemap']").change(function(event) {
  if (this.id == "streets") {
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  } else if (this.id == "satellite"){
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
  }
});

$(window).resize(function() {
  resizeMap();
});

$(document).ready(function() {
  if (window.location.hash.substring(1)) {
    directory = "configs/" + window.location.hash.substring(1);
    $.ajax({
      type: "get",
      url: directory + "/config.json",
      success: function(data, textStatus, jqXHR){
        config = data;
        $(".title").html(config.app.title);
        $("#layer-name").html(config.app.layername);
        $("#about-text").html(config.app.about);
        initialize();
      },
      error: function (jqXHR, textStatus, errorThrown){
        window.location.replace("../starter-template/");
      }
    });
  } else {
    window.location.replace("../starter-template/");
  }
});

function resizeMap() {
  if ($("#search-bar").css("display") == "none") {
    $("#map").height($(document).height() - ($(".navbar-fixed").height()));
  } else {
    $("#map").height($(document).height() - ($(".navbar-fixed").height() * 2));
  }
}

function initialize() {
  map = new google.maps.Map(document.getElementById("map"), {
    mapTypeControl: false
  });
  map.addListener("click", function() {
    $("#search").blur();
  });
  marker.setMap(map);
  resizeMap();
  loadDistricts();
}

function loadDistricts() {
  districtsLayer = new google.maps.Data({
    map: config.districts.visible ? map : null,
    style: config.districts.style ? config.districts.style : {
      clickable: false,
      fillColor: "black",
      fillOpacity: 0,
      strokeWeight: 2
    }
  });

  districtsLayer.addListener("addfeature", function(e) {
    processPoints(e.feature.getGeometry(), bounds.extend, bounds);
    map.fitBounds(bounds);
  });

  districtsLayer.addListener("click", function(e) {
    $("#search").blur();
    /*var bounds = new google.maps.LatLngBounds();
    processPoints(e.feature.getGeometry(), bounds.extend, bounds);
    map.fitBounds(bounds);
    e.feature.forEachProperty(function(value, property) {
      console.log(property + ": " + value);
    });*/
  });

  $.getJSON(directory + "/" + config.districts.data.file, function(data){
    var format = config.districts.data.format;
    if (format == "geojson") {
      districtsGeoJSON = data;
    } else if (format == "topojson") {
      var object = config.districts.data.topojson_object;
      districtsGeoJSON = topojson.feature(data, data.objects[object]);
    }
    districtsLayer.addGeoJson(districtsGeoJSON);
    $("#toast-container").empty();
    if (config.geolocate) {
      geolocate();
    }
  });
}

function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g) {
      processPoints(g, callback, thisArg);
    });
  }
}

function geolocate() {
  if (navigator.geolocation) {
    Materialize.toast("Finding your location...");
    navigator.geolocation.getCurrentPosition(function (position) {
      $("#toast-container").empty();
      $(".button-collapse").sideNav("hide");
      var location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      marker.setPosition(location);
      map.setCenter(location);
      map.setZoom(17);
      geocodeLatLng(position.coords.latitude, position.coords.longitude, true);
    }, null, {maximumAge:600000, timeout:10000, enableHighAccuracy: true});
  }
}

function geocodeAddress() {
  geocoder.geocode({
    "address": $("#search").val(),
    "componentRestrictions": config.geocode.componentRestrictions
  }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var lat = results[0].geometry.location.lat();
      var lng = results[0].geometry.location.lng();
      address = results[0].formatted_address;
      getInfo(lat, lng, true);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function geocodeLatLng(lat, lng, updateMap) {
  geocoder.geocode({
    "location": {
      lat: lat,
      lng: lng
    }
  }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        $("#toast-container").empty();
        address = results[0].formatted_address;
        getInfo(lat, lng, updateMap);
      } else {
        alert("No results found");
        $("#toast-container").empty();
      }
    } else {
      alert("Geocode was not successful for the following reason: " + status);
      $("#toast-container").empty();
    }
  });
}

function getInfo(lat, lng, updateMap) {
  var location = turf.featurecollection([turf.point([lng, lat])]);
  var ptsWithin = turf.within(location, districtsGeoJSON);
  if (ptsWithin.features.length > 0) {
    var content = "<table class='bordered'><tr>";
    $.each(config.districts.popup.properties, function(property, value) {
      var val = turf.tag(location, districtsGeoJSON, value, value).features[0].properties[value];
      if (val) {
        content += "<tr><th>" + property + "</th><td>" + val + "</td></tr>";
      }
    });
    content += "</table>";
    if (config.districts.popup.text) {
      content += "<div class='popup-text grey-text'>" + config.districts.popup.text + "</div>";
    }
    marker.setPosition({
      lat: lat,
      lng: lng
    });
    if (updateMap) {
      map.setCenter({
        lat: lat,
        lng: lng
      });
      map.setZoom(17);
    }
    infowindow.setContent("<div class='center-align'><h6 class='blue-text lighten-1'>" + address + "</h6>" + content + "</div>");
    infowindow.open(map, marker);
  } else {
    infowindow.setContent("<div class='center-align'><h6 class='blue-text lighten-1'>" + address + "</h6></div>");
    infowindow.open(map, marker);
    Materialize.toast("This location is outside of the geographic boundaries of this service...", 4000);
  }
}
