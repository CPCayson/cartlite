// // src/components/LeftPanel.jsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import { Box, VStack, HStack, Button, Text } from '@chakra-ui/react';
// import { ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';
// import HostPanel from './leftpanel/HostPanel';
// import GuestPanel from './leftpanel/GuestPanel';

// const LeftPanel = ({
//   isOpen,
//   setIsOpen,
//   appMode,
//   handleSelectItem,
//   selectedItem,
//   viewType,
//   businesses,
//   darkMode,
//   isRightPanelOpen,
//   setIsRightPanelOpen,
//   fetchBusinesses,
//   loadingBusinesses,
//   errorBusinesses,
// }) => {
//   const [localViewType, setLocalViewType] = useState(viewType);

//   const bgColor = useMemo(() => (darkMode ? 'gray.800' : 'white'), [darkMode]);
//   const borderColor = useMemo(() => (darkMode ? 'gray.600' : 'gray.200'), [darkMode]);
//   const textColor = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

//   /**
//    * Toggles between list and grid view.
//    */
//   const toggleViewType = useCallback(() => {
//     setLocalViewType((prevType) => (prevType === 'list' ? 'grid' : 'list'));
//   }, []);

//   /**
//    * Toggles the panel open/closed state.
//    */
//   const togglePanelOpen = useCallback(() => {
//     setIsOpen((prev) => !prev);
//   }, [setIsOpen]);

//   /**
//    * Fetch businesses when the panel is open and in 'rabbit' mode.
//    */
//   useEffect(() => {
//     if (isOpen && appMode === 'rabbit') {
//       fetchBusinesses();
//     }
//   }, [isOpen, appMode, fetchBusinesses]);

//   const businessCategories = useMemo(
//     () => [
//       { name: 'all', color: 'bg-red-500' },
//       { name: 'Store', color: 'bg-purple-500' },
//       { name: 'Food', color: 'bg-green-500' },
//       { name: 'Bar', color: 'bg-yellow-500' },
//       // Add more categories as needed
//     ],
//     []
//   );

//   return (
//     <Box
//       width={isOpen ? { base: '100%', md: '30%' } : '0'}
//       height="100%"
//       transition="all 0.3s ease-in-out"
//       backgroundColor={bgColor}
//       borderRight={isOpen ? `1px solid ${borderColor}` : 'none'}
//       color={textColor}
//       overflow="hidden"
//       display={isOpen ? 'block' : 'none'}
//     >
//       {isOpen && (
//         <VStack spacing={4} align="stretch" p={4} height="100%" overflowY="auto">
//           {/* Header with toggle buttons */}
//           <HStack justifyContent="space-between">
//             <Button
//               leftIcon={isOpen ? <ChevronLeft /> : <ChevronRight />}
//               onClick={togglePanelOpen}
//               size="sm"
//               aria-label="Toggle Panel"
//             >
//               {isOpen ? 'Close' : 'Open'}
//             </Button>
//             {appMode === 'rabbit' && (
//               <Button
//                 leftIcon={localViewType === 'list' ? <Grid /> : <List />}
//                 onClick={toggleViewType}
//                 size="sm"
//                 aria-label="Toggle View"
//               >
//                 {localViewType === 'list' ? 'Grid View' : 'List View'}
//               </Button>
//             )}
//           </HStack>

//           {/* Title */}
//           <Text fontSize="xl" fontWeight="bold">
//             {appMode === 'host' ? 'Ride Requests' : 'Explore The Bay'}
//           </Text>

//           {/* Conditional Rendering based on appMode */}
//           {appMode === 'host' ? (
//             <HostPanel />
//           ) : (
//             <GuestPanel
//               businesses={businesses}
//               handleSelectItem={handleSelectItem}
//               selectedItem={selectedItem}
//               viewType={localViewType}
//               darkMode={darkMode}
//               loading={loadingBusinesses}
//               error={errorBusinesses}
//               categories={businessCategories}
//             />
//           )}
//         </VStack>
//       )}
//     </Box>
//   );
// };

// LeftPanel.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   setIsOpen: PropTypes.func.isRequired,
//   appMode: PropTypes.string.isRequired,
//   handleSelectItem: PropTypes.func.isRequired,
//   selectedItem: PropTypes.object,
//   viewType: PropTypes.string.isRequired,
//   businesses: PropTypes.array.isRequired,
//   darkMode: PropTypes.bool.isRequired,
//   isRightPanelOpen: PropTypes.bool.isRequired,
//   setIsRightPanelOpen: PropTypes.func.isRequired,
//   fetchBusinesses: PropTypes.func.isRequired,
//   loadingBusinesses: PropTypes.bool.isRequired,
//   errorBusinesses: PropTypes.string,
// };

