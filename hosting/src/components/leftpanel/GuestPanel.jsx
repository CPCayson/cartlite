// src/components/leftpanel/GuestPanel.jsx
import React from 'react';
import PropTypes from 'prop-types';
import BusinessList from './subguest/BusinessList';

const GuestPanel = ({
  handleSelectItem,
  selectedItem,
  viewType,
  categories,
  loading,
  error,
}) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <BusinessList
      handleSelectItem={handleSelectItem}
      selectedItem={selectedItem}
      viewType={viewType}
      categories={categories}
    />
  );
};

GuestPanel.propTypes = {
  handleSelectItem: PropTypes.func.isRequired,
  selectedItem: PropTypes.object,
  viewType: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default GuestPanel;
