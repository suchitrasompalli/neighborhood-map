/*jshint esversion: 6 */
/* ======= Model ======= */
// VenueId is required for each location so as to get data from Foursquare.
 const initialLocations = [
    {title: 'Palio\'s Pizza Cafe', location: {lat: 32.972557, lng: -96.994204}, venueId: '4af04e34f964a52021db21e3'},
    {title: 'Cici\'s Pizza', location: {lat: 32.968356, lng: -96.991926}, venueId: '4ba11085f964a520359437e3'},
    {title: 'Walgreens', location: {lat: 32.977036, lng: -96.994309}, venueId: '4bec8b1675b2c9b662ab438d'},
    {title: 'Sprouts supermarket', location: {lat: 32.970312, lng: -96.995428}, venueId: '4b993ac8f964a520ba6b35e3'},
    {title: 'Cottonwood Creek Elementary School', location: {lat: 32.9764, lng: -97.0074}, venueId: '4c61a20279d1e21ea72fd415'}
];

// Create a map variable
let map;
const allMarkers = [];


// This function will loop through any markers array and display them all.
function showMarkers(markers) {
    let bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        toggleBounce(markers[i], 4);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function will loop through markers and hide them all.
function hideMarkers(markers) {
    for (let i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
    }
}

/* This function will apply the filter to the list of markers and update the map
 with the new list of mappers. */
function updateMarkers(filter) {
    hideMarkers(allMarkers);
    let currentMarkers = [];
    filter = filter.toLowerCase();
    if(!filter) {
        currentMarkers = allMarkers;
    } else {
        allMarkers.forEach(function(marker) {
            if (marker.title.toLowerCase().includes(filter)) {
                currentMarkers.push(marker);
            }
        });
    }
    showMarkers(currentMarkers);
}

// Return the marker that matches the title.
function getMarker(markers, title) {
    let match = markers.find(function(marker) {
        return marker.title === title;
    });
    return match;
}

// Toggles the bouncing on marker in the ui based on number of bounces required.
function toggleBounce(marker, number_of_bounces) {
    // setting bounce_time so that bounce occurs only twice.
    // bounce_time = (Number of bounces required x 700)
    let bounce_time = 700 * number_of_bounces;
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, bounce_time);
    }
}

/* This function takes in a COLOR, and then creates a new marker
 icon of that color. The icon will be 21 px wide by 34 high, have an origin
 of 0, 0 and be anchored at 10, 34). */
