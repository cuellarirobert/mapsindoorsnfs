import { miMapElement, miDirectionsServiceInstance, mapInstance } from '../../main.js';



// import * as turf from '@turf/turf';

function getAnchorCoordinates(location) {
  return location.geometry.type.toLowerCase() === 'point' ?
    { lat: location.geometry.coordinates[1], lng: location.geometry.coordinates[0], floor: location.properties.floor } :
    { lat: location.properties.anchor.coordinates[1], lng: location.properties.anchor.coordinates[0], floor: location.properties.floor };
}


export function getRoute(originLocation, destinationLocation, transportationValue) {
  const originLocationCoordinates = getAnchorCoordinates(originLocation);
  const destinationLocationCoordinates = getAnchorCoordinates(destinationLocation);

  // Route parameters
  const routeParameters = {
    origin: originLocationCoordinates,
    destination: destinationLocationCoordinates,
    travelMode: transportationValue
  };

  console.log(routeParameters);

  // Get route from directions service
  return miDirectionsServiceInstance.getRoute(routeParameters);
}