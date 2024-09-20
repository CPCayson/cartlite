import PropTypes from 'prop-types';
import { Flex } from '@chakra-ui/react';

const MapControls = ({ children }) => {
  return (
    <Flex
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex="10"
    >
      {children}
    </Flex>
  );
};

MapControls.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MapControls;