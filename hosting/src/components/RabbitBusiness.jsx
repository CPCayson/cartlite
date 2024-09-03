import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DeliverySection from '../layouts/DeliverySection';
const CarrotRating = ({ rating, size = 'medium' }) => {
  const fullCarrots = Math.floor(rating);
  const hasHalfCarrot = rating % 1 >= 0.5;
  return (
    <div className="flex items-center">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className={`${size === 'small' ? 'text-lg' : 'text-2xl'} ${
            i < fullCarrots
              ? 'text-orange-500'
              : i === fullCarrots && hasHalfCarrot
              ? 'text-orange-300'
              : 'text-gray-700'
          }`}
        >
          🥕
        </span>
      ))}
    </div>
  );
};

CarrotRating.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['small', 'medium'])
};

const InfoWindow = ({ place, onClose }) => {
  return (
    <div className="w-full md:w-72 bg-black shadow-lg rounded-lg overflow-hidden border border-emerald-400 glow-emerald">
      <div className="flex justify-between items-center p-4 bg-black border-b border-emerald-400">
        <h6 className="text-lg font-semibold text-emerald-400">{place.name}</h6>
        <button onClick={onClose} className="text-emerald-400 hover:text-emerald-300">
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 mr-4">
          <img className="w-12 h-12 rounded-full border border-emerald-400" src={place.photo} alt={place.name} />
        </div>
        <div>
          <p className="font-medium text-emerald-400">{place.type_of_place}</p>
          <p className="text-sm text-emerald-300">{place.address}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <CarrotRating rating={place.rating} size="small" />
          <span className="ml-2 text-sm text-emerald-300">({place.rating})</span>
        </div>
        <div className="flex space-x-2">
          {place.phone && (
            <button className="p-1 rounded-full bg-white hover:bg-orange-500 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </button>
          )}
          {place.website && (
            <button className="p-1 rounded-full bg-white hover:bg-orange-500 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <button className="w-full bg-white text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors duration-300">
          View Details
        </button>
      </div>
    </div>
  );
};


InfoWindow.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string.isRequired,
    photo: PropTypes.string.isRequired,
    type_of_place: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    phone: PropTypes.string,
    website: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

const DynamicTabComponent = ({ place, onClose }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    console.log('Submitted review:', { rating: userRating, review: userReview });
    setShowReviewForm(false);
    setUserRating(0);
    setUserReview('');
  };

  const tabContent = {
    ride: (
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4 text-emerald-400">Get a Ride to {place.name}</h3>
        <p className="text-emerald-300 mb-4">Book a comfortable ride to visit this amazing place!</p>
        <button className="w-full bg-white text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors duration-300">
          Book a Ride
        </button>
      </div>
    ),
    delivery: (
      <><DeliverySection /><div className="p-4">
        <h3 className="text-xl font-semibold mb-4 text-emerald-400">Order Delivery from {place.name}</h3>
        <p className="text-emerald-300 mb-4">Get fresh vegetables delivered straight to your door!</p>
        <button className="w-full bg-white text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors duration-300">
          Start Order
        </button>
      </div></>
    ),
    events: (
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-4 text-emerald-400">Upcoming Events at {place.name}</h3>
        <ul className="text-emerald-300 mb-4">
          <li className="mb-2">🥕 Carrot Planting Workshop - Next Saturday</li>
          <li className="mb-2">🐰 Bunny Meet and Greet - Every Sunday</li>
          <li>🌱 Organic Gardening Seminar - First Friday of the month</li>
        </ul>
        <button className="w-full bg-white text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors duration-300">
          View All Events
        </button>
      </div>
    ),
    reviews: (
      <div className="p-4">
        <div className="p-4 bg-black rounded-lg mb-4 border border-emerald-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-emerald-400">{place.ratings?.count || 0}</p>
              <p className="text-sm text-emerald-300"># of Ratings</p>
            </div>
            <div>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2 text-emerald-400">{place.ratings?.average?.toFixed(1) || '0.0'}</p>
                <CarrotRating rating={place.ratings?.average || 0} />
              </div>
              <p className="text-sm text-emerald-300">Trusted Rabbit Rating</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2 text-emerald-400">Reviews</h3>
          {Array.isArray(place.reviews) && place.reviews.length > 0 ? (
            place.reviews.map((review, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-emerald-700 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <CarrotRating rating={review.rating} size="small" />
                  {review.userImage && (
                    <img src={review.userImage} alt="User" className="w-8 h-8 rounded-full border border-emerald-400" />
                  )}
                </div>
                <p className="text-sm text-emerald-300">{review.text}</p>
              </div>
            ))
          ) : (
            <p className="text-emerald-300">No reviews yet.</p>
          )}
          
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-orange-500 transition-colors duration-300"
          >
            Leave a Review
          </button>
          
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-emerald-400">Your Rating</label>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md bg-black border-emerald-400 text-emerald-300 focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                >
                  <option value={0}>Select a rating</option>
                  <option value={1}>1 Carrot</option>
                  <option value={2}>2 Carrots</option>
                  <option value={3}>3 Carrots</option>
                  <option value={4}>4 Carrots</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-emerald-400">Your Review</label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-black border-emerald-400 text-emerald-300 focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  placeholder="Write your review here..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-black rounded hover:bg-orange-500 transition-colors duration-300"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    ),
  };

  return (
    <div className="w-full md:w-96 bg-black rounded-lg overflow-hidden shadow-lg border border-emerald-400 glow-emerald">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-black border-b border-emerald-400">
        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 mb-2 sm:mb-0">
          {['ride', 'delivery', 'events', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-300 mb-2 sm:mb-0 ${
                activeTab === tab
                  ? 'bg-emerald-400 text-black'
                  : 'bg-black text-emerald-400 hover:bg-emerald-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-emerald-400 hover:text-emerald-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {tabContent[activeTab]}
    </div>
  );
};

DynamicTabComponent.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string.isRequired,
    ratings: PropTypes.shape({
      count: PropTypes.number,
      average: PropTypes.number
    }),
    reviews: PropTypes.arrayOf(PropTypes.shape({
      rating: PropTypes.number,
      text: PropTypes.string,
      userImage: PropTypes.string
    }))
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

const CombinedPlaceDetails = ({ place, onClose }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-black rounded-lg shadow-xl max-w-4xl mx-auto">
      <style>{`
        .glow-emerald {
          box-shadow: 0 0 5px #34d399, 0 0 10px #34d399, 0 0 15px #34d399;
          animation: glow 1.5s ease-in-out infinite alternate;
        }
       @keyframes glow {
          from {
            box-shadow: 0 0 5px #34d399, 0 0 10px #34d399, 0 0 15px #34d399;
          }
          to {
            box-shadow: 0 0 10px #34d399, 0 0 20px #34d399, 0 0 30px #34d399;
          }
        }
      `}</style>
      <InfoWindow place={place} onClose={onClose} />
      <DynamicTabComponent place={place} onClose={onClose} />
    </div>
  );
};

CombinedPlaceDetails.propTypes = {
  place: PropTypes.shape({
    name: PropTypes.string.isRequired,
    ratings: PropTypes.shape({
      count: PropTypes.number,
      average: PropTypes.number
    }),
    reviews: PropTypes.arrayOf(PropTypes.shape({
      rating: PropTypes.number,
      text: PropTypes.string,
      userImage: PropTypes.string
    }))
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

// Mock place data
const mockPlace = {
  name: "Bunny's Vegetable Garden",
  type_of_place: "Garden",
  address: "123 Carrot Lane, Rabbitville",
  rating: 3.5,
  phone: "+1 555-CARROTS",
  website: "https://www.bunnyveggies.com",
  photo: "/api/placeholder/80/80",
  ratings: {
    count: 42,
    average: 3.5
  },
  reviews: [
    { rating: 4, text: "Great selection of carrots! The staff was very knowledgeable.", userImage: "/api/placeholder/32/32" },
    { rating: 3, text: "Good variety, but prices are a bit high.", userImage: "/api/placeholder/32/32" },
    { rating: 4, text: "Love the organic options. Will definitely come back!", userImage: "/api/placeholder/32/32" }
  ]
};

export default function RabbitBusiness() {
  return <CombinedPlaceDetails place={mockPlace} onClose={() => console.log('Close clicked')} />;
}