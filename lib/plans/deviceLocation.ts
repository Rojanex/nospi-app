import * as Location from 'expo-location'

export async function getFreshDeviceCoords(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') return null

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }
  } catch {
    return null
  }
}
