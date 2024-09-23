// src/components/CartProfileForm.js

import React from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  Textarea,
  HStack,
  IconButton,
  Container,
  Heading,
  Spinner,
  Image,
  Progress,
  FormErrorMessage,
  useBreakpointValue,
  Stack,
  Select,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { useCartProfileForm } from '../../hooks/forms/useCartProfileForm';

const CartProfileForm = () => {
  const {
    cartData,
    loading,
    uploading,
    errors,
    uploadProgress,
    handleCartChange,
    handleFeatureToggle,
    handleCapacityChange,
    handleSaveCartInfo,
    handleImageUpload,
  } = useCartProfileForm(); // Enhanced custom hook for handling form logic

  // Responsive sizes
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Cart Profile
      </Heading>
      {loading.initialLoad ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box
          borderWidth={1}
          borderRadius="lg"
          p={6}
          bg="white"
          boxShadow="lg"
          w="100%"
        >
          <VStack spacing={6} align="stretch">
            {/* Cart Name */}
            <FormControl isRequired isInvalid={!!errors.cartName}>
              <FormLabel>Cart Name</FormLabel>
              <Input
                name="cartName"
                value={cartData.cartName}
                onChange={handleCartChange}
                placeholder="Enter cart name"
              />
              {errors.cartName && <FormErrorMessage>{errors.cartName}</FormErrorMessage>}
            </FormControl>

            {/* Cancellation Fee */}
            <FormControl isRequired={false} isInvalid={!!errors.cancellationFee}>
              <FormLabel>Cancellation Fee ($)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  name="cancellationFee"
                  value={cartData.cancellationFee}
                  onChange={handleCartChange}
                  placeholder="e.g., 5"
                />
              </NumberInput>
              {errors.cancellationFee && <FormErrorMessage>{errors.cancellationFee}</FormErrorMessage>}
            </FormControl>

            {/* Operating Hours */}
            <FormControl isRequired isInvalid={!!errors.operatingHours}>
              <FormLabel>Operating Hours</FormLabel>
              <Input
                name="operatingHours"
                value={cartData.operatingHours}
                onChange={handleCartChange}
                placeholder="e.g., 6 AM - 12 PM"
              />
              {errors.operatingHours && <FormErrorMessage>{errors.operatingHours}</FormErrorMessage>}
            </FormControl>

            {/* Capacity */}
            <FormControl isRequired isInvalid={!!errors.capacity}>
              <FormLabel>Capacity</FormLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  onClick={() => handleCapacityChange(-1)}
                  aria-label="Decrease capacity"
                  size="sm"
                />
                <Input
                  value={cartData.capacity}
                  readOnly
                  width="12"
                  textAlign="center"
                  fontSize="lg"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={() => handleCapacityChange(1)}
                  aria-label="Increase capacity"
                  size="sm"
                />
              </HStack>
              {errors.capacity && <FormErrorMessage>{errors.capacity}</FormErrorMessage>}
            </FormControl>

            {/* Description */}
            <FormControl isRequired isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={cartData.description}
                onChange={handleCartChange}
                placeholder="Describe your cart and services..."
                resize="vertical"
              />
              {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
            </FormControl>

            {/* Features */}
            <Box>
              <FormLabel mb={2}>Amenities</FormLabel>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between" align="center">
                  <Text>Wi-Fi Availability</Text>
                  <Switch
                    isChecked={cartData.features.wifi}
                    onChange={() => handleFeatureToggle('wifi')}
                    colorScheme="teal"
                  />
                </HStack>
                <HStack justify="space-between" align="center">
                  <Text>Charging Ports</Text>
                  <Switch
                    isChecked={cartData.features.chargingPorts}
                    onChange={() => handleFeatureToggle('chargingPorts')}
                    colorScheme="teal"
                  />
                </HStack>
                <HStack justify="space-between" align="center">
                  <Text>Climate Control</Text>
                  <Switch
                    isChecked={cartData.features.climateControl}
                    onChange={() => handleFeatureToggle('climateControl')}
                    colorScheme="teal"
                  />
                </HStack>
              </VStack>
            </Box>

            {/* Vehicle Details */}
            <Box>
              <FormLabel mb={2}>Vehicle Details</FormLabel>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.model}>
                  <FormLabel>Model</FormLabel>
                  <Input
                    name="vehicleDetails.model"
                    value={cartData.vehicleDetails.model}
                    onChange={handleCartChange}
                    placeholder="e.g., EZGO RXV"
                  />
                  {errors.model && <FormErrorMessage>{errors.model}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.year}>
                  <FormLabel>Year</FormLabel>
                  <NumberInput min={1950} max={new Date().getFullYear()}>
                    <NumberInputField
                      name="vehicleDetails.year"
                      value={cartData.vehicleDetails.year}
                      onChange={handleCartChange}
                      placeholder="e.g., 2020"
                    />
                  </NumberInput>
                  {errors.year && <FormErrorMessage>{errors.year}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.registrationDetails}>
                  <FormLabel>Registration Details</FormLabel>
                  <Input
                    name="vehicleDetails.registrationDetails"
                    value={cartData.vehicleDetails.registrationDetails}
                    onChange={handleCartChange}
                    placeholder="Enter registration details"
                  />
                  {errors.registrationDetails && <FormErrorMessage>{errors.registrationDetails}</FormErrorMessage>}
                </FormControl>
              </VStack>
            </Box>

            {/* Additional Images */}
            <Box>
              <FormLabel mb={2}>Additional Images</FormLabel>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={4}
                overflowX={isMobile ? 'visible' : 'auto'}
              >
                {cartData.images.map((image, index) => (
                  <Box key={index} position="relative" width="100%" maxW="150px">
                    <Image
                      src={image}
                      alt={`Cart Image ${index + 1}`}
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="md"
                      fallback={<Spinner />}
                    />
                    {/* Upload Progress */}
                    {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                      <Progress
                        size="xs"
                        value={uploadProgress[index]}
                        position="absolute"
                        bottom="0"
                        left="0"
                        width="100%"
                        borderRadius="0 0 8px 8px"
                      />
                    )}
                    {/* Upload Button */}
                    <Input
                      type="file"
                      accept="image/*"
                      display="none"
                      id={`image-upload-${index}`}
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                    <label htmlFor={`image-upload-${index}`}>
                      <Button
                        as="span"
                        size="sm"
                        colorScheme="teal"
                        position="absolute"
                        bottom={uploadProgress[index] === 100 ? '40px' : '0'}
                        left="50%"
                        transform="translateX(-50%)"
                        mt={2}
                        opacity={uploadProgress[index] === 100 ? 0 : 1}
                        isLoading={uploading && uploadProgress[index] > 0 && uploadProgress[index] < 100}
                      >
                        {uploadProgress[index] === 100 ? 'Uploaded' : 'Upload'}
                      </Button>
                    </label>
                  </Box>
                ))}
              </Stack>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Upload additional images to showcase your cart's interior and different angles.
              </Text>
            </Box>

            {/* Ratings and Reviews */}
            <Box>
              <FormLabel mb={2}>Ratings and Reviews</FormLabel>
              <Box>
                <Text fontWeight="bold">Average Rating: {cartData.averageRating.toFixed(1)} / 5</Text>
                {/* Implement displaying past reviews fetched from Firebase */}
                {/* This can be a list of review components */}
                {cartData.reviews.length > 0 ? (
                  <VStack align="stretch" spacing={3} mt={4}>
                    {cartData.reviews.map((review, idx) => (
                      <Box key={idx} p={4} borderWidth={1} borderRadius="md">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{review.username}</Text>
                          <Text>{review.rating} / 5</Text>
                        </HStack>
                        <Text mt={2}>{review.comment}</Text>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text mt={4}>No reviews yet.</Text>
                )}
              </Box>
            </Box>

            {/* Estimated Pickup Time */}
            <FormControl isInvalid={!!errors.estimatedPickupTime}>
              <FormLabel>Estimated Pickup Time</FormLabel>
              <Input
                name="estimatedPickupTime"
                value={cartData.estimatedPickupTime}
                onChange={handleCartChange}
                placeholder="e.g., 15 minutes from now"
              />
              {errors.estimatedPickupTime && <FormErrorMessage>{errors.estimatedPickupTime}</FormErrorMessage>}
            </FormControl>

            {/* Fare Estimation Tool */}
            <Box>
              <FormLabel mb={2}>Fare Estimation</FormLabel>
              {/* Assuming this tool is already implemented */}
              <Text fontSize="sm" color="gray.500">
                Use the fare estimation tool to help riders understand the cost based on their input locations.
              </Text>
            </Box>

            {/* Save Button */}
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleSaveCartInfo}
              isLoading={loading.saving}
              loadingText="Saving"
            >
              Save Cart Info
            </Button>
          </VStack>
        </Box>
      )}
    </Container>
  );
};

export default CartProfileForm;
