// src/components/leftpanel/subguest/BusinessList.jsx

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import BusinessItem from './BusinessItem';
import MobileFilterSort from './MobileFilterSort';
import Masonry from 'react-masonry-css';
import { useMediaQuery } from '@chakra-ui/react';
import useBusinesses from '../../../hooks/useBusinesses';

const BusinessList = ({ handleSelectItem, selectedItem, viewType, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { businesses, loading, error, hasMore, loadMoreBusinesses } = useBusinesses(activeCategory);

  const [isLargerThanMobile] = useMediaQuery('(min-width: 768px)');

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter((business) =>
        typeof business.name === 'string' &&
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (business) =>
          typeof business.category === 'string' &&
          business.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return filtered;
  }, [businesses, searchTerm, activeCategory, sortBy]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSort = (sortOption) => {
    setSortBy(sortOption);
  };

  return (
    <div className="isotope-business-list">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search businesses..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter and Sort UI */}
      {isLargerThanMobile ? (
        <>
          {/* Category Filters */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`px-3 py-1 rounded ${category.color} ${
                  activeCategory.toLowerCase() === category.name.toLowerCase() ? 'ring-2 ring-black' : ''
                } text-white`}
                onClick={() => setActiveCategory(category.name)}
                aria-pressed={activeCategory.toLowerCase() === category.name.toLowerCase()}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="controls mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleSort('name')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Sort by Name
            </button>
            <button
              onClick={() => handleSort('price')}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Sort by Price
            </button>
            <button
              onClick={() => handleSort('rating')}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Sort by Rating
            </button>
          </div>
        </>
      ) : (
        <MobileFilterSort
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          handleSort={handleSort}
        />
      )}

      {/* Business Grid/List */}
      {isLargerThanMobile ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredBusinesses.map((item) => (
            <BusinessItem
              key={item.id}
              item={item}
              handleSelectItem={handleSelectItem}
              selectedItem={selectedItem}
              viewType={viewType}
            />
          ))}
        </Masonry>
      ) : (
        <div
          className={`grid-container grid gap-4 ${
            viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'flex flex-col'
          }`}
        >
          {filteredBusinesses.map((item) => (
            <BusinessItem
              key={item.id}
              item={item}
              handleSelectItem={handleSelectItem}
              selectedItem={selectedItem}
              viewType={viewType}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMoreBusinesses}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

BusinessList.propTypes = {
  handleSelectItem: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // Add other properties as needed
  }),
  viewType: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default BusinessList;
