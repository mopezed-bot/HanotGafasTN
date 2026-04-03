'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, MapPin, Navigation, Loader2, X } from 'lucide-react';
import { getListingsNearby } from '@/lib/api/listings';
import { getRestaurantsNearby } from '@/lib/api/restaurants';
import type { ListingWithSeller, Restaurant, GeoPoint, MapMarker } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapSearchProps {
  initialCenter?: GeoPoint;
  initialZoom?: number;
  radius?: number;
  categoryId?: number;
  onMarkerClick?: (id: string, type: 'listing' | 'restaurant') => void;
}

const createListingIcon = () =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: #0f766e; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: 700;">DT</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

const createRestaurantIcon = () =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: #c2410c; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: 700;">R</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

export default function MapSearch({
  initialCenter = { lat: 34.31, lng: 8.23 },
  initialZoom = 13,
  radius = 10000,
  categoryId,
  onMarkerClick,
}: MapSearchProps) {
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showListings, setShowListings] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [searchRadius, setSearchRadius] = useState(radius);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Keep Tunisia default center
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const location = userLocation || initialCenter;
      const results: MapMarker[] = [];

      try {
        if (showListings) {
          const { data: listings } = await getListingsNearby(location, searchRadius, categoryId);
          listings?.forEach((listing: ListingWithSeller) => {
            if (listing.location) {
              const coords = parseGeoJSONPoint(listing.location);
              if (coords) {
                results.push({
                  id: listing.id,
                  type: 'listing',
                  position: [coords.lat, coords.lng] as [number, number],
                  title: listing.title,
                  price: listing.price,
                  imageUrl: listing.images?.[0] || undefined,
                });
              }
            }
          });
        }

        if (showRestaurants) {
          const { data: restaurants } = await getRestaurantsNearby(location, searchRadius);
          restaurants?.forEach((restaurant: Restaurant) => {
            if (restaurant.location) {
              const coords = parseGeoJSONPoint(restaurant.location);
              if (coords) {
                results.push({
                  id: restaurant.id,
                  type: 'restaurant',
                  position: [coords.lat, coords.lng] as [number, number],
                  title: restaurant.name,
                  imageUrl: restaurant.logo_url || undefined,
                });
              }
            }
          });
        }

        setMarkers(results);
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load nearby items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userLocation, initialCenter, searchRadius, categoryId, showListings, showRestaurants]);

  const handleMarkerClick = (marker: MapMarker) => {
    if (onMarkerClick) {
      onMarkerClick(marker.id, marker.type);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError('Could not get your location');
        }
      );
    }
  };

  const center = userLocation || initialCenter;

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-amber-200">
      <MapContainer center={[center.lat, center.lng]} zoom={initialZoom} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="background: #16a34a; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            position={marker.position}
            icon={marker.type === 'listing' ? createListingIcon() : createRestaurantIcon()}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold">{marker.title}</div>
                {marker.price && <div className="text-emerald-700 font-bold">{marker.price.toLocaleString()} DT</div>}
                <div className="text-xs text-gray-500 mt-1 capitalize">{marker.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <div className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="text-sm border-0 focus:ring-0"
          >
            <option value={1000}>1 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={25000}>25 km</option>
            <option value={50000}>50 km</option>
          </select>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>

        <button
          onClick={handleUseMyLocation}
          className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ml-auto"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">My Location</span>
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-20 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Show on Map</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showListings}
              onChange={(e) => setShowListings(e.target.checked)}
              className="rounded text-emerald-700"
            />
            <span>Items for Sale</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={showRestaurants}
              onChange={(e) => setShowRestaurants(e.target.checked)}
              className="rounded text-amber-700"
            />
            <span>Restaurants</span>
          </label>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
            <span className="text-sm text-gray-600">Loading nearby items in Moulares and Redeyef...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isLoading && markers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md px-3 py-2 text-sm">
          <MapPin className="w-4 h-4 inline mr-1" />
          {markers.length} items nearby
        </div>
      )}
    </div>
  );
}

function parseGeoJSONPoint(location: string): { lat: number; lng: number } | null {
  try {
    const parsed = JSON.parse(location);
    if (parsed.type === 'Point' && parsed.coordinates) {
      return {
        lng: parsed.coordinates[0],
        lat: parsed.coordinates[1],
      };
    }
  } catch {
    // Try parsing as WKT or other format later.
  }
  return null;
}
