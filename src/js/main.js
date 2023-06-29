
// import '../css/v4style.css';

// import {
//     defineCustomElements
// } from '../../node_modules/@mapsindoors/components/dist/esm/loader.js';

import {
    defineCustomElements
} from 'https://www.unpkg.com/@mapsindoors/components/dist/esm/loader.js';



import {
    search,
    currentOriginLocation,
    currentDestinationLocation
} from './components/directions/directionSearch.js';

import {
    setActiveTransportationButton,
    initializeDirections
} from './components/directions/directions.js';

import {
    placeSearch
} from './components/locationSearch/placeSearch.js';

import {
    getRoute
} from './components/directions/getRoute.js';
import {
    getAccessToken,
    getAvailabilityListInTimeRange
} from './services/nfsApiClient/apiClient.js';
import {
    getCoords,
    handleLocationClick,
    popups
} from './utils/utils.js';
import {
    updateSelectedDate,
    pad,
    toLocalTimeString,
    setDefaultTimes,
    toZulu,
    showMeetingRoomAvailability,
    selectedDate,
    allBookableLocationIds
} from './components/availability/availabilityLogic.js';

document.addEventListener("DOMContentLoaded", function(event) { 
    const mapboxElement = document.querySelector('mi-map-mapbox');
    if (mapboxElement) {
        mapboxElement.setAttribute('access-token', import.meta.env.VITE_MAPBOX_TOKEN);
        mapboxElement.setAttribute('mi-api-key', import.meta.env.VITE_MAPSINDOORS_API_KEY);
    }
});


defineCustomElements();

export const miMapElement = document.querySelector('mi-map-mapbox');
const originSearchElement = document.querySelector('#origin-input');
const originListElement = document.querySelector('#origin-list');
const destinationSearchElement = document.querySelector('#destination-input');
const destinationListElement = document.querySelector('#destination-list');

const placeSearchElement = document.querySelector('#search-input');
const placeSearchlist = document.querySelector('#search-list');

const searchShowDirectionsContainer = document.querySelector(".search-and-actions-container");

export let miDirectionsServiceInstance;
export let miDirectionsRendererInstance;
const goBackButton = document.getElementById("go-back");



export let mapInstance = null
export let mapsIndoorsInstance = null
export let myDirectionsResult = null

let transportationValue = null


const showAvailabilityBtn = document.getElementById('show-availability-btn');
const availabilityWidgetParentContainer = document.querySelector('.availability-widget-parent-container');
const availabilityGoBackButton = document.getElementById('availability-go-back');


export const showDirectionsBtn = document.getElementById('show-directions-btn');
const controlsContainer = document.querySelector('.controls-container');


let venueDefaultBearing = null
let venueDefaultLat = null
let venueDefaultLng = null
let venueDefaultPitch = null
let venueDefaultZoom = null

let desiredVenueName = "Stigsborgvej"

const nextStepButton = document.getElementById("next");
const previousStepButton = document.getElementById("previous");
// console.log(nextStepButton);
// console.log(previousStepButton);


// Wait for the window to load completely
window.addEventListener('load', function() {
    // Get a reference to the splash screen element
    const splashScreen = document.getElementById('splash-screen');

    // Set a timer to hide the splash screen after a certain amount of time (e.g., 3 seconds)
    setTimeout(function() {
        // Add a class to fade out the splash screen (optional)
        splashScreen.style.opacity = '0';

        // After the fade-out effect is complete, hide the splash screen completely
        setTimeout(function() {
            splashScreen.style.display = 'none';
        }, 700); // Match the duration of the CSS transition
    }, 10000); // Change the duration to your preference
});




