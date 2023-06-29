import { showDirectionsBtn } from '../main.js';


export let popups = [];


export const getCoords = location => {
  if (location.geometry.type === 'Polygon') {
    return location.properties.anchor.coordinates;
  } else if (location.geometry.type === 'Point') {
    return location.geometry.coordinates;
  }
};



// Function to handle the click event on a location
export const handleLocationClick = async (location, mapsIndoorsInstance, mapInstance) => {

    // Store the previous display rule
    let previousDisplayRule = mapsIndoorsInstance.getDisplayRule(location);

    let overlay = document.getElementById('info-overlay');
    let infoImage = document.getElementById('info-image');
    let btnBook = document.getElementById('btn-book');
    let infoTitle = document.getElementById('info-title');
    let btnDestination = document.getElementById('btn-destination');

    // Hide the image and book button by default
    infoImage.style.display = 'none';
    btnBook.style.display = 'none';

    infoTitle.textContent = location.properties.name;

    if (location.properties.type === 'MeetingRoom') {
        infoImage.src = location.properties.imageURL;
        infoImage.alt = location.properties.description;
        infoImage.style.display = 'block';
    } else if (location.properties.type === 'Workstation') {
        // if the type is Workstation
        btnBook.style.display = 'block';
        btnBook.addEventListener('click', () => {
            bookResource(mapsIndoorsInstance, location.id);
        });
    }

    // Set the action for the Set as Destination button
    btnDestination.addEventListener('click', () => {
        const destinationInput = document.getElementById('destination-input');
        overlay.style.display = 'none';
        destinationInput.value = location.properties.name;
        showDirectionsBtn.click();
    });

    // Show the info overlay
    overlay.style.display = 'flex';
};

// Hide the info overlay when the close button is clicked
document.getElementById('close-btn').addEventListener('click', function() {
    let overlay = document.getElementById('info-overlay');
    overlay.style.display = 'none';
});

// Hide the info overlay when the 'escape' key is pressed
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    let overlay = document.getElementById('info-overlay');
    if (overlay.style.display === 'flex') {
      overlay.style.display = 'none';
    }
  }
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


// Get the elements
let container = document.querySelector("#ui-container");
let draggableElement = document.querySelector("#searchactionsscreen");  // You can change this selector to target the element you want to use as a "handle"

// Variables to store the initial positions
let initialX, initialY, offsetX = 0, offsetY = 0, active = false;

// Listen for the mousedown event
draggableElement.addEventListener("mousedown", (event) => {
  initialX = event.clientX - offsetX;
  initialY = event.clientY - offsetY;

  if (event.target === draggableElement) {
    active = true;
  }
});

// Listen for the mousemove event
document.addEventListener("mousemove", (event) => {
  if (active) {
    event.preventDefault();

    offsetX = event.clientX - initialX;
    offsetY = event.clientY - initialY;

    container.style.transform = "translate3d(" + offsetX + "px, " + offsetY + "px, 0)";
  }
});

// Listen for the mouseup event
document.addEventListener("mouseup", () => {
  initialX = offsetX;
  initialY = offsetY;
  active = false;
});

