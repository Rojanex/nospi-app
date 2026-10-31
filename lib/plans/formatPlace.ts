import { Place } from 'react-native-google-places-textinput'

const PUBLIC_TYPES = [
  'establishment', 'point_of_interest', 'park', 'restaurant',
  'bar', 'cafe', 'tourist_attraction', 'stadium', 'gym',
  'shopping_mall', 'museum', 'church', 'lodging',
]

const RESIDENTIAL_TYPES = [
  'street_address', 'premise', 'subpremise', 'route',
]

const NEIGHBORHOOD_TYPES = [
  'neighborhood',
  'sublocality_level_1',
  'sublocality',
  'administrative_area_level_3',
] as const

type AddressComponent = {
  longText?: string
  shortText?: string
  long_name?: string
  short_name?: string
  types?: string[]
}

export type ParsedPlace = {
  locationName: string
  locationPlaceId: string
  locationLat: number | null
  locationLng: number | null
  locationIsPublic: boolean | null
}

function addressComponentName(component: AddressComponent): string | null {
  return component.longText ?? component.short_name ?? component.long_name ?? component.shortText ?? null
}

function placeDisplayName(place: Place): string {
  const displayName = place.details?.displayName
  if (typeof displayName === 'string') return displayName
  if (
    typeof displayName === 'object' &&
    displayName !== null &&
    'text' in displayName &&
    typeof (displayName as { text: string }).text === 'string'
  ) {
    return (displayName as { text: string }).text
  }
  return place.structuredFormat.mainText.text
}

function placeNeighborhood(place: Place): string | null {
  const components = place.details?.addressComponents
  if (!Array.isArray(components)) return null

  for (const type of NEIGHBORHOOD_TYPES) {
    const match = components.find(
      (component: AddressComponent) =>
        Array.isArray(component.types) && component.types.includes(type),
    )
    if (match) {
      const name = addressComponentName(match)
      if (name) return name
    }
  }
  return null
}

export function formatPlaceDescription(place: Place): string {
  const name = placeDisplayName(place)
  const neighborhood = placeNeighborhood(place)
  return neighborhood ? `${name}, ${neighborhood}` : name
}

export function isPrivatePlace(types: string[]): boolean {
  const isPublic = types.some(t => PUBLIC_TYPES.includes(t))
  const isResidential = types.some(t => RESIDENTIAL_TYPES.includes(t))
  return !isPublic && isResidential
}

export function parsePlaceSelection(place: Place): ParsedPlace {
  const location = place.details?.location as
    | { latitude?: number; longitude?: number; lat?: number; lng?: number }
    | undefined
  const types = (place.details?.types ?? place.types ?? []) as string[]

  return {
    locationName: formatPlaceDescription(place),
    locationPlaceId: place.placeId,
    locationLat: location?.latitude ?? location?.lat ?? null,
    locationLng: location?.longitude ?? location?.lng ?? null,
    locationIsPublic: isPrivatePlace(types) ? false : true,
  }
}