// export default React.memo(LeftPanel);
// src/components/LeftPanel.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, HStack, Button, Text } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';
import HostPanel from './leftpanel/HostPanel';
import GuestPanel from './leftpanel/GuestPanel';

/**
 * LeftPanel component displays business listings or ride requests based on appMode.
 */
const LeftPanel = ({
  isOpen,
  setIsOpen,
  appMode,
  handleSelectItem,
  selectedItem,
  viewType,
  businesses,
  darkMode,
  isRightPanelOpen,
  setIsRightPanelOpen,
  fetchBusinesses,
  loadingBusinesses,
  errorBusinesses,
}) => {
  const [localViewType, setLocalViewType] = useState(viewType);

  const bgColor = useMemo(() => (darkMode ? 'gray.800' : 'white'), [darkMode]);
  const borderColor = useMemo(() => (darkMode ? 'gray.600' : 'gray.200'), [darkMode]);
  const textColor = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  /**
   * Toggles between list and grid view.
   */
  const toggleViewType = useCallback(() => {
    setLocalViewType((prevType) => (prevType === 'list' ? 'grid' : 'list'));
  }, []);

  /**
   * Toggles the panel open/closed state.
   */
  const togglePanelOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  /**
   * Fetch businesses when the panel is open and in 'rabbit' mode.
   */
  useEffect(() => {
    if (isOpen && appMode === 'rabbit') {
      fetchBusinesses();
    }
  }, [isOpen, appMode, fetchBusinesses]);

  const businessCategories = useMemo(
    () => [
      { name: 'all', color: 'bg-red-500' },
      { name: 'Store', color: 'bg-purple-500' },
      { name: 'Food', color: 'bg-green-500' },
      { name: 'Bar', color: 'bg-yellow-500' },
      { name: 'Entertainment', color: 'bg-blue-500' },
      { name: 'Rental', color: 'bg-indigo-500' },
      { name: 'Theater', color: 'bg-pink-500' },
      // Add more categories as needed
    ],
    []
  );

  // Determine if both panels are open
  const bothPanelsOpen = isOpen && isRightPanelOpen;

  return (
    <Box
      width={isOpen ? { base: '100%', md: '30%' } : '0'}
      height="100%"
      transition="all 0.3s ease-in-out"
      backgroundColor={bgColor}
      borderRight={isOpen ? `1px solid ${borderColor}` : 'none'}
      color={textColor}
      overflow="hidden"
      display={isOpen ? 'block' : 'none'}
    >
      {isOpen && (
        <VStack spacing={4} align="stretch" p={4} height="100%" overflowY="auto">
          {/* Header with toggle buttons */}
          <HStack justifyContent="space-between">
            <Button
              leftIcon={isOpen ? <ChevronLeft /> : <ChevronRight />}
              onClick={togglePanelOpen}
              size="sm"
              aria-label="Toggle Panel"
            >
              {isOpen ? 'Close' : 'Open'}
            </Button>
            {appMode === 'rabbit' && (
              <Button
                leftIcon={localViewType === 'list' ? <Grid /> : <List />}
                onClick={toggleViewType}
                size="sm"
                aria-label="Toggle View"
              >
                {localViewType === 'list' ? 'Grid View' : 'List View'}
              </Button>
            )}
          </HStack>

          {/* Title */}
          <Text fontSize="xl" fontWeight="bold">
            {appMode === 'host' ? 'Ride Requests' : 'Explore The Bay'}
          </Text>

          {/* Conditional Rendering based on appMode */}
          {appMode === 'host' ? (
            <HostPanel />
          ) : (
            <GuestPanel
              businesses={businesses}
              handleSelectItem={handleSelectItem}
              selectedItem={selectedItem}
              viewType={localViewType}
              darkMode={darkMode}
              loading={loadingBusinesses}
              error={errorBusinesses}
              categories={businessCategories}
            />
          )}

          {/* Sort Buttons Visibility Based on Panel State */}
          {!bothPanelsOpen && appMode !== 'host' && (
            <div className="mt-4">
              <button
                onClick={() => setViewMode(viewType === 'list' ? 'grid' : 'list')}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {viewType === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
              </button>
            </div>
          )}
        </VStack>
      )}
    </Box>
  );
};

LeftPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  selectedItem: PropTypes.object,
  viewType: PropTypes.string.isRequired,
  businesses: PropTypes.array.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isRightPanelOpen: PropTypes.bool.isRequired,
  setIsRightPanelOpen: PropTypes.func.isRequired,
  fetchBusinesses: PropTypes.func.isRequired,
  loadingBusinesses: PropTypes.bool.isRequired,
  errorBusinesses: PropTypes.string,
};

export default React.memo(LeftPanel);
