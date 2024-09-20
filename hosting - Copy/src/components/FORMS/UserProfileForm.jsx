// src/components/UserProfileForm.js

import React from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
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
import { useUserProfileForm } from '../../hooks/forms/useUserProfileForm';

const UserProfileForm = () => {
  const {
    profileData,
    loading,
    errors,
    uploadProgress,
    handleProfileChange,
    handleHeadshotUpload,
    handleSaveProfile,
  } = useUserProfileForm(); // Enhanced custom hook for handling form logic

  // Responsive sizes
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        User Profile
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
            {/* Headshot Upload */}
            <FormControl isRequired isInvalid={!!errors.headshot}>
              <FormLabel>Headshot Photo</FormLabel>
              <Box position="relative" width="150px" height="150px">
                <Image
                  src={profileData.headshot || 'https://via.placeholder.com/150'}
                  alt="Headshot"
                  boxSize="150px"
                  objectFit="cover"
                  borderRadius="full"
                  fallback={<Spinner />}
                />
                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress
                    size="sm"
                    value={uploadProgress}
                    position="absolute"
                    bottom="0"
                    left="0"
                    width="100%"
                    borderRadius="0 0 9999px 9999px"
                  />
                )}
              </Box>
              <Input
                type="file"
                accept="image/*"
                display="none"
                id="headshot-upload"
                onChange={handleHeadshotUpload}
              />
              <label htmlFor="headshot-upload">
                <Button
                  as="span"
                  size="sm"
                  colorScheme="teal"
                  mt={2}
                  isLoading={loading.uploading}
                >
                  Upload Headshot
                </Button>
              </label>
              {errors.headshot && <FormErrorMessage>{errors.headshot}</FormErrorMessage>}
            </FormControl>

            {/* Username */}
            <FormControl isRequired isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                placeholder="Enter your username"
              />
              {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
            </FormControl>

            {/* Email */}
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>

            {/* Phone Number */}
            <FormControl isInvalid={!!errors.phoneNumber}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phoneNumber"
                type="tel"
                value={profileData.phoneNumber}
                onChange={handleProfileChange}
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>}
            </FormControl>

            {/* Languages Spoken */}
            <FormControl isInvalid={!!errors.languagesSpoken}>
              <FormLabel>Languages Spoken</FormLabel>
              <Input
                name="languagesSpoken"
                value={profileData.languagesSpoken}
                onChange={handleProfileChange}
                placeholder="e.g., English, Spanish"
              />
              {errors.languagesSpoken && <FormErrorMessage>{errors.languagesSpoken}</FormErrorMessage>}
            </FormControl>

            {/* Available Days and Hours */}
            <Box>
              <FormLabel mb={2}>Availability Schedule</FormLabel>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.availableDays}>
                  <FormLabel>Available Days</FormLabel>
                  <Select
                    name="availableDays"
                    value={profileData.availableDays}
                    onChange={handleProfileChange}
                    placeholder="Select days"
                    multiple
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </Select>
                  {errors.availableDays && <FormErrorMessage>{errors.availableDays}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!errors.availableHours}>
                  <FormLabel>Available Hours</FormLabel>
                  <Input
                    name="availableHours"
                    value={profileData.availableHours}
                    onChange={handleProfileChange}
                    placeholder="e.g., 8 AM - 8 PM"
                  />
                  {errors.availableHours && <FormErrorMessage>{errors.availableHours}</FormErrorMessage>}
                </FormControl>
              </VStack>
            </Box>

            {/* Favorite Restaurants */}
            <FormControl>
              <FormLabel>Favorite Restaurants</FormLabel>
              <Input
                name="favoriteRestaurants"
                value={profileData.favoriteRestaurants}
                onChange={handleProfileChange}
                placeholder="List your favorite restaurants"
              />
            </FormControl>

            {/* Favorite Bars */}
            <FormControl>
              <FormLabel>Favorite Bars</FormLabel>
              <Input
                name="favoriteBars"
                value={profileData.favoriteBars}
                onChange={handleProfileChange}
                placeholder="List your favorite bars"
              />
            </FormControl>

            {/* Favorite Events */}
            <FormControl>
              <FormLabel>Favorite Events</FormLabel>
              <Input
                name="favoriteEvents"
                value={profileData.favoriteEvents}
                onChange={handleProfileChange}
                placeholder="List your favorite events"
              />
            </FormControl>

            {/* Short Bio */}
            <FormControl>
              <FormLabel>Short Bio</FormLabel>
              <Textarea
                name="shortBio"
                value={profileData.shortBio}
                onChange={handleProfileChange}
                placeholder="Tell us a little about yourself..."
                resize="vertical"
              />
            </FormControl>

            {/* Driver's License Information */}
            <Box>
              <FormLabel mb={2}>Driver's License Information</FormLabel>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.licenseNumber}>
                  <FormLabel>License Number</FormLabel>
                  <Input
                    name="driverLicense.licenseNumber"
                    value={profileData.driverLicense.licenseNumber}
                    onChange={handleProfileChange}
                    placeholder="Enter your license number"
                  />
                  {errors.licenseNumber && <FormErrorMessage>{errors.licenseNumber}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.licenseState}>
                  <FormLabel>License State</FormLabel>
                  <Select
                    name="driverLicense.licenseState"
                    value={profileData.driverLicense.licenseState}
                    onChange={handleProfileChange}
                    placeholder="Select state"
                  >
                    {/* Add all states as options */}
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </Select>
                  {errors.licenseState && <FormErrorMessage>{errors.licenseState}</FormErrorMessage>}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.licenseExpiry}>
                  <FormLabel>License Expiry Date</FormLabel>
                  <Input
                    name="driverLicense.licenseExpiry"
                    type="date"
                    value={profileData.driverLicense.licenseExpiry}
                    onChange={handleProfileChange}
                  />
                  {errors.licenseExpiry && <FormErrorMessage>{errors.licenseExpiry}</FormErrorMessage>}
                </FormControl>
              </VStack>
            </Box>

            {/* Stripe Account Status */}
            <FormControl isRequired isInvalid={!!errors.stripeAccountStatus}>
              <FormLabel>Stripe Account Status</FormLabel>
              <Select
                name="stripeAccountStatus"
                value={profileData.stripeAccountStatus}
                onChange={handleProfileChange}
                placeholder="Select status"
              >
                <option value="not_created">Not Created</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
              {errors.stripeAccountStatus && <FormErrorMessage>{errors.stripeAccountStatus}</FormErrorMessage>}
            </FormControl>

            {/* Favorite Restaurants */}
            <FormControl>
              <FormLabel>Favorite Restaurants</FormLabel>
              <Input
                name="favoriteRestaurants"
                value={profileData.favoriteRestaurants}
                onChange={handleProfileChange}
                placeholder="List your favorite restaurants"
              />
            </FormControl>

            {/* Favorite Bars */}
            <FormControl>
              <FormLabel>Favorite Bars</FormLabel>
              <Input
                name="favoriteBars"
                value={profileData.favoriteBars}
                onChange={handleProfileChange}
                placeholder="List your favorite bars"
              />
            </FormControl>

            {/* Favorite Events */}
            <FormControl>
              <FormLabel>Favorite Events</FormLabel>
              <Input
                name="favoriteEvents"
                value={profileData.favoriteEvents}
                onChange={handleProfileChange}
                placeholder="List your favorite events"
              />
            </FormControl>

            {/* Short Bio */}
            <FormControl>
              <FormLabel>Short Bio</FormLabel>
              <Textarea
                name="shortBio"
                value={profileData.shortBio}
                onChange={handleProfileChange}
                placeholder="Tell us a little about yourself..."
                resize="vertical"
              />
            </FormControl>

            {/* Save Button */}
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleSaveProfile}
              isLoading={loading.saving}
              loadingText="Saving"
            >
              Save Profile
            </Button>
          </VStack>
        </Box>
      )}
    </Container>
  );
};

export default UserProfileForm;
