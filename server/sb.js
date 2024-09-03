
    <body>
      <div class="flex">
        <input type="text" id="destinationInput" class="input-field" placeholder="Enter destination...">
        <button id="pickupBtn" class="button">Pickup</button>
        <div id="pickupPopover" class="popover-content">
          <button id="currentLocationBtn" class="button">Current Location</button>
          <input type="text" id="pickupInput" class="input-field" placeholder="Enter pickup location...">
        </div>
        <select id="timeSelect" class="button">
          <option value="">Add Time</option>
          <option value="10">10 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="30">30 Minutes</option>
          <option value="45">45 Minutes</option>
        </select>
        <span id="timeCountdown" class="button"></span>
        <button id="bookBtn" class="button">Book $0.00</button>
        <button id="cancelBtn" class="button" style="display:none;">Cancel</button>
        <button id="refundBtn" class="button" style="display:none;">Refund</button>
      </div>
      <div id="bookingDetails"></div>
      <div id="paymentModal" class="modal">
        <div class="modal-content">
          <h2>Confirm Booking</h2>
          <div id="paymentForm"></div>
          <button id="confirmPaymentBtn" class="button">Confirm Payment</button>
        </div>
      </div>

      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCOkJd62Hu9iEVlJ_LIIrakwbkm19cg8CU&libraries=places"></script>
      <script src="https://js.stripe.com/v3/"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.11.2/toastify.min.js"></script>
      <script>
        let destination = '';
        let pickupLocation = '';
        let countdownTime = null;
        let bookingAmount = 0;
        let autocomplete;
        let pickupAutocomplete;
        let countdownInterval;
        let stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
        let elements;
        let paymentIntentId = null;
        let bookingId = null;

        function initAutocomplete() {
          const destinationInput = document.getElementById('destinationInput');
          const pickupInput = document.getElementById('pickupInput');
          const baySaintLouisBounds = {
            north: 30.3617,
            south: 30.2817,
            east: -89.2978,
            west: -89.4178,
          };

          autocomplete = new google.maps.places.Autocomplete(destinationInput, {
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(baySaintLouisBounds.south, baySaintLouisBounds.west),
              new google.maps.LatLng(baySaintLouisBounds.north, baySaintLouisBounds.east)
            ),
            strictBounds: true,
            types: ['geocode']
          });

          pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(baySaintLouisBounds.south, baySaintLouisBounds.west),
              new google.maps.LatLng(baySaintLouisBounds.north, baySaintLouisBounds.east)
            ),
            strictBounds: true,
            types: ['geocode']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              destination = place.formatted_address;
              document.getElementById('destinationInput').value = destination;
              updateBookingAmount();
            }
          });

          pickupAutocomplete.addListener('place_changed', () => {
            const place = pickupAutocomplete.getPlace();
            if (place.geometry) {
              pickupLocation = place.formatted_address;
              document.getElementById('pickupBtn').innerText = 'Pickup: ' + pickupLocation;
              document.getElementById('pickupPopover').classList.remove('active');
              updateBookingAmount();
            }
          });
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
          const R = 6371;
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return distance * 0.621371;
        }

        function normalizeDistance(distance) {
          return Math.min(Math.max(distance / 4, 0), 5);
        }

        function calculatePrice(normalizedDistance) {
          const baseFare = 5;
          return baseFare + normalizedDistance;
        }

        function updateBookingAmount() {
          if (pickupLocation && destination) {
            const geocoder = new google.maps.Geocoder();
            
            geocoder.geocode({ address: pickupLocation }, (pickupResults, pickupStatus) => {
              if (pickupStatus === 'OK') {
                const pickupLatLng = pickupResults[0].geometry.location;
                
                geocoder.geocode({ address: destination }, (destResults, destStatus) => {
                  if (destStatus === 'OK') {
                    const destLatLng = destResults[0].geometry.location;
                    
                    const distance = calculateDistance(
                      pickupLatLng.lat(), pickupLatLng.lng(),
                      destLatLng.lat(), destLatLng.lng()
                    );
                    
                    const normalizedDistance = normalizeDistance(distance);
                    bookingAmount = calculatePrice(normalizedDistance);
                    
                    updateBookButton();
                  }
                });
              }
            });
          } else {
            bookingAmount = 0;
            updateBookButton();
          }
        }

        function updateBookButton() {
          document.getElementById('bookBtn').innerText = \`Book $\${bookingAmount.toFixed(2)}\`;
        }

        function showToast(message, type = 'info') {
          Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: 'right',
            backgroundColor: type === 'error' ? "linear-gradient(to right, #ff5f6d, #ffc371)" : "linear-gradient(to right, #00b09b, #96c93d)",
          }).showToast();
        }

        async function handleBook() {
          if (bookingAmount <= 0) {
            showToast('Please select a valid destination and pickup location.', 'error');
            return;
          }

          try {
            const response = await fetch('/api/create-payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                amount: Math.round(bookingAmount * 100),
                pickup: pickupLocation,
                destination: destination
              })
            });

            const { clientSecret, booking } = await response.json();
            bookingId = booking.id;
            
            const modal = document.getElementById('paymentModal');
            modal.style.display = "block";
            
            elements = stripe.elements();
            const cardElement = elements.create('card');
            cardElement.mount('#paymentForm');

            document.getElementById('confirmPaymentBtn').onclick = async () => {
              const { error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: cardElement,
                }
              });

              if (error) {
                showToast(error.message, 'error');
              } else {
                showToast('Payment successful!');
                updateBookingDetails(booking);
                document.getElementById('cancelBtn').style.display = 'inline-block';
                document.getElementById('refundBtn').style.display = 'inline-block';
                modal.style.display = "none";
              }
            };
          } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again.', 'error');
          }
        }

        function updateBookingDetails(booking) {
          const detailsElement = document.getElementById('bookingDetails');
          detailsElement.innerHTML = \`
            <h3>Booking Details</h3>
            <p>Booking ID: \${booking.id}</p>
            <p>Pickup: \${booking.pickup}</p>
            <p>Destination: \${booking.destination}</p>
            <p>Amount: $\${(booking.amount / 100).toFixed(2)}</p>
            <p>Status: \${booking.status}</p>
          \`;
        }

        async function handleCancel() {
          if (!bookingId) {
            showToast('No active booking to cancel.', 'error');
            return;
          }

          try {
            const response = await fetch('/api/cancel-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId })
            });

            const result = await response.json();

            if (result.success) {
              showToast('Booking cancelled successfully.');
              updateBookingDetails(result.booking);
              document.getElementById('cancelBtn').style.display = 'none';
              document.getElementById('refundBtn').style.display = 'inline-block';
            } else {
              showToast('Failed to cancel booking. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again.', 'error');
          }
        }

        async function handleRefund() {
          if (!bookingId) {
            showToast('No active booking to refund.', 'error');
            return;
          }

          try {
            const response = await fetch('/api/refund-booking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId })
            });

            const result = await response.json();

if (result.success) {
              showToast('Booking refunded successfully.');
              updateBookingDetails(result.booking);
              document.getElementById('cancelBtn').style.display = 'none';
              document.getElementById('refundBtn').style.display = 'none';
            } else {
              showToast('Failed to refund booking. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again.', 'error');
          }
        }

        function handleTimeSelectChange() {
          const timeSelect = document.getElementById('timeSelect');
          const value = parseInt(timeSelect.value);

          if (value) {
            countdownTime = new Date(Date.now() + value * 60000);
showToast(\`\${value} minutes added!\`);
            timeSelect.style.display = 'none';
            document.getElementById('timeCountdown').style.display = 'inline-block';
            startCountdown();
          }
        }

        function startCountdown() {
          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = setInterval(updateCountdown, 1000);
        }

        function updateCountdown() {
          const timeCountdown = document.getElementById('timeCountdown');
          if (!countdownTime) return;
          const diff = countdownTime - new Date();
          if (diff <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('timeSelect').style.display = 'block';
            document.getElementById('timeSelect').value = '';
            timeCountdown.style.display = 'none';
            showToast('Time is up!');
            return;
          }
          timeCountdown.innerText = formatCountdown(diff);
        }

        function formatCountdown(diff) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
  return \`\${minutes}m \${seconds}s\`;
        }

        function handlePickupLocationChange() {
          document.getElementById('pickupPopover').classList.toggle('active');
        }

        function handleCurrentLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              position => {
                pickupLocation = \`\${position.coords.latitude},\${position.coords.longitude}\`;
                document.getElementById('pickupBtn').innerText = 'Pickup: Current Location';
                document.getElementById('pickupPopover').classList.remove('active');
                updateBookingAmount();
              },
              error => {
                if (error.code === error.PERMISSION_DENIED) {
                  showToast('Location access denied. Please enable location settings in your browser.', 'error');
                }
              }
            );
          } else {
            showToast('Geolocation is not supported by this browser.', 'error');
          }
        }

        function debounce(func, delay) {
          let debounceTimer;
          return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
          }
        }

        document.addEventListener('DOMContentLoaded', () => {
          initAutocomplete();

          document.getElementById('pickupBtn').addEventListener('click', handlePickupLocationChange);
          document.getElementById('currentLocationBtn').addEventListener('click', handleCurrentLocation);
          document.getElementById('timeSelect').addEventListener('change', handleTimeSelectChange);
          document.getElementById('bookBtn').addEventListener('click', handleBook);
          document.getElementById('cancelBtn').addEventListener('click', handleCancel);
          document.getElementById('refundBtn').addEventListener('click', handleRefund);

          document.getElementById('destinationInput').addEventListener('input', debounce(() => {
            destination = document.getElementById('destinationInput').value;
            updateBookingAmount();
          }, 300));

          document.getElementById('pickupInput').addEventListener('input', debounce(() => {
            pickupLocation = document.getElementById('pickupInput').value;
            updateBookingAmount();
          }, 300));

          // Close the modal when clicking outside of it
          window.onclick = function(event) {
            const modal = document.getElementById('paymentModal');
            if (event.target == modal) {
              modal.style.display = "none";
            }
          }
        });
      </script>
    </body>
    </html>
  `);
});

// In-memory storage for bookings (replace with a database in production)
const bookings = new Map();

// API route to create a Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, pickup, destination } = req.body;

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      amount,
      pickup,
      destination,
      status: 'pending',
      paymentIntentId: paymentIntent.id
    };
    bookings.set(bookingId, booking);

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      booking
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to cancel a booking
app.post('/api/cancel-booking', async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const paymentIntent = await stripeClient.paymentIntents.cancel(booking.paymentIntentId);
    
    booking.status = 'cancelled';
    bookings.set(bookingId, booking);

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Stripe API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route to refund a booking
app.post('/api/refund-booking', async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: booking.paymentIntentId,
    });
    
    booking.status = 'refunded';
    bookings.set(bookingId, booking);

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Stripe API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint for Stripe to handle asynchronous events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      // Update booking status
      break;
    case 'payment_intent.payment_failed':
      const paymentError = event.data.object;
      console.log('Payment failed:', paymentError.last_payment_error?.message);
      // Update booking status
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  };
