import { normalizeZipCode } from "../utils/zipCode";

export type GeocodedZipCode = {
  zipCode: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
  city?: string;
  state?: string;
  street?: string;
  precision?: "zipCode" | "address" | "city" | "city-offset";
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

type BrasilApiCepResponse = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: {
    coordinates?: {
      latitude?: number | string;
      longitude?: number | string;
    };
  };
};

type NominatimResult = {
  lat: string;
  lon: string;
};

const cacheKey = "legisgest.geocodedZipCodes.v3";
const memoryCache = new Map<string, GeocodedZipCode | null>();

const readStoredCache = () => {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, GeocodedZipCode | null>;
  } catch {
    return {};
  }
};

const writeStoredCache = (zipCode: string, value: GeocodedZipCode | null) => {
  try {
    const current = readStoredCache();
    localStorage.setItem(cacheKey, JSON.stringify({ ...current, [zipCode]: value }));
  } catch {
    // Cache failure should never block map rendering.
  }
};

const fetchAddress = async (zipCode: string) => {
  const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
  if (!response.ok) return null;

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) return null;
  return data;
};

const fetchBrasilApiCep = async (zipCode: string) => {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${zipCode}`);
    if (!response.ok) return null;
    return (await response.json()) as BrasilApiCepResponse;
  } catch {
    return null;
  }
};

const coordinatesFromBrasilApi = (data: BrasilApiCepResponse | null) => {
  const latitude = Number(data?.location?.coordinates?.latitude);
  const longitude = Number(data?.location?.coordinates?.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (latitude === 0 && longitude === 0) return null;

  return { latitude, longitude };
};

const distanceInKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRad(b.latitude - a.latitude);
  const deltaLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const offsetFromCityCenter = (coordinates: { latitude: number; longitude: number }, zipCode: string) => {
  const seed = zipCode.split("").reduce((sum, char, index) => sum + Number(char) * (index + 3), 0);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 0.004 + (seed % 7) * 0.0014;

  return {
    latitude: coordinates.latitude + Math.sin(angle) * radius,
    longitude: coordinates.longitude + Math.cos(angle) * radius,
  };
};

const searchCoordinates = async (query: string) => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("q", query);

  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) return null;

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];
  if (!first) return null;

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { latitude, longitude };
};

export const geocodeZipCode = async (value?: string | null): Promise<GeocodedZipCode | null> => {
  const zipCode = normalizeZipCode(value);
  if (zipCode.length !== 8) return null;

  if (memoryCache.has(zipCode)) return memoryCache.get(zipCode) ?? null;

  const stored = readStoredCache();
  if (zipCode in stored) {
    memoryCache.set(zipCode, stored[zipCode]);
    return stored[zipCode];
  }

  const brasilApi = await fetchBrasilApiCep(zipCode);
  const address = await fetchAddress(zipCode);
  const street = brasilApi?.street ?? address?.logradouro;
  const neighborhood = brasilApi?.neighborhood ?? address?.bairro;
  const city = brasilApi?.city ?? address?.localidade;
  const state = brasilApi?.state ?? address?.uf;
  const cityParts = [city, state, "Brasil"].filter(Boolean);
  const cityCoordinates = cityParts.length > 2 ? await searchCoordinates(cityParts.join(", ")) : null;
  const brasilApiCoordinates = coordinatesFromBrasilApi(brasilApi);

  if (cityCoordinates) {
    const hasNearbyBrasilApiCoordinates = Boolean(brasilApiCoordinates && distanceInKm(cityCoordinates, brasilApiCoordinates) <= 3);
    const coordinates = hasNearbyBrasilApiCoordinates ? brasilApiCoordinates! : offsetFromCityCenter(cityCoordinates, zipCode);
    const result: GeocodedZipCode = {
      zipCode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      neighborhood,
      city,
      state,
      street,
      precision: hasNearbyBrasilApiCoordinates ? "zipCode" : "city-offset",
    };

    memoryCache.set(zipCode, result);
    writeStoredCache(zipCode, result);
    return result;
  }

  if (brasilApiCoordinates) {
    const result: GeocodedZipCode = {
      zipCode,
      latitude: brasilApiCoordinates.latitude,
      longitude: brasilApiCoordinates.longitude,
      neighborhood,
      city,
      state,
      street,
      precision: "zipCode",
    };

    memoryCache.set(zipCode, result);
    writeStoredCache(zipCode, result);
    return result;
  }

  const addressParts = [street, neighborhood, city, state, "Brasil"].filter(Boolean);
  const queries = [...(addressParts.length > 2 ? [addressParts.join(", ")] : []), `${zipCode}, Brasil`];

  let coordinates: { latitude: number; longitude: number } | null = null;
  let precision: GeocodedZipCode["precision"] = "address";
  for (const query of queries) {
    coordinates = await searchCoordinates(query);
    if (coordinates) {
      precision = query === `${zipCode}, Brasil` ? "zipCode" : "address";
      break;
    }
  }

  const result = coordinates
    ? {
        zipCode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        neighborhood,
        city,
        state,
        street,
        precision,
      }
    : null;

  memoryCache.set(zipCode, result);
  writeStoredCache(zipCode, result);
  return result;
};
