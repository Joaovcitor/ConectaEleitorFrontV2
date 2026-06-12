import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { CitizenResponseDTO } from "../api/types";
import { geocodeZipCode, type GeocodedZipCode } from "../lib/geocode";
import { formatZipCode, isValidZipCode, normalizeZipCode } from "../utils/zipCode";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

type VoterLocationGroup = {
  key: string;
  latitude: number;
  longitude: number;
  zipCodes: string[];
  voters: CitizenResponseDTO[];
  location?: GeocodedZipCode;
};

const defaultCenter: [number, number] = [-14.235, -51.9253];

const sleep = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const markerIcon = (count: number) =>
  L.divIcon({
    className: "voters-map-marker",
    html: `<span>${count}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

function FitMapBounds({ groups }: { groups: VoterLocationGroup[] }) {
  const map = useMap();

  useEffect(() => {
    if (groups.length === 0) return;

    const bounds = groups.map((group) => [group.latitude, group.longitude]) as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }, [groups, map]);

  return null;
}

export function VotersMap({ citizens }: { citizens: CitizenResponseDTO[] }) {
  const [locations, setLocations] = useState<Record<string, GeocodedZipCode | null>>({});
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState(0);
  const [error, setError] = useState("");

  const citizensWithValidZip = useMemo(
    () => citizens.filter((citizen) => isValidZipCode(citizen.zipCode)),
    [citizens],
  );

  const uniqueZipCodes = useMemo(
    () => Array.from(new Set(citizensWithValidZip.map((citizen) => normalizeZipCode(citizen.zipCode)))),
    [citizensWithValidZip],
  );

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setLoading(true);
      setError("");
      setProcessed(0);

      try {
        const nextLocations: Record<string, GeocodedZipCode | null> = {};

        for (const zipCode of uniqueZipCodes) {
          if (cancelled) return;
          nextLocations[zipCode] = await geocodeZipCode(zipCode);
          setProcessed((current) => current + 1);

          // Be gentle with public geocoding services while still keeping the MVP responsive.
          if (uniqueZipCodes.length > 1) await sleep(220);
        }

        if (!cancelled) setLocations(nextLocations);
      } catch {
        if (!cancelled) setError("Não foi possível consultar as coordenadas dos CEPs agora.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [uniqueZipCodes]);

  const groups = useMemo(() => {
    const grouped = new Map<string, VoterLocationGroup>();

    for (const citizen of citizensWithValidZip) {
      const zipCode = normalizeZipCode(citizen.zipCode);
      const location = locations[zipCode];
      if (!location) continue;

      const key = `${location.latitude.toFixed(3)}:${location.longitude.toFixed(3)}`;
      const current = grouped.get(key);

      if (current) {
        current.voters.push(citizen);
        if (!current.zipCodes.includes(zipCode)) current.zipCodes.push(zipCode);
      } else {
        grouped.set(key, {
          key,
          latitude: location.latitude,
          longitude: location.longitude,
          zipCodes: [zipCode],
          voters: [citizen],
          location,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.voters.length - a.voters.length);
  }, [citizensWithValidZip, locations]);

  const invalidCount = citizens.length - citizensWithValidZip.length;
  const notFoundCount = uniqueZipCodes.filter((zipCode) => locations[zipCode] === null).length;
  const center: [number, number] = groups[0] ? [groups[0].latitude, groups[0].longitude] : defaultCenter;

  if (citizens.length === 0) {
    return <EmptyState title="Nenhum eleitor encontrado" description="Cadastre eleitores com CEP para visualizar o mapa." />;
  }

  return (
    <div className="voters-map-layout">
      <div className="voters-map-summary">
        <article><strong>{citizens.length}</strong><span>eleitores carregados</span></article>
        <article><strong>{citizensWithValidZip.length}</strong><span>com CEP válido</span></article>
        <article><strong>{groups.length}</strong><span>locais no mapa</span></article>
        <article><strong>{invalidCount + notFoundCount}</strong><span>sem coordenada</span></article>
      </div>

      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

      <div className="voters-map-panel">
        {loading ? (
          <LoadingState label={`Geocodificando CEPs (${processed}/${uniqueZipCodes.length})...`} />
        ) : groups.length === 0 ? (
          <EmptyState title="Nenhum CEP localizado" description="Os eleitores carregados não possuem CEP válido ou as coordenadas não foram encontradas." />
        ) : (
          <MapContainer center={center} zoom={5} className="voters-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMapBounds groups={groups} />
            {groups.map((group) => (
              <Marker key={group.key} position={[group.latitude, group.longitude]} icon={markerIcon(group.voters.length)}>
                <Popup>
                  <div className="voters-map-popup">
                    <strong>{group.voters.length} eleitor{group.voters.length > 1 ? "es" : ""}</strong>
                    <span>{group.location?.neighborhood || group.voters[0]?.neighborhood || "Localização aproximada"}</span>
                    <span>{[group.location?.city || group.voters[0]?.city, group.location?.state || group.voters[0]?.state].filter(Boolean).join(" - ")}</span>
                    <small>CEP {group.zipCodes.map((zipCode) => formatZipCode(zipCode)).join(", ")}</small>
                    {(group.location?.precision === "city" || group.location?.precision === "city-offset") && <small>Coordenada aproximada pela cidade/UF</small>}
                    <ul>
                      {group.voters.slice(0, 8).map((voter) => (
                        <li key={voter.citizenId}>
                          <strong>{voter.fullName}</strong>
                          <span>{[voter.neighborhood, voter.city].filter(Boolean).join(" · ") || voter.street || "Endereço não informado"}</span>
                        </li>
                      ))}
                    </ul>
                    {group.voters.length > 8 && <small>+{group.voters.length - 8} eleitores neste local</small>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
