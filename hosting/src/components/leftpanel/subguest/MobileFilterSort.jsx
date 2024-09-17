// src/components/MobileFilterSort.jsx
import { useState } from 'react';
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
import PropTypes from 'prop-types';

const MobileFilterSort = ({ categories, activeCategory, setActiveCategory, handleSort }) => {
  const [isOpen, setIsOpen] = useState(false);

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
                  variant={activeCategory === category.name ? 'solid' : 'outline'}
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
              >
                Name
              </Button>
              <Button
                onClick={() => {
                  handleSort('price');
                  setIsOpen(false);
                }}
              >
                Price
              </Button>
              <Button
                onClick={() => {
                  handleSort('rating');
                  setIsOpen(false);
                }}
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

MobileFilterSort.propTypes = {
  categories: PropTypes.array.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
};

export default MobileFilterSort;
