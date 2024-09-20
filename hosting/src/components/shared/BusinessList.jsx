// src/components/leftpanel/subguest/BusinessList.jsx

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Isotope from 'isotope-layout';
import BusinessItem from './BusinessItem';
import useBusinesses from '@hooks/useBusinessesHook'; // Adjust the path
import useAppState from '@hooks/useAppState'; // Adjust the path

const BusinessList = ({ categories }) => {
  const [filterKey, setFilterKey] = useState('*');
  const [sortByKey, setSortByKey] = useState('original-order');
  const gridRef = useRef(null);
  const iso = useRef(null);

  const { businesses, loading, error } = useBusinesses();
  const { selectedItem, handleSelectItem } = useAppState();

  useEffect(() => {
    // Initialize Isotope
    iso.current = new Isotope(gridRef.current, {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows',
      getSortData: {
        name: '.name',
        price: '[data-price] parseFloat',
        rating: '[data-rating] parseFloat',
      },
    });

    // Cleanup
    return () => {
      if (iso.current) iso.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (iso.current) {
      iso.current.arrange({ filter: filterKey, sortBy: sortByKey });
    }
  }, [filterKey, sortByKey, businesses]);

  const handleFilter = (category) => {
    setFilterKey(category === 'all' ? '*' : `.${category.toLowerCase()}`);
  };

  const handleSort = (sortKey) => {
    setSortByKey(sortKey);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {/* Filter Buttons */}
      <div className="filters mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleFilter(category.name)}
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
      <div className="sorts mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleSort('name')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Sort by Name
        </button>
        <button
          onClick={() => handleSort('price')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Sort by Price
        </button>
        <button
          onClick={() => handleSort('rating')}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Sort by Rating
        </button>
      </div>

      {/* Grid */}
      <div className="grid" ref={gridRef}>
        {businesses.map((business) => (
          <div
            key={business.id}
            className={`grid-item ${business.category.toLowerCase()}`}
            data-price={business.price}
            data-rating={business.rating}
          >
            <BusinessItem
              item={business}
              selectedItem={selectedItem}
              handleSelectItem={handleSelectItem}
            />
          </div>
        ))}
      </div>
    </>
  );
};

BusinessList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
};

export default BusinessList;