function makeMarkerIcon(markerColor) {
    let markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

// Make a Ajax call to FourSquare and get unique information for each marker.
function getFourSquareData(marker) {
    const CLIENT_ID = "FGYXHLBLXZYPHXUPWZNCXYFLJQ5RW51D2P2HYSD4O43BBGOZ";
    const CLIENT_SECRET = "HPC3VD5FI4LEFEJ4DSPR4MX32K2HZTC1IVMU2UXFOAN4OSMU";
    const BASE_URL = "https://api.foursquare.com/v2/venues/";

    const version = "&v=20180101";
    const params = "?client_id="+ CLIENT_ID + "&client_secret=" + CLIENT_SECRET + version;

    let url = BASE_URL + marker.venueId + params;
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

// When the hamburger icon is clicked on the UI, hide/display the list view and also change the map left margin.
function toggleDisplaySettings() {
    let view = document.getElementById('listView');
    if (view.style.display === "none") {
        view.style.display = "block";
        $("#map").removeClass("map-margin-full");
        $("#map").addClass("map-margin-default");
    }
    else {
        view.style.display = "none";
        $("#map").removeClass("map-margin-default");
        $("#map").addClass("map-margin-full");
    }
}

// Checks if storage (localStorage or SessionStorage) is available to use.
function storageAvailable(type) {
    try {
        let storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.getItem(x,x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
}

// handles any script tag error while loading google maps api.
function handleScriptError() {
    alert("Error in loading Google Maps api");
}

// Call back function that inititializes the map with Coppell, Dallas as center.
function initMap() {

    // Create a styles array to use with the map. The code has been customized from one of the styles thas
    // was available on Snazzy Maps.
    let styles = [
        {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#444444"
                }
            ]
        },
        {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text",
        "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "weight": "4.29"
                },
                {
                    "hue": "#ff0043"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#f2f2f2"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "poi.attraction",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi.business",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi.government",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi.medical",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "poi.school",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "hue": "#ff0030"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit.station.airport",
            "elementType": "labels",
            "stylers": [
                {
                "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#46bcec"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        }

    ];

    try {
          // use a constructor to create a new map JS object.
          map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 32.954569, lng: -97.015008},
                zoom: 18,
                mapTypeControl: true,
                styles: styles,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.TOP_CENTER
                },
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                scaleControl: true,
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                fullscreenControl: true
            });
        }
    catch(error) {
        alert("google map could not be loaded due to " + error);
    }


    var ViewModel = function() {

        let self = this;

        // Clicking on Hamburger icon changes the display, toggles between hiding and showing of list view.
        this.shouldShowListView = ko.observable(true);

        // Code for localStorage/sessionStorage.
        if (storageAvailable('localStorage'))  {
            // check if there is a filter saved from previous sessionStorage
            if (window.localStorage.getItem("filter") !== null) {
                this.filter = ko.observable(window.localStorage.getItem("filter"));
            }
            else {
                this.filter = ko.observable("");
            }
        }
        else {
            this.filter = ko.observable("");
        }

        // Style the markers. This will be our listing marker icon.
        let defaultIcon = makeMarkerIcon('0091ff');

        // Create a "highlighted location" marker color for when the user
        // mouses over the marker.
        let highlightedIcon = makeMarkerIcon('FFFF24');

        let infowindow = new google.maps.InfoWindow();

        initialLocations.forEach(function(item, i) {

            // Get the position from the location array.
            let position = item.location;
            let title = item.title;
            let venueId = item.venueId;

            // Create a marker per location, and put ino markers array.
            try {
                let marker = new google.maps.Marker({
                    position: position,
                    title: title,
                    icon: defaultIcon,
                    venueId: venueId,
                    animation: google.maps.Animation.DROP,
                    id: i
                });

                // preload the content we need in information window from four square.
                // the other choice is to load the information only when user clicks on marker.
                getFourSquareData(marker);

                // Push the marker to our array of markers.
                allMarkers.push(marker);

                // Create an onclick event to open the infowindow at each marker.
                marker.addListener('click', function() {
                    populateInfoWindow(this, infowindow);
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

  // the locations on display in list will be computed based on what the current filter is.
  this.locations = ko.computed(function() {
      let filter = self.filter().toLowerCase();
      if (storageAvailable('localStorage'))  {
          // Save the filter that will be used for display on the ui.
          window.localStorage.setItem("filter", filter);
      }
      // first update markers based on the filter provided.
      updateMarkers(filter);
      if (!filter) {
            return initialLocations;
      }
      else {
          let filtered_results = [];
          initialLocations.forEach(function(location) {
              if (location.title.toLowerCase().includes(filter)) {
                  filtered_results.push(location);
              }
          });
          return filtered_results;
      }
    });

    /* This function populates the infowindow when the marker is clicked. We'll only allow
    one infowindow which will open at the marker that is clicked, and populate based
    on that markers position. */
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {

            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            let content = "";

            if (marker.infoWindowData) {

                let venue = marker.infoWindowData.response.venue;

                let website_url = venue.url ? venue.url: venue.canonicalUrl;
                let phone_number = venue.contact.formattedPhone ? venue.contact.formattedPhone : "Phone number not found.";
                let street = venue.location.address;
                let city = venue.location.city;
                let state = venue.location.state;
                let postalCode = venue.location.postalCode;
                let country = venue.location.country;

                content = `<div id="title">${marker.title}</div>
                           <div>
                                <span class="label">Website: </span>
                                <span><a class="bold" href="${website_url}">${website_url}</a></span>
                            </div>
                            <p>
                               <span class="label">Phone Number: </span>
                               <span>${phone_number}</span>
                            </p>
                            <p class="label">Address:</p>
                            <p class="address">${street}</p>
                            <p class="address">${city}, ${state} ${postalCode}</p>
                            <p class="address">${country}</p>`;
            }
            else {
                    content = `<div id="title">${marker.title}</div>
                                <div>Could not load additional data from foursquare.</div>`;
            }

            infowindow.setContent(content);
            toggleBounce(marker, 4);
            infowindow.open(map, marker);
        }
    }

        this.openMarkerInfoWindow = function(location) {
            let currentMarker = getMarker(allMarkers, location.title);
            populateInfoWindow(currentMarker, infowindow);
        };

        //
        this.toggleDisplay = function() {
            if (self.shouldShowListView())
                self.shouldShowListView(false);
            else
                self.shouldShowListView(true);
        };

    };

    let viewModel = new ViewModel();
    showMarkers(allMarkers);

    // when list view is been displayed in ui, display map with a left margin.
    viewModel.mapMargin = ko.pureComputed(function() {
        return this.shouldShowListView() ? "map-margin-default" : "map-margin-full";
    }, viewModel);

    ko.applyBindings(viewModel);
}
