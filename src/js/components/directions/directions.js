import { getRoute} from './getRoute.js';
import { search } from './directionSearch.js';
import { miDirectionsRendererInstance } from '../../main.js';


let currentOriginLocation;
let currentDestinationLocation;
let currentLegIndex = 0;
let currentStepIndex = 0;

export async function initializeDirections(mapInstance, mapsIndoorsInstance, originSearchElement, destinationSearchElement, originListElement, destinationListElement, placeSearchElement, placeSearchlist, retrieveDataButton) {

  let transportationValue;

  // Add search functionality to origin and destination input fields
  search(originSearchElement, originListElement, mapsIndoorsInstance, mapInstance);
  search(destinationSearchElement, destinationListElement, mapsIndoorsInstance, mapInstance);

  // Add event listeners to transportation buttons
  const walkingButton = document.getElementById("walking");
  const drivingButton = document.getElementById("driving");
  const bicyclingButton = document.getElementById("bicycling");
  const publicButton = document.getElementById("public");
  const nextStepButton = document.getElementById("next");
  const previousStepButton = document.getElementById("previous");




  walkingButton.addEventListener('click', () => {
    transportationValue = "WALKING";
    setActiveTransportationButton(walkingButton, walkingButton, drivingButton, bicyclingButton, publicButton);
  });

  drivingButton.addEventListener('click', () => {
    transportationValue = "DRIVING";
    setActiveTransportationButton(drivingButton, walkingButton, drivingButton, bicyclingButton, publicButton);
  });

  bicyclingButton.addEventListener('click', () => {
    transportationValue = "BICYCLING";
    setActiveTransportationButton(bicyclingButton, walkingButton, drivingButton, bicyclingButton, publicButton);
  });

  publicButton.addEventListener('click', () => {
    transportationValue = "PUBLIC";
    setActiveTransportationButton(publicButton, walkingButton, drivingButton, bicyclingButton, publicButton);
  });

  // Set up event listeners for Next and Previous buttons
  nextStepButton.addEventListener('click', () => {
    console.log('clicked next step');
    nextStep(miDirectionsRendererInstance);
  });

  previousStepButton.addEventListener('click', () => {
    previousStep(miDirectionsRendererInstance);
  });


}

export function setActiveTransportationButton(activeButton, walkingButton, drivingButton, bicyclingButton, publicButton) {
  // Remove the "active" class from all transportation buttons
  walkingButton.classList.remove("active");
  drivingButton.classList.remove("active");
  bicyclingButton.classList.remove("active");
  publicButton.classList.remove("active");
  
  // Add the "active" class to the selected transportation button
  activeButton.classList.add("active");
}

async function nextStep(miDirectionsRendererInstance) {
  miDirectionsRendererInstance.nextLeg();
}


async function previousStep(miDirectionsRendererInstance) {
  miDirectionsRendererInstance.previousLeg();
}



