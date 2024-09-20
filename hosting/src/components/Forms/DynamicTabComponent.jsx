// src/components/DynamicTabComponent.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Select,
} from '@chakra-ui/react';
import CarrotRating from './CarrotRating';

const DynamicTabComponent = ({ place, onClose, submitReview }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (userRating === 0 || userReview.trim() === '') {
      // Handle validation in the form
      return;
    }
    submitReview({
      username: 'Anonymous', // Replace with actual username if available
      rating: userRating,
      comment: userReview,
    });
    setShowReviewForm(false);
    setUserRating(0);
    setUserReview('');
  };

  const tabContent = {
    ride: (
      <Box p={4}>
        <Text fontSize="lg" color="emerald.400" mb={4}>
          Get a Ride to {place.name}
        </Text>
        <Text color="emerald.300" mb={4}>
          Book a comfortable ride to visit this amazing place!
        </Text>
        <Button colorScheme="teal" size="lg">
          Book a Ride
        </Button>
      </Box>
    ),
    delivery: (
      <Box p={4}>
        <Text fontSize="lg" color="emerald.400" mb={4}>
          Order Delivery from {place.name}
        </Text>
        <Text color="emerald.300" mb={4}>
          Get fresh vegetables delivered straight to your door!
        </Text>
        <Button colorScheme="teal" size="lg">
          Start Order
        </Button>
      </Box>
    ),
    events: (
      <Box p={4}>
        <Text fontSize="lg" color="emerald.400" mb={4}>
          Upcoming Events at {place.name}
        </Text>
        <VStack align="start" spacing={2} mb={4}>
          <Text>🥕 Carrot Planting Workshop - Next Saturday</Text>
          <Text>🐰 Bunny Meet and Greet - Every Sunday</Text>
          <Text>🌱 Organic Gardening Seminar - First Friday of the month</Text>
        </VStack>
        <Button colorScheme="teal" size="lg">
          View All Events
        </Button>
      </Box>
    ),
    reviews: (
      <Box p={4}>
        <Box p={4} bg="black" rounded="lg" mb={4} border="1px" borderColor="emerald.400">
          <HStack justify="space-between" mb={2}>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="emerald.400">
                {place.ratings?.count || 0}
              </Text>
              <Text fontSize="sm" color="emerald.300">
                # of Ratings
              </Text>
            </Box>
            <Box>
              <HStack>
                <Text fontSize="2xl" fontWeight="bold" color="emerald.400">
                  {place.ratings?.average?.toFixed(1) || '0.0'}
                </Text>
                <CarrotRating rating={place.ratings?.average || 0} />
              </HStack>
              <Text fontSize="sm" color="emerald.300">
                Trusted Rabbit Rating
              </Text>
            </Box>
          </HStack>
        </Box>

        <Box>
          <Text fontSize="xl" fontWeight="semibold" color="emerald.400" mb={2}>
            Reviews
          </Text>
          {Array.isArray(place.reviews) && place.reviews.length > 0 ? (
            place.reviews.map((review, index) => (
              <Box key={index} mb={4} pb={4} borderBottom="1px" borderColor="emerald.700">
                <HStack justify="space-between" mb={2}>
                  <CarrotRating rating={review.rating} size="small" />
                  {review.userImage && (
                    <img
                      src={review.userImage}
                      alt={`${review.username}'s profile`}
                      className="w-8 h-8 rounded-full border border-emerald-400"
                    />
                  )}
                </HStack>
                <Text fontSize="sm" color="emerald.300">
                  {review.comment}
                </Text>
              </Box>
            ))
          ) : (
            <Text color="emerald.300">No reviews yet.</Text>
          )}

          <Button
            mt={4}
            px={4}
            py={2}
            bg="white"
            color="black"
            rounded="md"
            onClick={() => setShowReviewForm(!showReviewForm)}
            _hover={{ bg: 'orange.500' }}
            transition="background-color 0.3s"
          >
            {showReviewForm ? 'Cancel' : 'Leave a Review'}
          </Button>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mt-4">
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Your Rating</FormLabel>
                  <Select
                    placeholder="Select rating"
                    value={userRating}
                    onChange={(e) => setUserRating(Number(e.target.value))}
                  >
                    <option value={1}>1 Carrot</option>
                    <option value={2}>2 Carrots</option>
                    <option value={3}>3 Carrots</option>
                    <option value={4}>4 Carrots</option>
                    <option value={5}>5 Carrots</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Your Review</FormLabel>
                  <Textarea
                    placeholder="Write your review here..."
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    rows={4}
                  />
                </FormControl>

                <Button type="submit" colorScheme="teal" size="md">
                  Submit Review
                </Button>
              </VStack>
            </form>
          )}
        </Box>
      </Box>
    )};
};

    DynamicTabComponent.propTypes = {
      place: PropTypes.shape({
        name: PropTypes.string.isRequired,
        ratings: PropTypes.shape({
          count: PropTypes.number,
          average: PropTypes.number,
        }),
        reviews: PropTypes.arrayOf(
          PropTypes.shape({
            rating: PropTypes.number.isRequired,
            comment: PropTypes.string.isRequired,
            userImage: PropTypes.string,
            username: PropTypes.string,
          })
        ),
      }).isRequired,
      onClose: PropTypes.func.isRequired,
      submitReview: PropTypes.func.isRequired,
    };

    export default DynamicTabComponent;