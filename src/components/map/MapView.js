"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

const MapView = ({
  stops = [],
  center,
  zoom = 13,
  height = "500px",
  onMapClick,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

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

  // Dynamic load map components
  const MapContainer = useMemo(
    () =>
      dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
        ssr: false,
      }),
    [],
  );

  const TileLayer = useMemo(
    () =>
      dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
        ssr: false,
      }),
    [],
  );

  const Marker = useMemo(
    () =>
      dynamic(() => import("react-leaflet").then((mod) => mod.Marker), {
        ssr: false,
      }),
    [],
  );

  const Polyline = useMemo(
    () =>
      dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), {
        ssr: false,
      }),
    [],
  );

  const Popup = useMemo(
    () =>
      dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
        ssr: false,
      }),
    [],
  );

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

  // Native Leaflet click handler
  useEffect(() => {
    if (!onMapClick) return;

    const setupClickHandler = () => {
      const mapElement = document.querySelector(".leaflet-container");
      if (!mapElement) {
        setTimeout(setupClickHandler, 100);
        return;
      }

      // Remove existing listener if any
      mapElement.removeEventListener("map-click-handler", null);

      // Add new listener
      const handleClick = (e) => {
        if (e.originalEvent) {
          const latlng = mapElement.getCenter();
          // Get click position from original event
          const point = mapElement.mouseEventToLatLng(e.originalEvent);
          if (point) {
            onMapClick(point.lat, point.lng);
          }
        }
      };

      mapElement.addEventListener("click", handleClick);

      return () => {
        mapElement.removeEventListener("click", handleClick);
      };
    };

    // Delay to ensure map is ready
    setTimeout(setupClickHandler, 500);
  }, [onMapClick]);

  useEffect(() => {
    setIsClient(true);

    // Fix Leaflet icons and map resize
    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Fix container size after map renders
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 500);
    });
  }, []);

  if (!isClient || !userLocation)
    return (
      <div
        style={{ height }}
        className="bg-slate-900 text-slate-400 flex items-center justify-center rounded-lg"
      >
        Loading Map...
      </div>
    );

  const handleClick = (e) => {
    if (onMapClick && e.latlng) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  return (
    <div
      className="relative w-full border rounded-lg shadow-inner overflow-hidden"
      style={{ height }}
    >
      <MapContainer
        center={userLocation}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        whenReady={(mapInstance) => {
          if (onMapClick) {
            mapInstance.target.on("click", handleClick);
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* 🔵 Polyline: user → each stop */}
        {stops.length > 0 &&
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

        {/* 🟢 User Marker */}
        <Marker position={userLocation}>
          <Popup>
            <div className="p-1">
              <b>Your Location</b>
              <br />
              Lat: {userLocation[0].toFixed(6)}
              <br />
              Lng: {userLocation[1].toFixed(6)}
            </div>
          </Popup>
        </Marker>

        {/* 🔴 Stop Markers */}
        {stops.map((stop) => {
          const stopLat = parseFloat(stop.position?.[0] || stop.latitude);
          const stopLng = parseFloat(stop.position?.[1] || stop.longitude);

          const distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            stopLat,
            stopLng,
          );

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
                <b>Created At: {new Date(stop.createdAt).toDateString()}</b>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
