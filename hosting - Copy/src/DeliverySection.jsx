import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import Isotope from 'isotope-layout';
import { Star } from 'lucide-react';
import { db } from './hooks/firebase/firebaseConfig'; // Adjust this path if necessary

const DeliverySection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('rating');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const isotopeRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      isotopeRef.current = new Isotope(gridRef.current, {
        itemSelector: '.restaurant-item',
        layoutMode: 'fitRows',
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deliveryMenuRef = collection(db, 'deliveryMenu');
        const querySnapshot = await getDocs(deliveryMenuRef);
        let fetchedRestaurants = [];

        // Iterate over each category document
        for (const categoryDoc of querySnapshot.docs) {
          console.log(categoryDoc);
          const itemsSnapshot = await getDocs(collection(categoryDoc.ref, 'Items'));
          const items = itemsSnapshot.docs.map(itemDoc => ({
            id: itemDoc.id,
            category: categoryDoc.id,
            ...itemDoc.data(),
          }));
          fetchedRestaurants = [...fetchedRestaurants, ...items];
        }

        setRestaurants(fetchedRestaurants);
        setFilteredRestaurants(fetchedRestaurants);
      } catch (error) {
        console.error('Error fetching data from Firestore:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = restaurants;

    if (searchTerm) {
      result = result.filter(restaurant =>
        restaurant.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCuisine !== 'All') {
      result = result.filter(restaurant => restaurant.category === selectedCuisine);
    }

    result.sort((a, b) => {
      if (sortCriteria === 'price') {
        return (a.SizePrices?.['PersonalPan'] || 0) - (b.SizePrices?.['PersonalPan'] || 0);
      } else if (sortCriteria === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortCriteria === 'reviews') {
        return (b.reviews || 0) - (a.reviews || 0);
      }
      return 0;
    });

    setFilteredRestaurants(result);
  }, [restaurants, searchTerm, selectedCuisine, sortCriteria]);

  useEffect(() => {
    if (isotopeRef.current) {
      isotopeRef.current.arrange({
        filter: function (itemElem) {
          const name = itemElem.querySelector('.name').textContent.toLowerCase();
          const cuisine = itemElem.querySelector('.cuisine').textContent.toLowerCase();
          return (selectedCuisine === 'All' || cuisine === selectedCuisine.toLowerCase()) &&
            (name.includes(searchTerm.toLowerCase()) || cuisine.includes(searchTerm.toLowerCase()));
        }
      });
    }
  }, [filteredRestaurants, searchTerm, selectedCuisine]);

  const cuisines = ['All', ...new Set(restaurants.map(r => r.category))];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Food Delivery</h2>

      {/* Search and filter controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          {cuisines.map((cuisine, index) => (
            <option key={index} value={cuisine}>{cuisine}</option>
          ))}
        </select>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="rating">Rating</option>
          <option value="price">Price</option>
          <option value="reviews">Reviews</option>
        </select>
      </div>

      {/* Restaurant grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRestaurants.map(restaurant => (
          <div key={restaurant.id} className="restaurant-item border rounded-lg overflow-hidden shadow-md">
            <img src={restaurant.image} alt={restaurant.Name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="name font-bold text-lg">{restaurant.Name}</h3>
              <div className="flex items-center mt-1">
                <Star className="text-yellow-400 mr-1" size={16} />
                <span>{restaurant.rating || 'N/A'}</span>
                <span className="ml-2 text-sm text-gray-500">({restaurant.reviews || 0} reviews)</span>
              </div>
              <span className="cuisine inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mt-2">
                {restaurant.category}
              </span>
              <p className="mt-2">
                <span className="font-semibold">Personal Pan Price:</span> ${restaurant.SizePrices?.['PersonalPan']?.toFixed(2) || '0.00'}
              </p>
              <p className="font-bold text-lg mt-1">${restaurant.SizePrices?.['14Inch']?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverySection;
