"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

// Create Map component that will be dynamically loaded
const LocationPickerMap = dynamic(
  () =>
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([reactLeaflet, leaflet]) => {
        const {
          MapContainer,
          TileLayer,
          Marker,
          Popup,
          Polyline,
          useMapEvents,
        } = reactLeaflet;
        const L = leaflet.default || leaflet;

        // Fix Leaflet icons
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Click handler component - useMapEvents takes an events object
        function ClickHandler({ onClick }) {
          useMapEvents({
            click: (e) => {
              if (onClick && e.latlng) {
                onClick({ latlng: e.latlng });
              }
            },
          });
          return null;
        }

        // Calculate distance between two coordinates using Haversine formula
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
          return R * c; // Distance in km
        };

        return function MapComponent({
          center,
          zoom,
          stops,
          selectedLocation,
          userLocation,
          onClick,
        }) {
          return (
            <MapContainer
              center={center}
              zoom={zoom}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <ClickHandler onClick={onClick} />
              {/* Polyline from user location to first stop */}
              {userLocation &&
                stops.length > 0 &&
                stops.map((stop, index) => (
                  <Polyline
                    key={index}
                    positions={[
                      userLocation,
                      [
                        parseFloat(stop.position?.[0] || stop.latitude),
                        parseFloat(stop.position?.[1] || stop.longitude),
                      ],
                    ]}
                    pathOptions={{
                      color: "black",
                      weight: 3,
                      dashArray: "5, 10",
                    }}
                  />
                ))}

              {/* User location marker */}
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup>
                    <div className="p-1">
                      <b>Your Location</b>
                      <br />
                      <b>
                        Lat: {userLocation[0].toFixed(6)}
                        <br />
                        Lng: {userLocation[1].toFixed(6)}
                      </b>
                    </div>
                  </Popup>
                </Marker>
              )}
              {/* Stop markers */}
              {stops.map((stop) => {
                const stopLat = parseFloat(stop.position?.[0] || stop.latitude);
                const stopLng = parseFloat(
                  stop.position?.[1] || stop.longitude,
                );
                const distance = userLocation
                  ? calculateDistance(
                      userLocation[0],
                      userLocation[1],
                      stopLat,
                      stopLng,
                    )
                  : null;
                return (
                  <Marker key={stop.id} position={[stopLat, stopLng]}>
                    <Popup>
                      <b>Stop: {stop.name}</b>
                      <br />
                      <b>Address: {stop.address}</b>
                      <br />
                      <b>Order: {stop.order}</b>
                      <br />
                      <b>Route: {stop.route?.name}</b>
                      <br />
                      <b>Distance: {distance.toFixed(2)} km</b>
                      <br />
                      <b>
                        Created At: {new Date(stop.createdAt).toDateString()}
                      </b>
                    </Popup>
                  </Marker>
                );
              })}
              {/* Selected location marker */}
              {selectedLocation && userLocation && (
                <div>
                  <Polyline
                    positions={[userLocation, selectedLocation]}
                    pathOptions={{
                      color: "blue",
                      weight: 4,
                      opacity: 0.9,
                    }}
                  />
                  <Marker position={selectedLocation}>
                    <Popup>
                      <div className="text-center">
                        <b>Selected Location</b>
                        <br />
                        <b>
                          Distance:{" "}
                          {calculateDistance(
                            userLocation[0],
                            userLocation[1],
                            selectedLocation[0],
                            selectedLocation[1],
                          ).toFixed(2)}{" "}
                          km
                        </b>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              )}
            </MapContainer>
          );
        };
      },
    ),
  { ssr: false },
);

const LocationPicker = ({
  zoom = 13,
  height = "300px",
  value,
  onChange,
  stops = [],
}) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get user's current location using watchPosition
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          setLocationError(error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );

      // Watch position for continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.log("Watch position error:", error.message);
        },
        { enableHighAccuracy: true },
      );

      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [isClient]);

  useEffect(() => {
    if (value && value[0] && value[1]) {
      setSelectedLocation(value);
    }
  }, [value]);

  const handleMapClick = useCallback(
    (e) => {
      if (e && e.latlng) {
        const { lat, lng } = e.latlng;
        const newLocation = [lat, lng];
        setSelectedLocation(newLocation);
        if (onChange) {
          onChange(newLocation);
        }
      }
    },
    [onChange],
  );

  if (!isClient || !userLocation) {
    return (
      <div
        style={{ height }}
        className="bg-slate-900 text-slate-400 flex items-center justify-center rounded-lg border border-slate-800"
      >
        Loading Map...
      </div>
    );
  }

  return (
    <div
      className="relative w-full border rounded-lg overflow-hidden"
      style={{ height }}
    >
      <LocationPickerMap
        center={userLocation}
        zoom={zoom}
        stops={stops}
        selectedLocation={selectedLocation}
        userLocation={userLocation}
        onClick={handleMapClick}
      />
    </div>
  );
};

export default LocationPicker;
