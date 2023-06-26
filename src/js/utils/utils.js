import { showDirectionsBtn } from '../main.js';


export let popups = [];


export const getCoords = location => {
  if (location.geometry.type === 'Polygon') {
    return location.properties.anchor.coordinates;
  } else if (location.geometry.type === 'Point') {
    return location.geometry.coordinates;
  }
};


export const handleLocationClick = async (location, mapsIndoorsInstance, mapInstance) => {

  document.getElementById('close-btn').addEventListener('click', function() {
    setTimeout(function() {
        document.getElementById('info-overlay').style.visibility = 'hidden';
    }, 200);
});

    // Store the previous display rule
    let previousDisplayRule = mapsIndoorsInstance.getDisplayRule(location);

    // Hide the image and book button by default
    document.getElementById('info-image').style.display = 'none';
    document.getElementById('btn-book').style.display = 'none';

    document.getElementById('info-title').textContent = location.properties.name;

    if (location.properties.type === 'MeetingRoom') {
        document.getElementById('info-image').src = location.properties.imageURL;
        document.getElementById('info-image').alt = location.properties.description;
        document.getElementById('info-image').style.display = 'block';
    } else if (location.properties.type === 'Workstation') {
        // if the type is Workstation
        document.getElementById('btn-book').style.display = 'block';
        document.getElementById('btn-book').addEventListener('click', () => {
            bookResource(mapsIndoorsInstance, location.id);
        });
    }

    // Set the action for the Set as Destination button
    document.getElementById('btn-destination').addEventListener('click', () => {
        const destinationInput = document.getElementById('destination-input');
        document.getElementById('info-overlay').style.visibility = 'hidden';
        destinationInput.value = location.properties.name;
        showDirectionsBtn.click();
    });

    // Show the info overlay
    document.getElementById('info-overlay').style.visibility = 'visible';
};

// Hide the info overlay when the close button is clicked
document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('info-overlay').style.visibility = 'hidden';
});



// Function to handle booking the resource
const bookResource = (mapsIndoorsInstance, locationId) => {
  // Your code to book the resource goes here
  console.log('Booking resource:', locationId);

  mapsIndoorsInstance.setDisplayRule(locationId, {
    model3DVisible: true,
    model3DModel: 'https://media.mapsindoors.com/c95848ca42714318895ef2b1/media/workstation-occupied-.glb',
    model3DZoomFrom: 16,
    model3DZoomTo: 22,
    visible: true,
  });
};



