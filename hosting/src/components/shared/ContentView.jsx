// src/components/shared/ContentView.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@chakra-ui/react'; // Correctly import Spinner
import ItemCard from '@components/shared/ItemCard';
import useBusinessesHook from '@hooks/useBusinessesHook'; // Adjust path as needed

const ContentView = ({ viewType, activeSort, setActiveSort }) => {
  const {
    filteredBusinesses,
    loading,
    error,
    hasMore,
    loadMoreBusinesses,
    setSearchTerm,
    setSortBy,
    sortBy,
    searchTerm,
    handleSelectItem,
  } = useBusinessesHook(); // No need to pass category here as it's managed in BusinessContext

  const [expandedItemId, setExpandedItemId] = useState(null); // For managing expanded view in list mode

  const handleToggleExpand = (itemId) => {
    setExpandedItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  // Log filteredBusinesses to verify uniqueness (remove in production)
  useEffect(() => {
    console.log('Filtered Businesses:', filteredBusinesses);
  }, [filteredBusinesses]);

  if (loading && filteredBusinesses.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="xl" color="purple.500" /> {/* Spinner Component */}
      </div>
    );
  }

  if (error && filteredBusinesses.length === 0) {
    return <div className="text-center text-red-500">Error: {error}</div>; // Handle errors
  }

  return (
    <div>
      {/* View Toggle Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={() => setSortBy('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              sortBy === 'all' ? 'bg-white text-purple-700' : 'bg-white bg-opacity-20 text-white'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            aria-pressed={sortBy === 'all'}
            aria-label="Sort by All"
          >
            All
          </button>
          <button
            onClick={() => setSortBy('food')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              sortBy === 'food' ? 'bg-white text-purple-700' : 'bg-white bg-opacity-20 text-white'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            aria-pressed={sortBy === 'food'}
            aria-label="Sort by Food"
          >
            Food
          </button>
          {/* Add more sort options if needed */}
        </div>
      </div>

      {/* List View */}
      {viewType === 'list' ? (
        <ul className="space-y-4">
          {filteredBusinesses.map((business) => (
            <li key={business.id}> {/* Ensure business.id is unique */}
              <ItemCard
                item={business}
                viewType={viewType}
                isExpanded={expandedItemId === business.id}
                onToggleExpand={() => handleToggleExpand(business.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        /* Grid View */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          style={{ gridAutoRows: 'minmax(150px, auto)' }} // Ensures consistent height
        >
          {filteredBusinesses.map((business) => (
            <ItemCard
              key={business.id} // Ensure business.id is unique
              item={business}
              viewType={viewType}
              isExpanded={false} // No expansion in grid view
              onToggleExpand={() => {}}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMoreBusinesses}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Load more businesses"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

ContentView.propTypes = {
  viewType: PropTypes.oneOf(['list', 'grid']).isRequired, // List or grid view type
  activeSort: PropTypes.string.isRequired, // Sorting filter
  setActiveSort: PropTypes.func.isRequired, // Function to set sort option
};

export default ContentView;
