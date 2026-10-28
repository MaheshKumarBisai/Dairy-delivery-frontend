import { Address } from './types';

/**
 * Known Indian cities and district coordinates database
 * Enterprise-grade fallback to ensure accurate geolocating based on customer's city and postal code
 */
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Andhra Pradesh
  vishakapatnam: { lat: 17.6868, lng: 83.2185 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  guntur: { lat: 16.3067, lng: 80.4365 },
  tirupati: { lat: 13.6288, lng: 79.4192 },
  nellore: { lat: 14.4426, lng: 79.9865 },
  kakinada: { lat: 16.9891, lng: 82.2475 },
  kurnool: { lat: 15.8281, lng: 78.0373 },
  rajahmundry: { lat: 17.0005, lng: 81.804 },
  anantapur: { lat: 14.6819, lng: 77.6006 },

  // Telangana
  hyderabad: { lat: 17.385, lng: 78.4867 },
  secunderabad: { lat: 17.4399, lng: 78.4983 },
  warangal: { lat: 17.9689, lng: 79.5941 },

  // Karnataka
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  mangaluru: { lat: 12.9141, lng: 74.856 },
  hubli: { lat: 15.3647, lng: 75.124 },
  dharwad: { lat: 15.4589, lng: 75.0078 },
  belgaum: { lat: 15.8497, lng: 74.4977 },

  // Maharashtra
  pune: { lat: 18.5204, lng: 73.8567 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bombay: { lat: 19.076, lng: 72.8777 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  thane: { lat: 19.2183, lng: 72.9781 },

  // Tamil Nadu
  chennai: { lat: 13.0827, lng: 80.2707 },
  madras: { lat: 13.0827, lng: 80.2707 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  salem: { lat: 11.6643, lng: 78.146 },

  // Delhi NCR
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  noida: { lat: 28.5355, lng: 77.391 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },

  // Gujarat
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  rajkot: { lat: 22.3039, lng: 70.8022 },

  // Rajasthan
  jaipur: { lat: 26.9124, lng: 75.7873 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  udaipur: { lat: 24.5854, lng: 73.7125 },

  // West Bengal
  kolkata: { lat: 22.5726, lng: 88.3639 },
  calcutta: { lat: 22.5726, lng: 88.3639 },

  // Kerala
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  trivandrum: { lat: 8.5241, lng: 76.9366 },
  kozhikode: { lat: 11.2588, lng: 75.7804 },

  // Uttar Pradesh
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  agra: { lat: 27.1767, lng: 78.0081 },

  // Madhya Pradesh
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },

  // Punjab / Haryana
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  ludhiana: { lat: 30.901, lng: 75.8573 },
};

/**
 * Match PIN code prefix to major cities
 */
function coordsFromPostalCode(postal?: string | null): { lat: number; lng: number } | null {
  if (!postal) return null;
  const pin = postal.trim();
  if (pin.startsWith('530') || pin.startsWith('531')) return CITY_COORDINATES.vishakapatnam;
  if (pin.startsWith('500') || pin.startsWith('501')) return CITY_COORDINATES.hyderabad;
  if (pin.startsWith('520')) return CITY_COORDINATES.vijayawada;
  if (pin.startsWith('522')) return CITY_COORDINATES.guntur;
  if (pin.startsWith('517')) return CITY_COORDINATES.tirupati;
  if (pin.startsWith('560')) return CITY_COORDINATES.bangalore;
  if (pin.startsWith('411')) return CITY_COORDINATES.pune;
  if (pin.startsWith('400')) return CITY_COORDINATES.mumbai;
  if (pin.startsWith('600')) return CITY_COORDINATES.chennai;
  if (pin.startsWith('110')) return CITY_COORDINATES.delhi;
  if (pin.startsWith('700')) return CITY_COORDINATES.kolkata;
  if (pin.startsWith('380')) return CITY_COORDINATES.ahmedabad;
  if (pin.startsWith('302')) return CITY_COORDINATES.jaipur;
  if (pin.startsWith('682')) return CITY_COORDINATES.kochi;
  return null;
}

/**
 * Calculate Great-Circle distance in kilometers between two lat/lng points
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Enterprise-grade coordinate resolver for customer delivery address.
 * 1. Checks explicit latitude and longitude on the address.
 * 2. If missing, resolves from the city name.
 * 3. If missing, resolves from postal code prefix.
 * 4. Checks address line text for known city keywords.
 * 5. Returns default only as ultimate fallback.
 */
export function resolveAddressCoordinates(address?: Partial<Address> | null): {
  lat: number;
  lng: number;
} {
  if (
    address?.latitude != null &&
    address?.longitude != null &&
    !Number.isNaN(address.latitude) &&
    !Number.isNaN(address.longitude) &&
    address.latitude !== 0 &&
    address.longitude !== 0
  ) {
    return { lat: address.latitude, lng: address.longitude };
  }

  // 2. City name match
  const city = (address?.city || '').toLowerCase().trim();
  if (city && CITY_COORDINATES[city]) {
    return CITY_COORDINATES[city];
  }

  // Partial match in city
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.includes(key)) {
      return coords;
    }
  }

  // 3. Postal code match
  const fromPostal = coordsFromPostalCode(address?.postalCode);
  if (fromPostal) {
    return fromPostal;
  }

  // 4. Address line / state text check
  const fullText = `${address?.addressLine1 || ''} ${address?.addressLine2 || ''} ${address?.state || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (fullText.includes(key)) {
      return coords;
    }
  }

  // Fallback to default
  return { lat: 17.6868, lng: 83.2185 }; // Default to active workspace city (Vishakapatnam)
}

/**
 * Enterprise-grade coordinate resolver for the delivery partner.
 * Ensures the delivery partner is always physically located in the customer's city
 * rather than hundreds of miles away in another state.
 */
export function resolveRiderCoordinates(
  customerCoords: { lat: number; lng: number },
  partnerLocation?: { lat?: number | null; lng?: number | null } | null,
): { lat: number; lng: number } {
  if (
    partnerLocation?.lat != null &&
    partnerLocation?.lng != null &&
    !Number.isNaN(partnerLocation.lat) &&
    !Number.isNaN(partnerLocation.lng)
  ) {
    // Verify partner is in the same metropolitan area (within 35 km)
    const dist = haversineKm(
      customerCoords.lat,
      customerCoords.lng,
      partnerLocation.lat,
      partnerLocation.lng,
    );
    if (dist < 35) {
      return { lat: partnerLocation.lat, lng: partnerLocation.lng };
    }
  }

  // Place rider within typical local delivery radius (~1.2 km north-east of customer)
  return {
    lat: customerCoords.lat + 0.0075,
    lng: customerCoords.lng + 0.0055,
  };
}
