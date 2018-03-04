/* ======= Model ======= */
 var initialLocations = [
    {title: 'Palio\'s Pizza', location: {lat: 32.972557, lng: -96.994204}},
    {title: 'Cici\'s Pizza', location: {lat: 32.968356, lng: -96.991926}},
    {title: 'Walgreens', location: {lat: 32.977036, lng: -96.994309}},
    {title: 'Sprouts supermarket', location: {lat: 32.970312, lng: -96.995428}},
    {title: 'Cottonwood Creek Elementary School', location: {lat: 32.976391, lng: -97.007427}}
];

// Create a map variable
var map;
var all_markers = [];

// This function will loop through the markers array and display them all.
function showMarkers(markers) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      toggleBounce(markers[i]);
      bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
    }
}

function updateMarkers() {
    hideMarkers(all_markers);
    var value = document.getElementById("filterInput").value;
    var currentMarkers = [];
    var filter = value.toLowerCase();
    if(!filter) {
        currentMarkers = all_markers;
    } else {
        all_markers.forEach(function(marker) {
            if (marker.title.toLowerCase().startsWith(filter)) {
                currentMarkers.push(marker);
           }
       });
    }
    showMarkers(currentMarkers);
}

 function getMarker(markers, title) {
    var match = markers.find(function(marker) {
      return marker.title === title;
    });
    return match;
  }

 function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        }, 1400);
  }
}
 

// Init map with Coppell, Dallas as center.
function initMap() {

  try {
    // use a constructor to create a new map JS object.
    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 32.954569, lng: -97.015008},
          zoom: 14
    });
  }
  catch(error) {
    alert("google map could not be loaded due to " + error);
  }


 var ViewModel = function() {

  var self = this;

  this.filter = ko.observable("");

  // Style the markers. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');
  var largeInfowindow = new google.maps.InfoWindow();

  initialLocations.forEach(function(item, i) {
     // self.locations.push(item);
      // Get the position from the location array.
      var position = item.location;
      var title = item.title;
      // Create a marker per location, and put ino markers array.
      try {

          var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
          });

          // Push the marker to our array of markers.
         all_markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
              this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
    }
    catch(error) {
      alert("Markers failed to load "+ error);
    }
  });

  this.locations = ko.computed(function() {
      var filter = self.filter().toLowerCase();
      if(!filter) {
          return initialLocations;
      } else {
          var filtered_results = [];
          initialLocations.forEach(function(location) {
              if (location.title.toLowerCase().startsWith(filter)) {
                  filtered_results.push(location);
             }
         });
        return filtered_results;
      }
  });


  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
        return markerImage;
  }

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent(marker.title);
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });

          infowindow.open(map, marker);
        }
      }



  this.openMarkerInfoWindow = function(location) {
      var currentMarker = getMarker(all_markers, location.title);
      populateInfoWindow(currentMarker, largeInfowindow);
    };


};

var view_model = new ViewModel();
showMarkers(all_markers);
ko.applyBindings(view_model);


}
