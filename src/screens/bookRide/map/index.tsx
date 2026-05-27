import React, {useRef} from "react";
import {View, StyleSheet} from "react-native";
import {WebView} from "react-native-webview";

interface Coord {
  lat: number;
  lng: number;
}

interface MapScreenProps {
  mapType: "googleMap" | "osm" | any;
  pickupCoords: Coord;
  stopsCoords: Coord[]; // up to 3 stops
  destinationCoords: Coord;
  isDark: boolean;
  Google_Map_Key: string;
  isPulsing: boolean;
}

const MapScreen: React.FC<MapScreenProps> = ({
  mapType,
  pickupCoords,
  stopsCoords,
  destinationCoords,
  isDark,
  Google_Map_Key,
  isPulsing,
}) => {
  const webViewRef = useRef<WebView>(null);

  const getMapHtml = (provider: "googleMap" | "osm") => {
    if (!pickupCoords || !destinationCoords) return "";

    const pulseCss = `
      <style>
        .pulse-container { width: 300px; height: 300px; position: relative; }
        .pulse-ring {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 15px; height: 15px;
          background-color: rgba(25, 150, 117, 0.7);
          border-radius: 50%;
          animation: pulse-animation 2.5s ease-out infinite;
          opacity: 0;
        }
        .pulse-ring:nth-child(2) { animation-delay: 0.8s; }
        .pulse-ring:nth-child(3) { animation-delay: 1.6s; }
        @keyframes pulse-animation {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
        }
      </style>
    `;

    if (provider === "googleMap") {
      const stopsJson = JSON.stringify(
        stopsCoords.map(s => ({location: s, stopover: true})),
      );
      const allPointsJson = JSON.stringify([
        {lat: pickupCoords.lat, lng: pickupCoords.lng},
        ...stopsCoords,
        {lat: destinationCoords.lat, lng: destinationCoords.lng},
      ]);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Maps</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}"></script>
          <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
          ${pulseCss}
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map, directionsRenderer, markers = [], pulseOverlay = null;

            function initMap() {
              const darkMapStyle = [
                { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
                { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
                { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#282828' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#383838' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] }
              ];

              map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: { lat: ${pickupCoords.lat}, lng: ${pickupCoords.lng} },
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                styles: ${isDark ? "darkMapStyle" : "null"}
              });

              drawRouteAndMarkers();
            }

            function clearAll() {
              if(directionsRenderer) directionsRenderer.setMap(null);
              markers.forEach(m => m.setMap(null));
              markers = [];
              if(pulseOverlay) { pulseOverlay.setMap(null); pulseOverlay = null; }
            }

            function drawRouteAndMarkers() {
              clearAll();
              var waypoints = ${stopsJson};
              var directionsService = new google.maps.DirectionsService();
              directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: { strokeColor: '#199675', strokeWeight: 5 }
              });
              directionsRenderer.setMap(map);

              var allPoints = ${allPointsJson};
              allPoints.forEach(p => markers.push(new google.maps.Marker({ position: p, map: map })));

              directionsService.route({
                origin: { lat: ${pickupCoords.lat}, lng: ${pickupCoords.lng} },
                destination: { lat: ${destinationCoords.lat}, lng: ${
        destinationCoords.lng
      } },
                waypoints: waypoints,
                travelMode: 'DRIVING'
              }, (res, status) => { if(status === 'OK') directionsRenderer.setDirections(res); });
            }

            window.onload = initMap;
          </script>
        </body>
        </html>
      `;
    }

    const waypointsStr = [
      pickupCoords,
      ...stopsCoords.filter(s => s.lat && s.lng),
      destinationCoords,
    ]
      .map(c => `L.latLng(${c.lat}, ${c.lng})`)
      .join(", ");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OSM Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
        ${pulseCss}
        <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            var isDark = ${isDark};
            var lightTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
            var darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

            var map = L.map('map').setView([${pickupCoords.lat}, ${pickupCoords.lng}], 13);
            L.tileLayer(isDark ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);

            var waypoints = [${waypointsStr}];

            // Draw markers
            waypoints.forEach((wp, i) => {
              var text = i === 0 ? "Start" : i === waypoints.length - 1 ? "End" : "Stop " + i;
              L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(text);
            });

            // Draw route
            L.Routing.control({
              waypoints: waypoints,
              routeWhileDragging: false,
              createMarker: function() { return null; },
              lineOptions: { styles: [{ color: '#199675', weight: 5 }] }
            }).addTo(map);

            map.fitBounds(waypoints.map(wp => [wp.lat, wp.lng]));
          });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <WebView
        key={
          mapType +
          JSON.stringify([pickupCoords, stopsCoords, destinationCoords])
        }
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{html: getMapHtml(mapType)}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
