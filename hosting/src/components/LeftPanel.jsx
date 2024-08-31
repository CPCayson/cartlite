import React, { useState, useEffect } from 'react';
import { List, Grid, Carrot, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import your initialized Firestore instance

const LeftPanel = ({ isOpen, setIsOpen, appMode, onSelectItem }) => {
  const [activeView, setActiveView] = useState('businesses');
  const [activeCategory, setActiveCategory] = useState('all food');
  const [viewType, setViewType] = useState('list');
  const [businesses, setBusinesses] = useState([]);
  const [carts, setCarts] = useState([]);

  const businessCategories = [
    { name: 'all food', color: 'bg-red-500' },
    { name: 'bars', color: 'bg-purple-500' },
    { name: 'events', color: 'bg-green-500' },
    { name: 'deliveries', color: 'bg-yellow-500' },
  ];

  // Fetch businesses from Firestore
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        console.log('Fetching businesses data from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'places'));
        const businessesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched businesses:', businessesData);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch carts from Firestore
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        console.log('Fetching carts data from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'carts'));
        const cartsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched carts:', cartsData);
        setCarts(cartsData);
      } catch (error) {
        console.error('Error fetching carts:', error);
      }
    };

    fetchCarts();
  }, []);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Carrot key={i} className={`w-8 h-8 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" />
    ));
  };

  const renderItems = () => {
    let items;
    if (activeView === 'businesses') {
      // Filter businesses based on the active category
      items = activeCategory === 'all food' 
        ? businesses 
        : businesses.filter(business => business.category === activeCategory);
    } else {
      items = carts;
    }

    return items.map(item => (
      <div key={item.id} 
           className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
           onClick={() => onSelectItem(item)}>
        <h3 className="font-bold text-gray-800 dark:text-white">
          {activeView === 'businesses' ? item.name : item.cartName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {activeView === 'businesses' ? item.type || item.userType : `Host: ${item.cartOwner}`}
        </p>
        {activeView === 'carts' && <p className="text-sm text-blue-500">Rating: {item.rating}</p>}
        <div className="flex mt-3">{renderStars(item.rating)}</div>
      </div>
    ));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <button 
            className={`px-3 py-1 rounded ${activeView === 'businesses' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
            onClick={() => setActiveView('businesses')}
          >
            Businesses
          </button>
          <button 
            className={`px-3 py-1 rounded ${activeView === 'carts' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
            onClick={() => setActiveView('carts')}
          >
            Carts
          </button>
        </div>
        {activeView === 'businesses' && (
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
        )}
        <div className="flex justify-end mb-4">
          <button onClick={() => setViewType('list')} className={`mr-2 ${viewType === 'list' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            <List />
          </button>
          <button onClick={() => setViewType('grid')} className={viewType === 'grid' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}>
            <Grid />
          </button>
        </div>
        <div className={`${viewType === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
          {renderItems()}
        </div>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
      >
        {isOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

export default LeftPanel;
