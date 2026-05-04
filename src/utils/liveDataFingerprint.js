/**
 * Stable string for comparing area-sensor-state API payloads (ignores object identity).
 * When unchanged, UI can skip setState.
 */
export function sensorPackageFingerprint(apiResponse) {
  if (!apiResponse || typeof apiResponse !== 'object') return '';
  const state = apiResponse.data ?? apiResponse;
  const pump = apiResponse.pumpData;
  const wl = state?.waterLevel ?? state?.WaterLevel;
  return JSON.stringify({
    areaId: state?.areaId,
    ph: state?.ph,
    tds: state?.tds,
    turbidity: state?.turbidity,
    status: state?.status,
    cleanValve: state?.cleanValve,
    dirtyValve: state?.dirtyValve,
    waterLevel: wl != null ? String(wl).trim() : '',
    updatedAtUtc: state?.updatedAtUtc,
    pumpData: pump,
  });
}

export function filterAlertFingerprint(data) {
  if (data == null) return 'null';
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}
