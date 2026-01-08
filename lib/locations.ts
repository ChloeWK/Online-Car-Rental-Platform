export interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  isActive: boolean
}

export const locations: Location[] = [
  {
    id: "loc-1",
    name: "Downtown Office",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isActive: true,
  },
  {
    id: "loc-2",
    name: "Airport Terminal",
    address: "456 Airport Road",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90045",
    isActive: true,
  },
  {
    id: "loc-3",
    name: "Central Station",
    address: "789 Railway Avenue",
    city: "Chicago",
    state: "IL",
    zipCode: "60611",
    isActive: true,
  },
  {
    id: "loc-4",
    name: "Harbor Point",
    address: "321 Waterfront Drive",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    isActive: true,
  },
  {
    id: "loc-5",
    name: "Suburban Mall",
    address: "555 Shopping Center Blvd",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    isActive: true,
  },
  {
    id: "loc-6",
    name: "Business District",
    address: "888 Corporate Parkway",
    city: "Miami",
    state: "FL",
    zipCode: "33131",
    isActive: true,
  },
]

export function getLocations(): Location[] {
  return locations.filter((location) => location.isActive)
}

export function getLocationById(id: string): Location | undefined {
  return locations.find((location) => location.id === id)
}