miMapElement.addEventListener('mapsIndoorsReady', async () => {

    try {
        mapInstance = await miMapElement.getMapInstance();
        // const accessToken = await getAccessToken();

        // Get the MapsIndoors instance directly from the miMapElement
        mapsIndoorsInstance = await miMapElement.getMapsIndoorsInstance();
        miMapElement.polygonHighlightOptions = null;
        mapsIndoorsInstance.setBuildingOutlineOptions({
            strokeColor: '#000000'
        })
        mapsIndoorsInstance.setDisplayRule(['MI_BUILDING', 'MI_VENUE'], {
            visible: false
        });
        placeSearch(placeSearchElement, placeSearchlist, mapsIndoorsInstance, mapInstance);




        miMapElement.getDirectionsServiceInstance().then((directionsServiceInstance) => {
            miDirectionsServiceInstance = directionsServiceInstance;

            miMapElement.getDirectionsRendererInstance()
                .then((directionsRendererInstance) => miDirectionsRendererInstance = directionsRendererInstance);
            // main.js
            const retrieveDataButton = document.getElementById("retrieve-data-button");

            initializeDirections(mapInstance, mapsIndoorsInstance, originSearchElement, destinationSearchElement, originListElement, destinationListElement, placeSearchElement, placeSearchlist);

            retrieveDataButton.addEventListener('click', async () => {
                try {
                    console.log(currentOriginLocation, currentDestinationLocation, transportationValue);
                    const directionsResult = await getRoute(currentOriginLocation, currentDestinationLocation, transportationValue);
                    miDirectionsRendererInstance.setRoute(directionsResult);

                    popups.forEach(popup => {
                        popup.remove();
                    });
                    // Clear the popups array
                    popups.length = 0


                } catch (error) {
                    // Handle error
                }
            });

        showDirectionsBtn.addEventListener('click', () => {
            routingscreen.style.display = 'grid';
            searchactionsscreen.style.display = 'none';
        });

        goBackButton.addEventListener('click', () => {
            routingscreen.style.display = 'none';
            searchactionsscreen.style.display = 'flex';
            availabilityscreen.style.display = 'none';
            if (mapInstance.getSource('route')) {
                mapInstance.removeLayer('route');
                mapInstance.removeSource('route');
            }
            miDirectionsRendererInstance.setVisible(false)
        });

showAvailabilityBtn.addEventListener('click', () => {
  searchactionsscreen.style.display = 'none';
  availabilityscreen.style.display = 'block';
});


        availabilityGoBackButton.addEventListener('click', () => {
            availabilityscreen.style.display = 'none';
            searchactionsscreen.style.display = 'flex';
        });



        });




        // document.getElementById('bookingDate').addEventListener('change', updateSelectedDate);

        const form = document.querySelector('form');



        form.addEventListener('submit', async (event) => {
            console.log('hi');
            event.preventDefault(); // prevent the default form submission behavior


            // Get the selected start and end times
            const startTime = document.querySelector('#startTime').value;
            const endTime = document.querySelector('#endTime').value;

            if (!startTime || !endTime) {
                alert('Please select a start and end time');
                return;
            }

            // Convert the selected times to Date objects in CET
            const startTimeDate = new Date(selectedDate + 'T' + startTime + ':00');
            const endTimeDate = new Date(selectedDate + 'T' + endTime + ':00');
            if (endTimeDate <= startTimeDate) {
                endTimeDate.setDate(endTimeDate.getDate() + 1);
            }

            console.log('Selected startTime:', startTimeDate);
            console.log('Selected endTime:', endTimeDate);


            // Convert the start and end times to Zulu time
            const bookingStartTime = toZulu(startTimeDate);
            const bookingEndTime = toZulu(endTimeDate);

            console.log('Selected bookingStartTime:', bookingStartTime);
            console.log('Selected bookingEndTime:', bookingEndTime);




            // Call the BookingService to get the available meeting rooms
            try {
                const accessToken = await getAccessToken();
                const availabilityList = await getAvailabilityListInTimeRange(bookingStartTime, bookingEndTime, accessToken);
                showMeetingRoomAvailability(availabilityList, allBookableLocationIds);
            } catch (error) {
                console.error('Error retrieving bookings:', error);
            }


        });



        populateCategories();

        // Get the selected start and end times
        const accessToken = await getAccessToken();
        const startTime = document.querySelector('#startTime').value;
        const endTime = document.querySelector('#endTime').value;

        if (!startTime || !endTime) {
            alert('Please select a start and end time');
            return;
        }

        // Convert the selected times to Date objects in CET
        const startTimeDate = new Date(selectedDate + 'T' + startTime + ':00');
        const endTimeDate = new Date(selectedDate + 'T' + endTime + ':00');
        if (endTimeDate <= startTimeDate) {
            endTimeDate.setDate(endTimeDate.getDate() + 1);
        }

        console.log('Selected startTime:', startTimeDate);
        console.log('Selected endTime:', endTimeDate);


        // Convert the start and end times to Zulu time
        const bookingStartTime = toZulu(startTimeDate);
        const bookingEndTime = toZulu(endTimeDate);

        console.log('Selected bookingStartTime:', bookingStartTime);
        console.log('Selected bookingEndTime:', bookingEndTime);


        // Call the BookingService to get the available meeting rooms
        try {
            const availabilityList = await getAvailabilityListInTimeRange(bookingStartTime, bookingEndTime, accessToken);
            showMeetingRoomAvailability(availabilityList, allBookableLocationIds);
        } catch (error) {
            console.error('Error retrieving bookings:', error);
        }



        mapsindoors.services.VenuesService.getVenues().then((venues) => {
            const desiredVenue = venues.find((venue) => venue.name === desiredVenueName);
            if (desiredVenue) {
                mapsindoors.services.VenuesService.getVenue(desiredVenue.id).then((venue) => {
                    venueDefaultBearing = parseFloat(venue.venueInfo.fields.defaultBearing.value);
                    venueDefaultLat = parseFloat(venue.venueInfo.fields.defaultLat.value);
                    venueDefaultLng = parseFloat(venue.venueInfo.fields.defaultLng.value);
                    venueDefaultPitch = parseFloat(venue.venueInfo.fields.defaultPitch.value);
                    venueDefaultZoom = parseFloat(venue.venueInfo.fields.defaultZoom.value);
                    mapInstance.setZoom(venueDefaultZoom)
                    mapInstance.setCenter({
                        lat: venueDefaultLat,
                        lng: venueDefaultLng
                    });
                    mapInstance.setBearing(venueDefaultBearing);
                    mapInstance.setPitch(venueDefaultPitch);
                });

            }
        });

        mapsIndoorsInstance.addListener('click', location => {
        console.log('hi');
        console.log(location);
        handleLocationClick(location, mapsIndoorsInstance, mapInstance);
    });
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
};

let popup;

const handleMouseEnter = debounce((location) => {
    // If a popup exists, remove it
    if (popup) {
        popup.remove();
    }

    console.log('hi');
    console.log(location);

    const coords = getCoords(location);

    const infoWindowContent = `<h2>${location.properties.name}</h2>`;

    popup = new mapboxgl.Popup({ closeOnClick: true, closeButton: true, className: 'info-popup' })
        .setLngLat([coords[0], coords[1]])
        .setHTML(infoWindowContent)
        .addTo(mapInstance);
}, 250); // Debounce time is 250 milliseconds


mapsIndoorsInstance.addListener('mouseenter', handleMouseEnter);
mapsIndoorsInstance.addListener('mouseleave', handleMouseLeave);

        


        // Add routing functionality
    } catch (error) {
        console.error('MapsIndoors instance is not ready:', error);
    }

    


});




// categoriesLogic
function populateCategories() {
    mapsindoors.services.SolutionsService.getCategories().then(categories => {
        // console.log(categories)
        var option = '<option value="">Filter Locations</option>';
        for (let i = 0; i < categories.length; i++) {

            // console.log(categories[i])


            option += '<option value="' + categories[i].key + '">' + categories[i].value + "</option>"

        }
        document.getElementById('category').innerHTML = option;

        document.getElementById("category").addEventListener('change', function() {
            var selectedCategory = this.value;

            if (selectedCategory) {
                mapsindoors.services.LocationsService.getLocations({
                    categories: selectedCategory,
                    lr: 'en'
                }).then(locations => {

                    console.log(locations);
                    var locationIds = []
                    for (var i = 0; i < locations.length; i++) {
                        locationIds.push(locations[i].id);



                    }
                    mapsIndoorsInstance.filter(locationIds);
                });
            } else {
                mapsIndoorsInstance.filter(null);
            }
        });
    });
}
