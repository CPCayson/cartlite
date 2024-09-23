import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@chakra-ui/react';
import ItemCard from '@components/shared/ItemCard';
import useBusinessesHook from '@hooks/useBusinessesHook';

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
  } = useBusinessesHook();

  const [expandedItemId, setExpandedItemId] = useState(null);
  const [visibleItems, setVisibleItems] = useState(3);
  const [cachedBusinesses, setCachedBusinesses] = useState([]);

  const handleToggleExpand = (itemId) => {
    setExpandedItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  useEffect(() => {
    setCachedBusinesses(filteredBusinesses.slice(0, visibleItems));
  }, [filteredBusinesses, visibleItems]);

  useEffect(() => {
    console.log('Filtered Businesses:', filteredBusinesses);
  }, [filteredBusinesses]);

  if (loading && cachedBusinesses.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="xl" color="purple.500" />
      </div>
    );
  }

  if (error && cachedBusinesses.length === 0) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {viewType === 'list' ? (
        <ul className="space-y-4">
          {cachedBusinesses.map((business, index) => (
            <li key={`${business.id}-${index}`}>
              <ItemCard
                item={business}
                viewType={viewType}
                isExpanded={expandedItemId === business.id}
                onToggleExpand={() => handleToggleExpand(business.id)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setVisibleItems((prev) => prev + 3);
              loadMoreBusinesses();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Load more businesses"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

ContentView.propTypes = {
  viewType: PropTypes.oneOf(['list']).isRequired,
  activeSort: PropTypes.string.isRequired,
  setActiveSort: PropTypes.func.isRequired,
};

export default ContentView;