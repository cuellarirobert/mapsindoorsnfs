
export function placeSearch(miSearchElement, miListElement, mapsIndoorsInstance, mapInstance) {
  // console.log('search initialized');
miSearchElement.addEventListener('results', (event) => {
  console.log(event);
    // Reset search results list
    miListElement.innerHTML = null;

    // Append new search results
    event.detail.forEach(location => {
      const miListItemElement = document.createElement('mi-list-item-location');
    location.properties.imageURL = mapsIndoorsInstance.getDisplayRule(location).icon
      miListItemElement.location = location;
      miListItemElement.showExternalId = false;



      miListElement.appendChild(miListItemElement);
    });





  });


  miSearchElement.addEventListener('cleared', (event) => {
    // Reset search results list
    miListElement.innerHTML = null;
    mapsIndoorsInstance.filter(null);
  });

  // Add click listener to mi-list element
  miListElement.addEventListener('click', (event) => {
    // Get the selected location
    const selectedLocation = event.target.location;
    mapsIndoorsInstance.setFloor(selectedLocation.properties.floor);
    mapInstance.setCenter(selectedLocation.properties.anchor.coordinates);
    mapInstance.setPitch(0);
    mapInstance.setZoom(20);
    mapsIndoorsInstance.filter(selectedLocation.id);

    // Do something with the selected location, for example:
    console.log('Selected location:', selectedLocation);



    

    // Set the selected location text as the value of the search box
    miSearchElement.setAttribute('value', selectedLocation.properties.name);
    miListElement.style.display = 'none';
  });

  miSearchElement.addEventListener('input', () => {
    miListElement.style.display = 'block';
  });
}
