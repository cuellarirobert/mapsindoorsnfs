import { getAvailabilityListInTimeRange } from '../../services/nfsApiClient/apiClient.js';
import { miMapElement } from '../../main.js';



export let selectedDate = null;

  // Set initial value of selectedDate
  if (!selectedDate) {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    selectedDate = formattedDate;
  }

// Availability calendar form default
export let allBookableLocationIds = null;

export function toZulu(dateObj) {
  const localOffset = dateObj.getTimezoneOffset();
  console.log(localOffset);
  const zuluDate = new Date(dateObj.getTime() - localOffset);
  return zuluDate.toISOString().slice(0, -1) + 'Z';
}

export async function updateSelectedDate() {
  const dateInput = document.getElementById('bookingDate');
  if (!selectedDate) {
    const now = new Date();
    const currentDate = now.toISOString().substring(0, 10);
    dateInput.value = currentDate;
  }
  selectedDate = dateInput.value;
  console.log('Selected date:', selectedDate);

  // Calculate the desired start and end times
  const startTime = new Date(`${selectedDate}T${document.getElementById('startTime').value}`);
  const endTime = new Date(`${selectedDate}T${document.getElementById('endTime').value}`);

  // Get the resource ID lists
  const resourceIds = await getAvailabilityListInTimeRange(startTime, endTime);
  console.log('Resource IDs:', resourceIds);

  // Call the showMeetingRoomAvailability function with the fetched lists
  await showMeetingRoomAvailability(resourceIds.availableResources);
}

export async function updateSelectedDateOnClick() {
  await updateSelectedDate();
}




export function pad(num) {
  return num.toString().padStart(2, '0');
}

export function toLocalTimeString(dateObj) {
  const hours = pad(dateObj.getHours());
  const minutes = pad(dateObj.getMinutes());
  return `${hours}:${minutes}`;
}

export function setDefaultTimes() {
  const now = new Date();
  const roundedMinutes = Math.floor(now.getMinutes() / 30) * 30;
  const currentHalfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), roundedMinutes);
  const nextHalfHour = new Date(currentHalfHour.getTime() + 30 * 60 * 1000);

  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');

  const dateInput = document.getElementById('bookingDate');
  // Get the current date in the local time zone
  const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  dateInput.value = currentDate;

  selectedDate = dateInput.value;

  startTimeInput.value = toLocalTimeString(currentHalfHour);
  endTimeInput.value = toLocalTimeString(nextHalfHour);
  console.log(currentDate);
}

updateSelectedDate();

setDefaultTimes();



export async function showMeetingRoomAvailability(availableResources) {


  // Get the MapsIndoors instance
  const mapsIndoorsInstance = await miMapElement.getMapsIndoorsInstance();

  async function getLocationsByExternalIds(resourceArray) {
    if (Array.isArray(resourceArray) && resourceArray.length) {
      const promises = resourceArray.map(id => mapsindoors.services.LocationsService.getLocationsByExternalId(id));
      const locationsArray = await Promise.all(promises);
      return locationsArray.flat();
    }
    return [];
  }
  

  // Get MapsIndoors locations for each set of resources
// Get MapsIndoors locations for each set of resources
const availableLocations = await getLocationsByExternalIds(availableResources.availableResources);
const reservedLocations = await getLocationsByExternalIds(availableResources.reservedResources);
const unavailableLocations = await getLocationsByExternalIds(availableResources.unavailableResources);


// Separate locations by type
const availableMeetingRooms = availableLocations.filter(location => location.properties.type === 'MeetingRoom');
const availableWorkstations = availableLocations.filter(location => location.properties.type === 'Workstation');

const reservedMeetingRooms = reservedLocations.filter(location => location.properties.type === 'MeetingRoom');
const reservedWorkstations = reservedLocations.filter(location => location.properties.type === 'Workstation');

const unavailableMeetingRooms = unavailableLocations.filter(location => location.properties.type === 'MeetingRoom');
const unavailableWorkstations = unavailableLocations.filter(location => location.properties.type === 'Workstation');

// Get the MapsIndoors location IDs for each set of locations
const availableMeetingRoomIds = availableMeetingRooms.map(location => location.id);
const availableWorkstationIds = availableWorkstations.map(location => location.id);

const reservedMeetingRoomIds = reservedMeetingRooms.map(location => location.id);
const reservedWorkstationIds = reservedWorkstations.map(location => location.id);

const unavailableMeetingRoomIds = unavailableMeetingRooms.map(location => location.id);
const unavailableWorkstationIds = unavailableWorkstations.map(location => location.id);

// Apply display rules for MeetingRoom type locations
mapsIndoorsInstance.setDisplayRule(availableMeetingRoomIds, { 
    polygonVisible: true,
    polygonFillOpacity: 1,
    polygonZoomFrom: 16,
    polygonZoomTo: 22,
    visible: true,
    polygonFillColor: "#90ee90",
  });

  // Apply display rules for reserved locations
  mapsIndoorsInstance.setDisplayRule(reservedMeetingRoomIds, {
    polygonVisible: true,
    polygonFillOpacity: 1,
    polygonZoomFrom: 16,
    polygonZoomTo: 22,
    visible: true,
    polygonFillColor: "#ffcc00",
  });

  // Apply display rules for unavailable locations
  mapsIndoorsInstance.setDisplayRule(unavailableMeetingRoomIds, {
    polygonVisible: true,
    polygonFillOpacity: 1,
    polygonZoomFrom: 16,
    polygonZoomTo: 22,
    visible: true,
    polygonFillColor: "#ff4d4d",
  });


// Apply display rules for Workstation type locations
mapsIndoorsInstance.setDisplayRule(availableWorkstationIds, {
  model3DVisible: true,
  model3DModel: 'https://media.mapsindoors.com/74ac1da5c2324be5b634b9fa/media/workstation-standard-free.glb',
  model3DZoomFrom: 16,
  model3DZoomTo: 22,
  visible: true,
});

mapsIndoorsInstance.setDisplayRule(reservedWorkstationIds, {
  model3DVisible: true,
  model3DModel: 'https://media.mapsindoors.com/74ac1da5c2324be5b634b9fa/media/workstation-standard-occupied.glb',
  model3DZoomFrom: 16,
  model3DZoomTo: 22,
  visible: true,
});

mapsIndoorsInstance.setDisplayRule(unavailableWorkstationIds, {
  model3DVisible: true,
  model3DModel: 'https://media.mapsindoors.com/74ac1da5c2324be5b634b9fa/media/workstation-standard-occupied.glb',
  model3DZoomFrom: 16,
  model3DZoomTo: 22,
  visible: true,
});


}

// document.getElementById('submit').addEventListener('click', updateSelectedDateOnClick);
document.getElementById('availabilitySubmit').addEventListener('click', updateSelectedDateOnClick);
