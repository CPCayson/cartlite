import React from 'react';
import {
  Box, VStack, FormControl, FormLabel, Input, Button, Switch, Textarea, HStack, IconButton, Container, Heading, Spinner, Image,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useCartProfileForm } from '../../hooks/forms/useCartProfileForm';

const CartProfileForm = () => {
  const {
    cartData,
    loading,
    uploading,
    handleCartChange,
    handleFeatureToggle,
    handleCapacityChange,
    handleSaveCartInfo,
    handleImageUpload, // Image upload handler
  } = useCartProfileForm(); // Custom hook for handling form logic

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">Cart Profile</Heading>
      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Box borderWidth={1} borderRadius="lg" p={6} bg="white" boxShadow="lg">
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Cart Name</FormLabel>
              <Input name="cartName" value={cartData.cartName} onChange={handleCartChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Capacity</FormLabel>
              <HStack>
                <IconButton icon={<MinusIcon />} onClick={() => handleCapacityChange(-1)} aria-label="Decrease capacity" />
                <Input value={cartData.capacity} readOnly width="12" textAlign="center" />
                <IconButton icon={<AddIcon />} onClick={() => handleCapacityChange(1)} aria-label="Increase capacity" />
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={cartData.description}
                onChange={handleCartChange}
                placeholder="Describe your cart..."
              />
            </FormControl>
            <Box>
              <FormLabel mb={2}>Features</FormLabel>
              <VStack align="stretch" spacing={3}>
                {Object.entries(cartData.features).map(([feature, value]) => (
                  <HStack key={feature} justify="space-between" align="center">
                    <Box>{feature.replace(/([A-Z])/g, ' $1')}</Box>
                    <Switch isChecked={value} onChange={() => handleFeatureToggle(feature)} />
                  </HStack>
                ))}
              </VStack>
            </Box>
            <Box>
              <FormLabel>Images</FormLabel>
              <HStack spacing={4}>
                {cartData.images.map((image, index) => (
                  <Box key={index} boxSize="150px" position="relative">
                    <Image src={image} alt={`Cart Image ${index + 1}`} boxSize="100%" objectFit="cover" />
                    <Input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`image-upload-${index}`}
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                    <label htmlFor={`image-upload-${index}`} style={{ cursor: 'pointer', position: 'absolute', top: 0, right: 0 }}>
                      <Button size="sm" isLoading={uploading}>Upload</Button>
                    </label>
                  </Box>
                ))}
              </HStack>
            </Box>
            <Button colorScheme="teal" size="lg" onClick={handleSaveCartInfo}>
              Save Cart Info
            </Button>
          </VStack>
        </Box>
      )}
    </Container>
  );
};

export default CartProfileForm;
