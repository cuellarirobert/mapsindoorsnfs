export let currentOriginLocation = null;
export let currentDestinationLocation = null;




export function search(miSearchElement, miListElement, mapsIndoorsInstance, mapInstance) {
  // console.log(miSearchElement)
  // console.log('directions search initialized');
   miSearchElement.addEventListener('results', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;

    // Append new search results
    event.detail.forEach(location => {
      const miListItemElement = document.createElement('mi-list-item-location');
    location.properties.imageURL = mapsIndoorsInstance.getDisplayRule(location).icon
      miListItemElement.location = location;


      miListElement.appendChild(miListItemElement);
    });
  });

  miSearchElement.addEventListener('cleared', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;
  });

  // Add click listener to mi-list element
  miListElement.addEventListener('click', (event) => {
    // Get the selected location
    const selectedLocation = event.target.location;

    // Do something with the selected location, for example:
    console.log('Selected location:', selectedLocation);

    // Check if the event was triggered from origin or destination search
    if (miSearchElement.id === 'origin-input') {
      currentOriginLocation = selectedLocation;
    } else if (miSearchElement.id === 'destination-input') {
      currentDestinationLocation = selectedLocation;
    }

    // Set the selected location text as the value of the search box
    miSearchElement.setAttribute('value', selectedLocation.properties.name);
    miListElement.style.display = 'none';
  });

  miSearchElement.addEventListener('input', () => {
    miListElement.style.display = 'block';
  });
}
