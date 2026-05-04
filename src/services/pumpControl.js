import { apiRequest } from '../config/api';

/**
 * Logs a control action. `deviceId` is the area id string ("1", "2", …) for pump resolution.
 */
export async function postControlAction(token, areaId, action, triggeredBy = 'app') {
  return apiRequest('/api/controlactions', {
    token,
    method: 'POST',
    body: {
      deviceId: String(areaId),
      action,
      triggeredBy,
    },
  });
}
