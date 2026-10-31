import { City, State } from 'country-state-city'

export interface ColombianCity {
  city: string
  department: string
}

const DEPARTMENT_BY_CODE = Object.fromEntries(
  State.getStatesOfCountry('CO')!.map((s) => [s.isoCode, s.name]),
)

export const COLOMBIAN_CITIES: ColombianCity[] = City.getCitiesOfCountry('CO')!
  .map((c) => ({
    city: c.name,
    department: DEPARTMENT_BY_CODE[c.stateCode] ?? c.stateCode,
  }))
  .sort((a, b) => a.city.localeCompare(b.city))

/** Coastal Cartagena (Bolívar). Package name is "Cartagena de Indias". */
export const CARTAGENA: ColombianCity = COLOMBIAN_CITIES.find(
  (c) => c.city === 'Cartagena de Indias',
)!
