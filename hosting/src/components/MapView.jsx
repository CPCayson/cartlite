import React, { useState, useCallback, useRef } from 'react';
import { Box, Flex, useMediaQuery , Text} from '@chakra-ui/react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
//import SearchBar from '../SearchBar/SearchBar';

const baySaintLouisBounds = {
  north: 30.3617,
  south: 30.2817,
  east: -89.2978,
  west: -89.4178,
};

const mapOptions = {
  tilt: 66,
  heading: 80,
  restriction: {
    latLngBounds: baySaintLouisBounds,
    strictBounds: true,
  },
  mapId: "6ff586e93e18149f", // Use a vector map style with 3D buildings
  streetViewControl: false, // Hide street view control if not needed
};

const MapComponent = ({ center, zoom, onBookRide }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // For Vite
  });

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [carts, setCarts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const markersRef = useRef([]);

  const onMapLoad = useCallback(async (map) => {
    setMap(map);
    await loadData(map);
  }, []);

  const loadData = async (map) => {
    if (!isLoaded) return;

    try {
      const [cartsSnapshot, placesSnapshot] = await Promise.all([
        getDocs(collection(db, 'carts')),
        getDocs(collection(db, 'places'))
      ]);

      const cartsData = cartsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const placesData = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setCarts(cartsData);
      setPlaces(placesData);

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for carts
      cartsData.forEach(cart => {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: { lat: cart.cartLoc.latitude, lng: cart.cartLoc.longitude, altitude: 20 }, // Adding altitude for levitation
          title: cart.cartName,
          content: createCustomMarker(cart.cartName), // Custom content for markers
        });

        marker.addListener('click', () => {
          setSelectedItem(cart);
          map.panTo({ lat: cart.cartLoc.latitude, lng: cart.cartLoc.longitude });
        });

        markersRef.current.push(marker);
      });
      // Add markers for places
      placesData.forEach(place => {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: { lat: place.latitude, lng: place.longitude, altitude: 20 }, // Adding altitude for levitation
          title: place.name,
          content: createCustomMarker(place.name), // Custom content for markers
        });

        marker.addListener('click', () => {
          setSelectedItem(place);
          map.panTo({ lat: place.latitude, lng: place.longitude });
        });

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createCustomMarker = (name) => {
    const pin = new window.google.maps.marker.PinElement({
      background: "#4b2e83",
      borderColor: "#b7a57a",
      glyphColor: "#b7a57a",
      scale: 2.0,
      glyph: name[0], // First letter of the name
    });

    return pin.element;
  };

  return (
    <Flex height="100vh" direction="column">
      {isLoaded ? (
        <>
          <Box position="absolute" top="20px" left="50%" transform="translateX(-50%)" zIndex="1" width="90%" maxWidth="600px">
            {/* <SearchBar
              map={map}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              destination={destination}
              setDestination={setDestination}
              onBookRide={onBookRide}
            /> */}
          </Box>
          <Flex flex="1" direction="row" mt="80px">
            <Box flex={1} position="relative">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={zoom}
                heading={80}
                tilt={120}
                onLoad={onMapLoad}
                options={mapOptions}
              >
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: '/assets/bar.png',
                      scaledSize: new window.google.maps.Size(60, 60),
                    }}
                  />
                )}
                {destination && (
                  <Marker
                    position={destination}
                    icon={{
                      url: '/assets/carrot.png',
                      scaledSize: new window.google.maps.Size(60, 60),
                    }}
                  />
                )}
                {selectedItem && (
                  <InfoWindow
                    position={{ lat: selectedItem.latitude || selectedItem.cartLoc.latitude, lng: selectedItem.longitude || selectedItem.cartLoc.longitude }}
                    onCloseClick={() => setSelectedItem(null)}
                  >
                    <Box>
                      <Text fontWeight="bold">{selectedItem.name || selectedItem.cartName}</Text>
                      <Text>{selectedItem.type || selectedItem.cartModel}</Text>
                      {selectedItem.capacity && <Text>Capacity: {selectedItem.capacity}</Text>}
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            </Box>
          </Flex>
        </>
      ) : (
        <div>Loading Map...</div>
      )}
    </Flex>
  );
}


export default React.memo(MapComponent);
