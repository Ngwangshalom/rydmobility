import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

interface Coord {
  lat: number;
  lng: number;
}

interface MapScreenProps {
  mapType: "google_map" | "osm" | any;
  pickupCoords: Coord;
  stopsCoords: Coord[];
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

  const getMapHtml = (provider: "google_map" | "osm") => {
    if (!pickupCoords || !destinationCoords) return "";

    const pulseCss = `
      <style>
        .pulse-overlay {
          position: absolute;
          pointer-events: ${isPulsing ? "auto" : "none"};
          z-index: 1000;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-container {
          position: relative;
          width: 300px;
          height: 300px;
        }
        .pulse-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background-color: rgba(25, 150, 117, 0.7);
          border-radius: 50%;
          animation: pulse-animation 2s ease-out infinite;
          opacity: 0;
        }
        .pulse-ring:nth-child(2) { animation-delay: 0.6s; }
        .pulse-ring:nth-child(3) { animation-delay: 1.2s; }
        @keyframes pulse-animation {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(15);
            opacity: 0;
          }
        }
      </style>
    `;

    if (provider === "google_map") {
      const stopsJson = JSON.stringify(
        stopsCoords.map(s => ({ location: s, stopover: true })),
      );
      const allPointsJson = JSON.stringify([
        { lat: pickupCoords.lat, lng: pickupCoords.lng },
        ...stopsCoords,
        { lat: destinationCoords.lat, lng: destinationCoords.lng },
      ]);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Maps</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}"></script>
          <style>html, body, #map { height: 100%; margin: 0; padding: 0; position: relative; }</style>
          ${pulseCss}
        </head>
        <body>
          <div id="map"></div>
          ${isPulsing
          ? `
          <div class="pulse-overlay">
            <div class="pulse-container">
              <div class="pulse-ring"></div>
              <div class="pulse-ring"></div>
              <div class="pulse-ring"></div>
            </div>
          </div>
          `
          : ""
        }
          <script>
            var map, directionsRenderer, markers = [], isPulsing = ${isPulsing};

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
                zoom: isPulsing ? 15 : 12,
                center: { lat: ${pickupCoords.lat}, lng: ${pickupCoords.lng} },
                disableDefaultUI: true,
                gestureHandling: isPulsing ? 'none' : 'greedy',
                styles: ${isDark ? "darkMapStyle" : "null"},
                zoomControl: !isPulsing,
                scrollwheel: !isPulsing,
                draggable: !isPulsing,
                disableDoubleClickZoom: isPulsing,
                keyboardShortcuts: !isPulsing
              });

              if (isPulsing) {
                showPulseAnimation();
              } else {
                drawRouteAndMarkers();
              }
            }

            function showPulseAnimation() {
              // Show only pickup marker
              var pickupMarker = new google.maps.Marker({
                position: { lat: ${pickupCoords.lat}, lng: ${pickupCoords.lng
        } },
                map: map
              });
              markers.push(pickupMarker);
            }

            function clearAll() {
              if(directionsRenderer) directionsRenderer.setMap(null);
              markers.forEach(m => m.setMap(null));
              markers = [];
            }

            function drawRouteAndMarkers() {
              clearAll();
              var waypoints = ${stopsJson};
              var directionsService = new google.maps.DirectionsService();
              
              var allPoints = ${allPointsJson};
              allPoints.forEach(p => markers.push(new google.maps.Marker({ position: p, map: map })));

              directionsService.route({
                origin: { lat: ${pickupCoords.lat}, lng: ${pickupCoords.lng} },
                destination: { lat: ${destinationCoords.lat}, lng: ${destinationCoords.lng
        } },
                waypoints: waypoints,
                travelMode: 'DRIVING'
              }, (res, status) => { 
                if(status === 'OK') {
                  animatePolylineWithShimmer(res.routes[0].overview_path);
                }
              });
            }

            function animatePolylineWithShimmer(path) {
              var animatedPath = [];
              var polyline = new google.maps.Polyline({
                path: animatedPath,
                geodesic: true,
                strokeColor: '#199675',
                strokeOpacity: 1.0,
                strokeWeight: 5,
                map: map
              });

              var step = 0;
              var numSteps = 200; // Increased for smoother animation
              var timePerStep = 8; // Faster frame rate
              var pathLength = path.length;

              // Easing function for smooth acceleration/deceleration
              function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
              }

              function animate() {
                if (step > numSteps) return;
                
                var progress = easeInOutCubic(step / numSteps);
                var targetIndex = Math.floor(progress * (pathLength - 1));
                
                // Add points progressively
                for (var i = animatedPath.length; i <= targetIndex; i++) {
                  animatedPath.push(path[i]);
                }
                
                polyline.setPath(animatedPath);
                step++;
                
                if (step <= numSteps) {
                  setTimeout(animate, timePerStep);
                }
              }
              
              animate();
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
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; position: relative; }
          .leaflet-container { background: ${isDark ? "#212121" : "#fff"}; }
          .leaflet-routing-container { display: none !important; }
          .leaflet-control { display: none !important; }
        </style>
        ${pulseCss}
      </head>
      <body>
        <div id="map"></div>
        ${isPulsing
        ? `
        <div class="pulse-overlay">
          <div class="pulse-container">
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
            <div class="pulse-ring"></div>
          </div>
        </div>
        `
        : ""
      }
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            var isDark = ${isDark};
            var isPulsing = ${isPulsing};
            var lightTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
            var darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

            var map = L.map('map', {
              center: [${pickupCoords.lat}, ${pickupCoords.lng}],
              zoom: isPulsing ? 15 : 13,
              dragging: !isPulsing,
              touchZoom: !isPulsing,
              scrollWheelZoom: !isPulsing,
              doubleClickZoom: !isPulsing,
              boxZoom: !isPulsing,
              keyboard: !isPulsing,
              zoomControl: false,
              tap: !isPulsing,
              attributionControl: false
            });

            L.tileLayer(isDark ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);

            if (isPulsing) {
              // Show standard marker at pickup point
              L.marker([${pickupCoords.lat}, ${pickupCoords.lng}]).addTo(map);
            } else {
              var waypoints = [${waypointsStr}];

              // Draw markers
              waypoints.forEach((wp, i) => {
                var text = i === 0 ? "Start" : i === waypoints.length - 1 ? "End" : "Stop " + i;
                L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(text);
              });

              // Draw route with animation and shimmer
              var routingControl = L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                createMarker: function() { return null; },
                lineOptions: { 
                  styles: [{ color: 'transparent', weight: 0 }]
                },
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false
              }).on('routesfound', function(e) {
                var route = e.routes[0];
                var coordinates = route.coordinates;
                animatePolylineWithShimmer(coordinates);
              }).addTo(map);

              function animatePolylineWithShimmer(coordinates) {
                var animatedCoords = [];
                var polyline = L.polyline(animatedCoords, {
                  color: '#199675',
                  weight: 5,
                  opacity: 1
                }).addTo(map);

                var step = 0;
                var numSteps = 200; // Increased for smoother animation
                var timePerStep = 8; // Faster frame rate
                var coordsLength = coordinates.length;

                // Easing function for smooth acceleration/deceleration
                function easeInOutCubic(t) {
                  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                }

                function animate() {
                  if (step > numSteps) return;
                  
                  var progress = easeInOutCubic(step / numSteps);
                  var targetIndex = Math.floor(progress * (coordsLength - 1));
                  
                  // Add coordinates progressively
                  for (var i = animatedCoords.length; i <= targetIndex; i++) {
                    animatedCoords.push(coordinates[i]);
                  }
                  
                  polyline.setLatLngs(animatedCoords);
                  step++;
                  
                  if (step <= numSteps) {
                    setTimeout(animate, timePerStep);
                  }
                }
                
                animate();
              }

              map.fitBounds(waypoints.map(wp => [wp.lat, wp.lng]));
            }
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
          JSON.stringify([
            pickupCoords,
            stopsCoords,
            destinationCoords,
            isPulsing,
          ])
        }
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: getMapHtml(mapType) }}
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
