
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
var markers = [];

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

  this.showMarker = function(location) {
    alert(location.title);
  }
};


ko.applyBindings(new ViewModel());


}





