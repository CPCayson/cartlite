import React, { useState } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  Textarea,
  Grid,
  GridItem,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Stack,
  HStack,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { PlusSquareIcon, MinusIcon, AddIcon, ViewIcon } from '@chakra-ui/icons';

const TabbedSettingsForm = () => {
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [capacity, setCapacity] = useState(3);
  const [features, setFeatures] = useState({
    airConditioner: false,
    electric: true,
    radio: false,
    storage: true,
  });
  const [cartImages, setCartImages] = useState([
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
    'https://via.placeholder.com/150',
  ]);
  const [stripeConnected, setStripeConnected] = useState(false);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureToggle = (feature) => {
    setFeatures((prev) => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleCartImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCartImages((prev) => {
          const newImages = [...prev];
          newImages[index] = reader.result;
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStripeConnect = () => {
    setStripeConnected(!stripeConnected);
  };

  return (
    <Box maxW="3xl" mx="auto" p={5} borderWidth={1} borderRadius="md">
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Golf Cart</Tab>
          <Tab>Settings</Tab>
        </TabList>
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Profile Avatar</FormLabel>
                <Box
                  w="24"
                  h="24"
                  mb={4}
                  borderRadius="full"
                  borderWidth="1px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  <Image
                    src={profileAvatar || 'https://via.placeholder.com/96'}
                    alt="Avatar"
                    boxSize="full"
                    objectFit="cover"
                  />
                </Box>
                <Button as="label" htmlFor="avatarUpload" colorScheme="blue">
                  Upload Photo
                  <Input
                    type="file"
                    id="avatarUpload"
                    hidden
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                </Button>
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input placeholder="First Name" />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input placeholder="Last Name" />
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Email" />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input type="tel" placeholder="(123) 456-7890" />
              </FormControl>

              <Button colorScheme="teal" width="full">
                Save Profile
              </Button>
            </VStack>
          </TabPanel>

          {/* Golf Cart Tab */}
          <TabPanel>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Cart Name</FormLabel>
                <Input placeholder="Cart Name" defaultValue="Yomama" />
              </FormControl>

              <FormControl>
                <FormLabel>Capacity</FormLabel>
                <HStack>
                  <IconButton
                    icon={<MinusIcon />}
                    onClick={() => setCapacity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease capacity"
                  />
                  <Input value={capacity} readOnly width="12" textAlign="center" />
                  <IconButton
                    icon={<PlusSquareIcon />}
                    onClick={() => setCapacity((prev) => prev + 1)}
                    aria-label="Increase capacity"
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="This is a sample description of the cart. It has many features and is very comfortable."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Features</FormLabel>
                {Object.entries(features).map(([feature, value]) => (
                  <HStack key={feature} justifyContent="space-between" width="full">
                    <Box>{feature.replace(/([A-Z])/g, ' $1').trim()}</Box>
                    <Switch isChecked={value} onChange={() => handleFeatureToggle(feature)} />
                  </HStack>
                ))}
              </FormControl>

              <FormControl>
                <FormLabel>Cart Images</FormLabel>
                <HStack spacing={4}>
                  {cartImages.map((image, index) => (
                    <Box key={index} position="relative">
                      <Image src={image} boxSize="100px" objectFit="cover" borderRadius="md" />
                      <Input
                        type="file"
                        position="absolute"
                        top={0}
                        left={0}
                        opacity={0}
                        width="100px"
                        height="100px"
                        onChange={(e) => handleCartImageUpload(e, index)}
                      />
                      <IconButton
                        icon={<AddIcon />}
                        position="absolute"
                        top="0"
                        left="0"
                        aria-label="Upload cart image"
                        colorScheme="teal"
                        variant="ghost"
                      />
                    </Box>
                  ))}
                </HStack>
              </FormControl>

              <Button colorScheme="teal" width="full">
                Save Golf Cart Info
              </Button>
            </VStack>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel>
            <VStack spacing={4}>
              <Box>
                <FormLabel>Stripe Connect</FormLabel>
                {stripeConnected ? (
                  <Alert status="success">
                    <AlertIcon />
                    <AlertTitle mr={2}>Connected to Stripe</AlertTitle>
                    <AlertDescription>Your account is successfully connected to Stripe.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertTitle mr={2}>Not Connected</AlertTitle>
                    <AlertDescription>Connect your account to Stripe to start accepting payments.</AlertDescription>
                  </Alert>
                )}
              </Box>

              <Button
                colorScheme={stripeConnected ? 'red' : 'blue'}
                onClick={handleStripeConnect}
              >
                {stripeConnected ? 'Disconnect from Stripe' : 'Connect to Stripe'}
              </Button>

              {stripeConnected && (
                <Button variant="outline" colorScheme="blue" width="full" rightIcon={<ViewIcon />}>
                  View Stripe Dashboard
                </Button>
              )}

              <FormControl>
                <FormLabel>Stripe Account ID</FormLabel>
                <Input placeholder="acct_..." readOnly value="acct_1234567890" />
              </FormControl>

              <FormControl>
                <FormLabel>Payout Schedule</FormLabel>
                <Input as="select">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </Input>
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0">Automatic Payouts</FormLabel>
                <Switch isChecked={true} />
              </FormControl>

              <Button colorScheme="teal" width="full">
                Save Settings
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TabbedSettingsForm;
