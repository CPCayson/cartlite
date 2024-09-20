import { useNavigate } from 'react-router-dom';

const useNavigation = () => {
  const navigate = useNavigate();

  const navigateToUserProfile = () => {
    navigate('/user-profile');
  };

  const navigateToCartProfile = () => {
    navigate('/cart-profile');
  };

  const openStripeDashboard = () => {
    window.open('https://dashboard.stripe.com/', '_blank');
  };

  return {
    navigateToUserProfile,
    navigateToCartProfile,
    openStripeDashboard,
  };
};

export default useNavigation;