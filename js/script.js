
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


// This function will loop through the markers array and display them all.
function showMarkers(markers) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}


// Init map with Coppell, Dallas as center. 
function initMap() {

  // use a constructor to create a new map JS object. 
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 32.954569, lng: -97.015008},
          zoom: 14
  });


 
 var ViewModel = function() {

  var self = this;
  this.locations = ko.observableArray([]);
  this.markers = [];
  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');
  var largeInfowindow = new google.maps.InfoWindow();
  
  initialLocations.forEach(function(item, i) {
      self.locations.push(item);
      // Get the position from the location array.
      var position = item.location;
      var title = item.title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
      });
      // Push the marker to our array of markers.
      self.markers.push(marker);
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
  });
  
  // show all the markers
  //var displayedMarkers = showListings();

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
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }


  function getMarker(markers, title) {
    var found = markers.find(function(marker) {
      return marker.title === title;
    });
    return found;
  }

  this.openMarkerInfoWindow = function(location) {
    var currentMarker = getMarker(self.markers, location.title);
    populateInfoWindow(currentMarker, largeInfowindow);
  }
};

var view_model = new ViewModel();
showMarkers(view_model.markers);
ko.applyBindings(view_model);


}





