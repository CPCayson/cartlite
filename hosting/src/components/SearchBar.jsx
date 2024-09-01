import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Search } from 'lucide-react';
import { Input, Button, Popover, PopoverTrigger, PopoverContent, Select } from '@chakra-ui/react';

const SearchBar = () => {
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Current Location');
  const [countdownTime, setCountdownTime] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [bookingAmount, setBookingAmount] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);

  const destinationInputRef = useRef(null);
  const pickupInputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
      updateCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownTime]);

  const initAutocomplete = () => {
    const baySaintLouisBounds = {
      north: 30.3617,
      south: 30.2817,
      east: -89.2978,
      west: -89.4178,
    };

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(baySaintLouisBounds.south, baySaintLouisBounds.west),
      new google.maps.LatLng(baySaintLouisBounds.north, baySaintLouisBounds.east)
    );

    const options = {
      bounds: bounds,
      strictBounds: true,
      types: ['geocode'],
    };

    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInputRef.current, options);
    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        setDestination(place.formatted_address);
        setRandomBookingAmount();
      }
    });

    const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInputRef.current, options);
    pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        setPickupLocation(place.formatted_address);
      }
    });
  };

  const setRandomBookingAmount = () => {
    setBookingAmount(Math.floor(Math.random() * 91) + 10);
  };

  const handleTimeSelectChange = (event) => {
    const minutes = parseInt(event.target.value);
    if (minutes) {
      setCountdownTime(new Date(Date.now() + minutes * 60000));
      setShowCountdown(true);
      alert(`${minutes} minutes added!`);
    }
  };

  const updateCountdown = () => {
    if (!countdownTime) return;
    const diff = countdownTime - new Date();
    if (diff <= 0) {
      setShowCountdown(false);
      setCountdownTime(null);
      alert('Time is up!');
    }
  };

  const formatCountdown = () => {
    if (!countdownTime) return '';
    const diff = countdownTime - new Date();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleBook = () => {
    console.log('Booking:', { destination, pickupLocation, time: formatCountdown(), amount: bookingAmount });
    alert(`Booking confirmed for $${bookingAmount}`);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
          setPickupLocation(location);
        },
        error => {
          if (error.code === error.PERMISSION_DENIED) {
            alert('Location access denied. Please enable location settings in your browser.');
          }
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="search-bar-container"> {/* New container with glowing edges */}
      <div className="flex items-center space-x-2 p-4 rounded-lg bg-gray-100">
        <div className="flex-1 relative">
          <Input
            type="text"
            ref={destinationInputRef}
            placeholder="Enter destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <Popover>
          <PopoverTrigger>
            <Button variant="outline" className="w-[200px]">
              <MapPin className="mr-2 h-4 w-4" />
              {pickupLocation}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Pickup Location</h4>
                <p className="text-sm text-muted-foreground">
                  Choose your pickup location or enter a custom address.
                </p>
              </div>
              <Button onClick={handleCurrentLocation}>
                Use Current Location
              </Button>
              <Input
                type="text"
                ref={pickupInputRef}
                placeholder="Enter pickup location..."
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <Button variant="outline" className="w-[180px]">
              <Clock className="mr-2 h-4 w-4" />
              {showCountdown ? formatCountdown() : currentTime}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add Time</h4>
                <p className="text-sm text-muted-foreground">
                  Select a duration to add to the current time.
                </p>
              </div>
              <Select placeholder="Select time" onChange={handleTimeSelectChange}>
                <option value="10">10 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleBook} className="bg-blue-500 hover:bg-blue-600 text-white">
          ${bookingAmount} Book
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
