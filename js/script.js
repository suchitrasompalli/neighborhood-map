/* ======= Model ======= */
// VenueId is required for each location so as to get data from Foursquare.
 var initialLocations = [
    {title: 'Palio\'s Pizza Cafe', location: {lat: 32.972557, lng: -96.994204}, venueId: '4af04e34f964a52021db21e3'},
    {title: 'Cici\'s Pizza', location: {lat: 32.968356, lng: -96.991926}, venueId: '4ba11085f964a520359437e3'},
    {title: 'Walgreens', location: {lat: 32.977036, lng: -96.994309}, venueId: '4bec8b1675b2c9b662ab438d'},
    {title: 'Sprouts supermarket', location: {lat: 32.970312, lng: -96.995428}, venueId: '4b993ac8f964a520ba6b35e3'},
    {title: 'Cottonwood Creek Elementary School', location: {lat: 32.9764, lng: -97.0074}, venueId: '4c61a20279d1e21ea72fd415'}
];

// Create a map variable
var map;
var all_markers = [];


// This function will loop through any markers array and display them all.
function showMarkers(markers) {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      toggleBounce(markers[i], 4);
      bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through markers and hide them all.
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
    }
}

// This function will apply the filter to the list of markers and update the map
// with the new list of mappers.
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

// Return the marker that matches the title.
 function getMarker(markers, title) {
    var match = markers.find(function(marker) {
      return marker.title === title;
    });
    return match;
  }

// Toggles the marker in the ui based on number of bounces required.
 function toggleBounce(marker, number_of_bounces) {
    // setting bounce_time so that bounce occurs only twice.
    // bounce_time = Number of bounces required x 700
    var bounce_time = 700 * number_of_bounces;
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        }, bounce_time);
  }
}

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

function getFourSquareData(marker) {

  var CLIENT_ID = "FGYXHLBLXZYPHXUPWZNCXYFLJQ5RW51D2P2HYSD4O43BBGOZ";
  var CLIENT_SECRET = "HPC3VD5FI4LEFEJ4DSPR4MX32K2HZTC1IVMU2UXFOAN4OSMU";
  var BASE_URL = "https://api.foursquare.com/v2/venues/";

  var version = "&v=20180101";
  var params = "?client_id="+ CLIENT_ID + "&client_secret=" + CLIENT_SECRET + version;

  var url = BASE_URL + marker.venueId + params;


  $.ajax({
      url: url,
      cache: true,
      dataType: "json"
  }).done(function(data) {
      marker.infoWindowData = data;
  }).fail(function(jqXHR, textStatus, errorThrown) {
      alert("Failed to get data from foursquare for "+ marker.title + " due to " +textStatus);
  });

  
}

function toggleListView() {
    var view = document.getElementById("listView");
    if (view.style.display === "none") {
        view.style.display = "block";
    } else {
        view.style.display = "none";
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
      var venueId = item.venueId;
      
      // Create a marker per location, and put ino markers array.
      try {

          var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            venueId: venueId,
            animation: google.maps.Animation.DROP,
            id: i
          });

          // preload the content we need in information window from four square.
         
         //TODO: Uncomment for later getFourSquareData(marker);

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

  
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
          
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        var content = "";
        if (marker.infoWindowData) {
          var website_url = marker.infoWindowData.response.venue.url;
          var phone_number = marker.infoWindowData.response.venue.contact.formattedPhone;
          var street = marker.infoWindowData.response.venue.location.address;
          var city = marker.infoWindowData.response.venue.location.city;
          var state = marker.infoWindowData.response.venue.location.state;
          var postalCode = marker.infoWindowData.response.venue.location.postalCode;
          var country = marker.infoWindowData.response.venue.location.country;

          if (!website_url) {
            website_url = marker.infoWindowData.response.venue.canonicalUrl;
          }

          if (!phone_number) {
            phone_number = "Phone number not found.";
          }

          content = '<div id="title">' + marker.title +
          '</div><div><span class="label">Website:&nbsp;</span><span><a class="bold" href="' + 
           website_url +'">' + website_url + '</a></span></div>' +
          '<p><span class="label">Phone Number:&nbsp;</span><span>' + phone_number + '</span></p>' +
          '<p class="label">Address:</p>' +
          '<p class="address">'+ street + '</p>' +
          '<p class="address">' + city + ', ' + state + ' ' + postalCode + '</p>' +
          '<p class="address">'+ country + '</p>';
        }
        else {
          content = '<div id="title">' + marker.title + '</div><div>Could not load additional data from foursquare.</div>';
        }
      
        infowindow.setContent(content);
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

// Put in the year for copyright footer.
$("#year").html(new Date().getFullYear());

}
