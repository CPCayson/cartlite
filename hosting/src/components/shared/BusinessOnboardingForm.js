import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  Switch,
  Textarea,
  Heading,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaBuilding, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig'; // Adjust the path as necessary

const BusinessRegistrationForm = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    email: '',
    website: '',
    contactName: '',
    contactRole: '',
    termsAccepted: false,
    privacyAccepted: false,
    pickupDropoff: false,
    adsAndBooking: false,
    itemFoodPickup: false,
    customerReviews: false,
    comments: '',
    preferredContactTime: '',
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName) newErrors.businessName = 'Business Name is required';
    if (!formData.businessType) newErrors.businessType = 'Business Type is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms and Conditions';
    if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the Privacy Policy';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Add the form data to the 'EasterEggs' collection in Firestore
        await addDoc(collection(db, 'EasterEggs'), formData);

        toast({
          title: "Form submitted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Reset the form
        setFormData({
          businessName: '',
          businessType: '',
          phone: '',
          email: '',
          website: '',
          contactName: '',
          contactRole: '',
          termsAccepted: false,
          privacyAccepted: false,
          pickupDropoff: false,
          adsAndBooking: false,
          itemFoodPickup: false,
          customerReviews: false,
          comments: '',
          preferredContactTime: '',
        });
      } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          title: "Submission failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-br, #39d2c0, #ee8b60)"
      p={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Grid
        templateColumns={["1fr", "1fr", "2fr 1fr"]}
        gap={8}
        w="full"
        maxW="1400px"
      >
        <GridItem>
          <Box
            bg="rgba(255, 255, 255, 0.2)"
            backdropFilter="blur(10px)"
            borderRadius="xl"
            boxShadow="xl"
            p={8}
            position="relative"
            overflow="hidden"
          >
            <Heading as="h1" size="xl" mb={6} color="#14181b">Business Registration</Heading>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading as="h2" size="md" mb={4} color="#14181b">Basic Information</Heading>
                  <Flex direction={['column', 'column', 'row']} gap={6}>
                    <FormControl isInvalid={errors.businessName}>
                      <FormLabel htmlFor="businessName" color="#14181b">Business Name</FormLabel>
                      <Flex align="center" bg="rgba(255, 255, 255, 0.3)" borderRadius="md" px={2}>
                        <FaBuilding color="#39d2c0" />
                        <Input
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          ml={2}
                          border="none"
                          color="#14181b"
                          _placeholder={{ color: "gray.600" }}
                          _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                          _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                        />
                      </Flex>
                      {errors.businessName && <Text color="red.500" fontSize="sm">{errors.businessName}</Text>}
                    </FormControl>

                    <FormControl isInvalid={errors.businessType}>
                      <FormLabel htmlFor="businessType" color="#14181b">Business Type</FormLabel>
                      <Select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        placeholder="Select Type"
                        bg="rgba(255, 255, 255, 0.3)"
                        border="none"
                        color="#14181b"
                        _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                        _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                      >
                        <option value="Restaurant">Restaurant</option>
                        <option value="Retail">Retail</option>
                        <option value="Service">Service</option>
                        <option value="Other">Other</option>
                      </Select>
                      {errors.businessType && <Text color="red.500" fontSize="sm">{errors.businessType}</Text>}
                    </FormControl>
                  </Flex>
                </Box>

                {/* Contact Information */}
                <Box>
                  <Heading as="h2" size="md" mb={4} color="#14181b">Contact Information</Heading>
                  <Flex direction={['column', 'column', 'row']} gap={6}>
                    <FormControl>
                      <FormLabel htmlFor="phone" color="#14181b">Phone</FormLabel>
                      <Flex align="center" bg="rgba(255, 255, 255, 0.3)" borderRadius="md" px={2}>
                        <FaPhone color="#39d2c0" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          ml={2}
                          border="none"
                          color="#14181b"
                          _placeholder={{ color: "gray.600" }}
                          _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                          _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                        />
                      </Flex>
                    </FormControl>

                    <FormControl isInvalid={errors.email}>
                      <FormLabel htmlFor="email" color="#14181b">Email</FormLabel>
                      <Flex align="center" bg="rgba(255, 255, 255, 0.3)" borderRadius="md" px={2}>
                        <FaEnvelope color="#39d2c0" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          ml={2}
                          border="none"
                          color="#14181b"
                          _placeholder={{ color: "gray.600" }}
                          _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                          _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                        />
                      </Flex>
                      {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
                    </FormControl>
                  </Flex>
                </Box>

                {/* Service Options */}
                <Box>
                  <Heading as="h2" size="md" mb={4} color="#14181b">Service Options</Heading>
                  <VStack align="start" spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="pickupDropoff" mb="0" color="#14181b">
                        Pickup/Drop-off Service
                      </FormLabel>
                      <Switch
                        id="pickupDropoff"
                        name="pickupDropoff"
                        isChecked={formData.pickupDropoff}
                        onChange={handleChange}
                        colorScheme="teal"
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="adsAndBooking" mb="0" color="#14181b">
                        Ads and Easy Booking
                      </FormLabel>
                      <Switch
                        id="adsAndBooking"
                        name="adsAndBooking"
                        isChecked={formData.adsAndBooking}
                        onChange={handleChange}
                        colorScheme="teal"
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="itemFoodPickup" mb="0" color="#14181b">
                        Item/Food Pickup
                      </FormLabel>
                      <Switch
                        id="itemFoodPickup"
                        name="itemFoodPickup"
                        isChecked={formData.itemFoodPickup}
                        onChange={handleChange}
                        colorScheme="teal"
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="customerReviews" mb="0" color="#14181b">
                        Customer Reviews and Pictures
                      </FormLabel>
                      <Switch
                        id="customerReviews"
                        name="customerReviews"
                        isChecked={formData.customerReviews}
                        onChange={handleChange}
                        colorScheme="teal"
                      />
                    </FormControl>
                  </VStack>
                </Box>

                {/* Additional Information */}
                <Box>
                  <Heading as="h2" size="md" mb={4} color="#14181b">Additional Information</Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel htmlFor="comments" color="#14181b">Comments</FormLabel>
                      <Textarea
                        id="comments"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        placeholder="Any additional comments or requests?"
                        bg="rgba(255, 255, 255, 0.3)"
                        border="none"
                        color="#14181b"
                        _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                        _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="preferredContactTime" color="#14181b">Preferred Contact Time</FormLabel>
                      <Flex align="center" bg="rgba(255, 255, 255, 0.3)" borderRadius="md" px={2}>
                        <FaClock color="#39d2c0" />
                        <Input
                          id="preferredContactTime"
                          name="preferredContactTime"
                          type="time"
                          value={formData.preferredContactTime}
                          onChange={handleChange}
                          ml={2}
                          border="none"
                          color="#14181b"
                          _hover={{ bg: "rgba(255, 255, 255, 0.4)" }}
                          _focus={{ bg: "rgba(255, 255, 255, 0.4)", boxShadow: "outline" }}
                        />
                      </Flex>
                    </FormControl>
                  </VStack>
                </Box>

                {/* Terms and Submit */}
                <Box>
                  <FormControl isInvalid={errors.termsAccepted}>
                    <Checkbox
                      id="termsAccepted"
                      name="termsAccepted"
                      isChecked={formData.termsAccepted}
                      onChange={handleChange}
                      colorScheme="teal"
                    >
                      <Text color="#14181b">I accept the terms and conditions</Text>
                    </Checkbox>
                    {errors.termsAccepted && <Text color="red.500" fontSize="sm">{errors.termsAccepted}</Text>}
                  </FormControl>

                  <FormControl isInvalid={errors.privacyAccepted} mt={2}>
                    <Checkbox
                      id="privacyAccepted"
                      name="privacyAccepted"
                      isChecked={formData.privacyAccepted}
                      onChange={handleChange}
                      colorScheme="teal"
                    >
                      <Text color="#14181b">I accept the privacy policy</Text>
                    </Checkbox>
                    {errors.privacyAccepted && <Text color="red.500" fontSize="sm">{errors.privacyAccepted}</Text>}
                  </FormControl>

                  <Button
                    type="submit"
                    bg="#39d2c0"
                    color="white"
                    _hover={{ bg: "#2fa898" }}
                    width="full"
                    mt={6}
                  >
                    Submit Registration
                  </Button>
                </Box>
              </VStack>
            </form>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default BusinessRegistrationForm;
