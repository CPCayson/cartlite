// src/components/leftpanel/subguest/BusinessItem.jsx

import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Button, Box, Text, VStack, HStack } from '@chakra-ui/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import useAppState from '@hooks/useAppState';

/**
 * BusinessItem component represents a single business in the list or grid.
 * It can expand to show more details with "Book Now" and "Collapse" buttons.
 */
const BusinessItem = ({ item, viewType }) => {
  // Ensure item.category is a string before calling toLowerCase
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : 'unknown';
  const { selectedItem, handleSelectItem } = useAppState();

  // Map category to color
  const categoryColor = useMemo(() => {
    switch (category) {
      case 'food':
        return 'green.100';
      case 'store':
        return 'purple.100';
      case 'bar':
        return 'yellow.100';
      case 'entertainment':
        return 'blue.100';
      case 'rental':
        return 'indigo.100';
      case 'theater':
        return 'pink.100';
      // Add more categories as needed
      default:
        return 'gray.100';
    }
  }, [category]);

  // Determine if this item is selected
  const isSelected = selectedItem && selectedItem.id === item.id;

  // Handler to collapse the expanded view
  const handleCollapse = (e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    handleSelectItem(null);
  };

  // Handler for "Book Now" action
  const handleBookNow = (e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    // Implement your booking logic here
    // For example, navigate to a booking page or open a modal
    console.log(`Booking now for ${item.name}`);
    // Example: window.location.href = `/booking/${item.id}`;
  };

  return (
    <Box
      bg={categoryColor}
      p={4}
      rounded="lg"
      shadow="md"
      cursor="pointer"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
      border={isSelected ? '2px solid blue' : 'none'}
      onClick={() => handleSelectItem(isSelected ? null : item)}
    >
      {viewType === 'grid' ? (
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold" fontSize="lg" color="gray.800">
            {item.name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {item.type_of_place}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {item.product_services}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Rating: {item.rating || 'No rating'}
          </Text>
          {item.price !== undefined && (
            <Box mt={2}>
              <Text bg="green.500" color="white" px={2} py={1} rounded="md" fontSize="xs">
                Price: ${item.price.toFixed(2)}
              </Text>
            </Box>
          )}

          {/* Expanded View */}
          {isSelected && (
            <VStack align="stretch" spacing={2} mt={2}>
              <Button colorScheme="blue" size="sm" onClick={handleBookNow}>
                Book Now
              </Button>
              <Button variant="outline" size="sm" onClick={handleCollapse}>
                Collapse
              </Button>
            </VStack>
          )}
        </VStack>
      ) : (
        // List View
        <VStack align="start" spacing={2}>
          <HStack justifyContent="space-between" w="100%">
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {item.name}
            </Text>
            {isSelected ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronUp size={20} />
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600">
            {item.type_of_place}
          </Text>
          <HStack spacing={4}>
            <Text fontSize="xs" color="gray.600">
              {item.product_services}
            </Text>
            <Text fontSize="xs" color="gray.600">
              Rating: {item.rating || 'No rating'}
            </Text>
          </HStack>
          {item.price !== undefined && (
            <Box mt={2}>
              <Text bg="green.500" color="white" px={2} py={1} rounded="md" fontSize="xs">
                Price: ${item.price.toFixed(2)}
              </Text>
            </Box>
          )}

          {/* Expanded View */}
          {isSelected && (
            <VStack align="stretch" spacing={2} mt={2}>
              <Button colorScheme="blue" size="sm" onClick={handleBookNow}>
                Book Now
              </Button>
              <Button variant="outline" size="sm" onClick={handleCollapse}>
                Collapse
              </Button>
            </VStack>
          )}
        </VStack>
      )}
    </Box>
  );
};

BusinessItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string, // Now always a string
    name: PropTypes.string.isRequired,
    type_of_place: PropTypes.string,
    product_services: PropTypes.string,
    rating: PropTypes.number,
    price: PropTypes.number,
    // Add other properties as needed
  }).isRequired,
  viewType: PropTypes.string.isRequired,
};

export default BusinessItem;
