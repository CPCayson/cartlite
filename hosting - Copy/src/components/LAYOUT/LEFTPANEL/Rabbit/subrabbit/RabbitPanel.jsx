// src/components/LAYOUT/LEFTPANEL/Rabbit/subrabbit/RabbitPanel.jsx

import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import BusinessList from './BusinessList';
import useBusinessesHook from '@hooks/useBusinesses'; // Adjust path as needed

/**
 * RabbitPanel component displays a list or grid of businesses.
 */
const RabbitPanel = () => {
  // Consume business-related data using the custom hook
  const {
    filteredBusinesses,
    loading,
    error,
    setSearchTerm,
    sortBy,
    handleSortOption,
    viewType,
  } = useBusinessesHook();

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">Error: {error}</Text>;

  return (
    <BusinessList
      businesses={filteredBusinesses} // Passing filtered businesses from hook
      viewType={viewType} // Using viewType from context or hook
      categories={[
        { name: 'all', color: 'bg-red-500' },
        { name: 'Store', color: 'bg-purple-500' },
        { name: 'Food', color: 'bg-green-500' },
        { name: 'Bar', color: 'bg-yellow-500' },
        { name: 'Entertainment', color: 'bg-blue-500' },
        { name: 'Rental', color: 'bg-indigo-500' },
        { name: 'Theater', color: 'bg-pink-500' },
        // Add more categories as needed
      ]}
      sortBy={sortBy} // Using sorting from hook
      handleSort={handleSortOption} // Sort handler from hook
    />
  );
};

export default RabbitPanel;


