import PropTypes from 'prop-types';

const ViewToggle = ({ setViewMode, setIsLeftPanelOpen, setIsRightPanelOpen }) => {
  
  const handleLeftPanelView = () => {
    setViewMode('Explore');
    setIsLeftPanelOpen(true);  // Open left panel
    setIsRightPanelOpen(false); // Close right panel
  };

  const handleDashboardView = () => {
    setViewMode('Ride');
    setIsLeftPanelOpen(false);  // Close left panel
    setIsRightPanelOpen(false); // Close right panel
  };

  const handleRightPanelView = () => {
    setViewMode('Delivery');
    setIsLeftPanelOpen(false);  // Close left panel
    setIsRightPanelOpen(true);  // Open right panel
  };

  return (
    <div className="flex justify-end space-x-2 p-2">
      <button onClick={handleLeftPanelView} className="btn">Left Panel View</button>
      <button onClick={handleDashboardView} className="btn">Dashboard View</button>
      <button onClick={handleRightPanelView} className="btn">Right Panel View</button>
    </div>
  );
};

ViewToggle.propTypes = {
  setViewMode: PropTypes.func.isRequired,
  setIsLeftPanelOpen: PropTypes.func.isRequired,
  setIsRightPanelOpen: PropTypes.func.isRequired,
};

export default ViewToggle;
