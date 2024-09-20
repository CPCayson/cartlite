// src/components/LAYOUT/LEFTPANEL/Rabbit/subguest/MobileFilterSort.jsx

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { FilterIcon, ArrowDownUp } from 'lucide-react';
import useBusinessesHook from '@hooks/useBusinesses'; // Custom Hook to consume BusinessContext

const MobileFilterSort = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { categories, activeCategory, setActiveCategory, handleSort } = useBusinessesHook();

  return (
    <>
      <HStack justifyContent="space-between" mb={4}>
        <Button leftIcon={<FilterIcon />} onClick={() => setIsOpen(true)}>
          Filters
        </Button>
        <Button leftIcon={<ArrowDownUp />} onClick={() => setIsOpen(true)}>
          Sort
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter & Sort</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Filters */}
            <VStack align="start" spacing={4}>
              <Text fontWeight="bold">Categories</Text>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={activeCategory.toLowerCase() === category.name.toLowerCase() ? 'solid' : 'outline'}
                  colorScheme={category.color.replace('bg-', '')}
                  onClick={() => {
                    setActiveCategory(category.name);
                    setIsOpen(false); // Close modal after selection
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </VStack>

            {/* Sorting */}
            <VStack align="start" spacing={4} mt={8}>
              <Text fontWeight="bold">Sort By</Text>
              <Button
                onClick={() => {
                  handleSort('name');
                  setIsOpen(false);
                }}
                variant={activeCategory === 'name' ? 'solid' : 'outline'}
              >
                Name
              </Button>
              <Button
                onClick={() => {
                  handleSort('price');
                  setIsOpen(false);
                }}
                variant={activeCategory === 'price' ? 'solid' : 'outline'}
              >
                Price
              </Button>
              <Button
                onClick={() => {
                  handleSort('rating');
                  setIsOpen(false);
                }}
                variant={activeCategory === 'rating' ? 'solid' : 'outline'}
              >
                Rating
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Removed PropTypes since props are now consumed via Context
MobileFilterSort.propTypes = {
  // categories: PropTypes.array.isRequired,
  // activeCategory: PropTypes.string.isRequired,
  // setActiveCategory: PropTypes.func.isRequired,
  // handleSort: PropTypes.func.isRequired,
};

export default MobileFilterSort;
