import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const LeftPanel = ({ 
  isOpen, 
  setIsOpen, 
  appMode, 
  handleAccept, 
  handleSelectItem, 
  activeCategory, 
  setActiveCategory, 
  viewType, 
  setViewType, 
  rideInProgress, 
  handleSettingsClick 
}) => {
  const [rideRequests, setRideRequests] = useState([
    { id: 1, requester: 'John Doe', time: '5 mins ago' },
    { id: 2, requester: 'Jane Smith', time: '10 mins ago' },
  ]);

  const businessCategories = [
    { name: 'all food', color: 'bg-red-500' },
    { name: 'Store', color: 'bg-purple-500' },
    { name: 'Food', color: 'bg-green-500' },
    { name: 'Bar', color: 'bg-yellow-500' },
  ];

  const [businesses, setBusinesses] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, [activeCategory]);

  useEffect(() => {
    filterBusinesses();
  }, [searchTerm]);

  const fetchBusinesses = async () => {
    setLoading(true);
    let businessQuery;

    if (activeCategory === 'all food') {
      businessQuery = query(
        collection(db, 'places'),
        orderBy('name'),
        limit(15)
      );
    } else {
      businessQuery = query(
        collection(db, 'places'),
        where('category', '==', activeCategory),
        orderBy('name'),
        limit(15)
      );
    }

    try {
      const querySnapshot = await getDocs(businessQuery);
      const fetchedBusinesses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBusinesses(fetchedBusinesses);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 15);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }

    setLoading(false);
  };

  const filterBusinesses = () => {
    if (!searchTerm) return;

    const filtered = businesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setBusinesses(filtered);
  };

  const loadMoreBusinesses = async () => {
    if (!lastDoc || !hasMore || loading) return;

    setLoading(true);
    let businessQuery;

    if (activeCategory === 'all food') {
      businessQuery = query(
        collection(db, 'places'),
        orderBy('name'),
        startAfter(lastDoc),
        limit(15)
      );
    } else {
      businessQuery = query(
        collection(db, 'places'),
        where('category', '==', activeCategory),
        orderBy('name'),
        startAfter(lastDoc),
        limit(15)
      );
    }

    try {
      const querySnapshot = await getDocs(businessQuery);
      const fetchedBusinesses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBusinesses((prev) => [...prev, ...fetchedBusinesses]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 15);
    } catch (error) {
      console.error('Error fetching more businesses:', error);
    }

    setLoading(false);
  };

  const handleAcceptClick = (ride) => {
    handleAccept(ride);
    setIsOpen(false);
  };

  const renderItems = () => {
    return businesses.map((item) => (
      <div 
        key={item.id} 
        className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
        onClick={() => handleSelectItem(item)}
      >
        <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{item.type_of_place}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.rating ? `Rating: ${item.rating}` : 'No rating'}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.product_services}</p>
        <div className="flex mt-2">{renderStars(item.rating)}</div>
      </div>
    ));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen || rideInProgress ? 'w-1/2' : 'w-[30%]'} overflow-hidden`}>
      <div className="p-4">
        {appMode === 'host' ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Incoming Accepts</h2>
            {rideRequests.map((ride) => (
              <div key={ride.id} className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-800 dark:text-white">{ride.requester}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{ride.time}</p>
                </div>
                <button onClick={() => handleAcceptClick(ride)} className="bg-blue-500 text-white px-4 py-2 rounded">Accept</button>
              </div>
            ))}
            <button 
              onClick={handleSettingsClick} 
              className="bg-gray-700 text-white px-4 py-2 rounded mt-4"
            >
              Settings
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Businesses</h2>
            <div className="flex items-center mb-4">
              <input 
                type="text" 
                className="px-3 py-2 border rounded w-full" 
                placeholder="Search by name..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <button 
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded"
                onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
              >
                {viewType === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
            <div className="flex flex-wrap justify-start mb-4">
              {businessCategories.map((category) => (
                <button
                  key={category.name}
                  className={`px-3 py-1 rounded mr-2 mb-2 ${category.color} text-white`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className={`${viewType === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
              {renderItems()}
            </div>
            {hasMore && !loading && (
              <button 
                onClick={loadMoreBusinesses} 
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
              >
                Load More
              </button>
            )}
            {loading && <p className="text-center mt-4">Loading...</p>}
          </>
        )}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md ${rideInProgress ? 'hidden' : ''}`}
      >
        {isOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};
LeftPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  handleAccept: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired,
  setViewType: PropTypes.func.isRequired,
  rideInProgress: PropTypes.bool.isRequired,
  handleSettingsClick: PropTypes.func.isRequired,
};

export default LeftPanel;
