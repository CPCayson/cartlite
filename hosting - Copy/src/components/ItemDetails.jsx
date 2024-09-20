import React from 'react';
import { Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const ItemDetails = ({ selectedItem }) => {
  if (!selectedItem) return null;

  return (
    <>
      <Text fontSize="xl" fontWeight="bold">
        {selectedItem.name || 'Details'}
      </Text>
      <Text>{selectedItem.description}</Text>
    </>
  );
};

ItemDetails.propTypes = {
  selectedItem: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default ItemDetails;

