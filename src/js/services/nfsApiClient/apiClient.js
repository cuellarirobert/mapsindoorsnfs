function toISOStringWithoutMilliseconds(date) {
  return date.toISOString().slice(0, 19);
}

function isResourceAvailable(blockedResourceTimings, resourceId) {
  for (const blockedResource of blockedResourceTimings) {
    if (blockedResource.ResourceId === resourceId) {
      return false;
    }
  }
  return true;
}



const api_url = 'https://wscloud3.nfsonline.net/POC3API/token';
const username = import.meta.env.VITE_NFS_USERNAME;
const password = import.meta.env.VITE_NFS_PASS;



let accessToken = null;
let tokenExpiration = null;

export async function getAccessToken() {
  if (accessToken && tokenExpiration && new Date() < tokenExpiration) {
    console.log('Returning existing access token');
    return accessToken;
  }

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const url = api_url;
  const payload = {
    username: username,
    password: password,
    grant_type: 'password',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(payload),
    });

    if (!response.ok) {
      throw new Error(`Error fetching access token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data['access_token'];
    tokenExpiration = new Date(Date.now() + (data['expires_in'] * 1000) - 60000); // subtract 1 minute for safety

    return accessToken;
  } catch (error) {
    console.error(error);
    return null;
  }
}



export async function getAvailabilityListInTimeRange(start_time, end_time) {
  const access_token = await getAccessToken();

  if (!access_token) {
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
  };

  // console.log('Start time:', start_time, 'ISO string:', new Date(start_time).toISOString());
  // console.log('End time:', end_time, 'ISO string:', new Date(end_time).toISOString());

  const url = 'https://wscloud3.nfsonline.net/POC3API/api/Resource/AvailableResources';

  const payload = {
    "RoleId": '15986200-e775-483d-b8ae-a34b325c398e',
    "StartDate": toISOStringWithoutMilliseconds(new Date(start_time)),
    "EndDate": toISOStringWithoutMilliseconds(new Date(end_time)),
    "TimeZoneInfoId": "GMT Standard Time",
    "Locale": "en-US",
    "UITypeId": "80df9f2f-d1b8-4fe1-b2d6-b9328856ed45",
    
    "WorkspaceCriteriaList": [
    // rooms
        {
            "PropertyId": '0136e4d8-b667-48d5-97ed-4bc8c04b3cfe',
            "ResourceTypeId": 'cfbc3fde-06c1-4e85-9a6a-a8fb718715db',
            "Capacity": 1
        },
                {
            "PropertyId": '0136e4d8-b667-48d5-97ed-4bc8c04b3cfe',
            "ResourceTypeId": '6f7ca07a-7b31-47f9-b20f-2aa2b775709f',
            "Capacity": 1
        },
                    
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error fetching availability list: ${response.statusText}`);
    }

    const data = await response.json();

    // Process the data to create available, reserved, and unavailable resource ID lists
    const resourceIds = parseResponse(JSON.stringify(data));
    console.log(resourceIds);

    // Return the object containing all three lists
    return resourceIds;
  } catch (error) {
    console.error(error);
    return null;
  }
}


function parseResponse(response) {
  const data = JSON.parse(response);

  const allResources = data.AllResources;
  const blockedResourceTimings = data.BlockedResourceTimings;

  const availableResources = [];
  const reservedResources = [];
  const unavailableResources = [];

  allResources.forEach((resource) => {
    const resourceId = resource.ResourceId;
    let isBlocked = false;

    blockedResourceTimings.forEach((blockedResource) => {
      if (resourceId === blockedResource.ResourceId) {
        isBlocked = true;
        reservedResources.push(resourceId);
      }
    });

    if (!isBlocked) {
      availableResources.push(resourceId);
    }
  });

  unavailableResources.push(...reservedResources);

  return {
    availableResources,
    reservedResources,
    unavailableResources,
  };
}
