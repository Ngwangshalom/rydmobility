import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useValues } from '@src/utils/context';
import { useSelector } from 'react-redux';
import { appColors, windowHeight } from '@src/themes';
import { Back, BackArrow } from '@src/utils/icons';

interface Coord {
  lat: string | number;
  lng: string | number;
}

interface RideMapViewProps {
  route: {
    params: {
      rideData: {
        location_coordinates: Coord[];
      };
    };
  };
}

export function RideMapView() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { isDark, Google_Map_Key } = useValues();
  const { taxidoSettingData } = useSelector((state: any) => state.setting);
  const { rideData } = route.params;
  const coordinates = rideData?.location_coordinates || [];

  // Extract pickup, stops, and destination
  const pickupCoords = coordinates[0];
  const destinationCoords = coordinates[coordinates.length - 1];
  const stopsCoords = coordinates.slice(1, -1); // All middle points are stops
  const mapType = taxidoSettingData?.cabbooking_values?.location?.map_provider;


  const getMapHtml = (provider: 'google_map' | 'osm') => {
    if (!pickupCoords || !destinationCoords) {
      return '<html><body><h3>No route data available</h3></body></html>';
    }

    const pickup = {
      lat: parseFloat(pickupCoords.lat.toString()),
      lng: parseFloat(pickupCoords.lng.toString())
    };

    const destination = {
      lat: parseFloat(destinationCoords.lat.toString()),
      lng: parseFloat(destinationCoords.lng.toString())
    };

    const stops = stopsCoords.map((coord: Coord) => ({
      lat: parseFloat(coord.lat.toString()),
      lng: parseFloat(coord.lng.toString())
    }));

    if (provider === 'google_map') {
      const stopsJson = JSON.stringify(stops.map((s: { lat: number; lng: number }) => ({ location: s, stopover: true })));
      const allPointsJson = JSON.stringify([pickup, ...stops, destination]);

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ride Route</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}"></script>
          <style>
            html, body, #map { 
              height: 100%; 
              margin: 0; 
              padding: 0; 
              position: relative; 
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map, directionsRenderer, markers = [];

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
                center: { lat: ${pickup.lat}, lng: ${pickup.lng} },
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                styles: ${isDark} ? darkMapStyle : null,
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
                scrollwheel: true,
                draggable: true
              });

              drawRouteAndMarkers();
            }

            function drawRouteAndMarkers() {
              var waypoints = ${stopsJson};
              var directionsService = new google.maps.DirectionsService();
              directionsRenderer = new google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: { 
                  strokeColor: '#199675', 
                  strokeWeight: 5 
                }
              });
              directionsRenderer.setMap(map);

              var allPoints = ${allPointsJson};
              
              // Add custom markers
              allPoints.forEach((p, index) => {
                const label = index === 0 ? 'P' : index === allPoints.length - 1 ? 'D' : String(index);
                const color = index === 0 ? '#199675' : index === allPoints.length - 1 ? '#FF5252' : '#FFA726';
                
                markers.push(new google.maps.Marker({ 
                  position: p, 
                  map: map,
                  label: {
                    text: label,
                    color: 'white',
                    fontWeight: 'bold'
                  },
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 2
                  }
                }));
              });

              // Draw route
              directionsService.route({
                origin: { lat: ${pickup.lat}, lng: ${pickup.lng} },
                destination: { lat: ${destination.lat}, lng: ${destination.lng} },
                waypoints: waypoints,
                travelMode: 'DRIVING'
              }, (res, status) => { 
                if(status === 'OK') {
                  directionsRenderer.setDirections(res);
                }
              });
            }

            window.onload = initMap;
          </script>
        </body>
        </html>
      `;
    }

    // OSM Map
    const waypointsStr = [pickup, ...stops, destination]
      .map(c => `L.latLng(${c.lat}, ${c.lng})`)
      .join(', ');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ride Route</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
        <style>
          html, body, #map { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            position: relative; 
          }
          .leaflet-container { 
            background: ${isDark ? '#212121' : '#fff'}; 
          }
          .leaflet-routing-container { 
            display: none !important; 
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            var isDark = ${isDark};
            var lightTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
            var darkTiles = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

            var map = L.map('map', {
              center: [${pickup.lat}, ${pickup.lng}],
              zoom: 13,
              zoomControl: false,
              attributionControl: false
            });

            L.tileLayer(isDark ? darkTiles : lightTiles, { maxZoom: 19 }).addTo(map);

            var waypoints = [${waypointsStr}];

            // Draw custom markers
            waypoints.forEach((wp, i) => {
              var text = i === 0 ? 'Pickup' : i === waypoints.length - 1 ? 'Destination' : 'Stop ' + i;
              var color = i === 0 ? '#199675' : i === waypoints.length - 1 ? '#FF5252' : '#FFA726';
              
              var customIcon = L.divIcon({
                html: '<div style="background-color:' + color + '; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">' + (i === 0 ? 'P' : i === waypoints.length - 1 ? 'D' : i) + '</div>',
                className: '',
                iconSize: [24, 24]
              });
              
              L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map).bindPopup(text);
            });

            // Draw route
            var routingControl = L.Routing.control({
              waypoints: waypoints,
              routeWhileDragging: false,
              createMarker: function() { return null; },
              lineOptions: { 
                styles: [{ color: '#199675', weight: 5 }] 
              },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              showAlternatives: false
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
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: isDark ? appColors.darkHeader : appColors.whiteColor }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Back />
      </TouchableOpacity>

      <WebView
        key={mapType + JSON.stringify(coordinates)}
        originWhitelist={['*']}
        source={{ html: getMapHtml(mapType) }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: windowHeight(10),
    left: windowHeight(10),
    zIndex: 1000,
    width: windowHeight(40),
    height: windowHeight(40),
    borderRadius: windowHeight(5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: appColors.blackColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
