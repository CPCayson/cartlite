# import requests
# import pandas as pd
# import time

# # Your API Key
# api_key = 'AIzaSyCOkJd62Hu9iEVlJ_LIIrakwbkm19cg8CU'  # Replace with your Google Places API key

# # Function to get place details including all specified fields
# def get_place_details(place_id, api_key):
#     # Comma-separated list of all fields to be retrieved
#     field_mask = (
#         'attributions,id,name,photos,'
#         'addressComponents,adrFormatAddress,formattedAddress,location,plusCode,shortFormattedAddress,types,viewport,'
#         'accessibilityOptions,businessStatus,displayName,googleMapsUri,iconBackgroundColor,iconMaskBaseUri,primaryType,'
#         'primaryTypeDisplayName,subDestinations,utcOffsetMinutes,'
#         'currentOpeningHours,currentSecondaryOpeningHours,internationalPhoneNumber,nationalPhoneNumber,priceLevel,rating,'
#         'regularOpeningHours,regularSecondaryOpeningHours,userRatingCount,websiteUri,'
#         'allowsDogs,curbsidePickup,delivery,dineIn,editorialSummary,evChargeOptions,fuelOptions,goodForChildren,'
#         'goodForGroups,goodForWatchingSports,liveMusic,menuForChildren,parkingOptions,paymentOptions,outdoorSeating,'
#         'reservable,restroom,reviews,servesBeer,servesBreakfast,servesBrunch,servesCocktails,servesCoffee,servesDessert,'
#         'servesDinner,servesLunch,servesVegetarianFood,servesWine,takeout'
#     )
    
#     url = f"https://maps.googleapis.com/maps/api/place/details/json?placeid={place_id}&fields={field_mask}&key={api_key}"
#     response = requests.get(url)
#     if response.status_code == 200:
#         return response.json().get('result', {})
#     else:
#         print(f"Failed to fetch place details: {response.status_code}")
#         return {}

# # Function to process and extract the place details
# def extract_place_info(result):
#     return {
#         "id": result.get("id", "N/A"),
#         "name": result.get("name", "N/A"),
#         "formatted_address": result.get("formattedAddress", "N/A"),
#         "international_phone_number": result.get("internationalPhoneNumber", "N/A"),
#         "national_phone_number": result.get("nationalPhoneNumber", "N/A"),
#         "price_level": result.get("priceLevel", "N/A"),
#         "rating": result.get("rating", "N/A"),
#         "user_ratings_total": result.get("userRatingCount", "N/A"),
#         "website": result.get("websiteUri", "N/A"),
#         "reviews": result.get("reviews", []),
#         "photos": result.get("photos", []),
#         "types": result.get("types", "N/A"),
#         "business_status": result.get("businessStatus", "N/A"),
#         "current_opening_hours": result.get("currentOpeningHours", {}),
#         "location": result.get("location", {}),
#         "plus_code": result.get("plusCode", "N/A"),
#         "delivery": result.get("delivery", "N/A"),
#         "dine_in": result.get("dineIn", "N/A"),
#         "takeout": result.get("takeout", "N/A"),
#         "allows_dogs": result.get("allowsDogs", "N/A"),
#         "curbside_pickup": result.get("curbsidePickup", "N/A"),
#         "payment_options": result.get("paymentOptions", "N/A"),
#         # Add more attributes as needed...
#     }

# # Read the CSV with place IDs
# file_path = './cleaned_unique_places.csv'
# data = pd.read_csv(file_path)

# # Initialize new columns in the dataframe (if not already present)
# columns_to_add = ['id', 'name', 'formatted_address', 'international_phone_number', 'national_phone_number', 'price_level',
#                   'rating', 'user_ratings_total', 'website', 'reviews', 'photos', 'types', 'business_status',
#                   'current_opening_hours', 'location', 'plus_code', 'delivery', 'dine_in', 'takeout', 'allows_dogs',
#                   'curbside_pickup', 'payment_options']
# for col in columns_to_add:
#     if col not in data.columns:
#         data[col] = 'N/A'

# # Loop through each row in the dataframe to fetch and update the place details
# for index, row in data.iterrows():
#     place_id = row['google_place_id']
    
#     # Fetch place details from Google Places API
#     place_details = get_place_details(place_id, api_key)
    
#     # Extract relevant fields
#     if place_details:
#         extracted_info = extract_place_info(place_details)
        
#         # Update the dataframe with the new info
#         for key, value in extracted_info.items():
#             data.at[index, key] = value
        
#     # To avoid hitting API limits, wait between requests
#     time.sleep(1)  # Sleep for 1 second to prevent overloading the API

# # Save the updated CSV
# output_path = './updated_places_with_all_details.csv'
# data.to_csv(output_path, index=False)

# print(f"CSV updated and saved to {output_path}")
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

# Initialize Firebase Admin SDK
def initialize_firebase():
    FIREBASE_SERVICE_ACCOUNT_KEY = {
        "type": "service_account",
        "project_id": "rabbit-2ba47",
        "private_key_id": "a70ea52abd76760d08a92c5df38ed324723d82da",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHANkZ2qBBOpgt\nbJrvA70s8clhwwUoSXDeiZI4Sv/ikk6z3MSaPVvtuGwA3BnvkUl0Hb1MB7HmOh0u\n3TcmV6EEE6XV7vQBCwFzhAVNibdTZcEMU7IUbR4wMB2qCIU0fAVOhgHz2WABW0SP\nZAcnt4MOj8oba96Ne/vONMON5zgYZOguWuyyS+h64Wxygryx06/zYG/wFhZdv4k1\nR2NNdU76jnJOqagdnZILHRW1RGV5xNT/lhD5QQ6gncFKPI1uCMaTKQZVB6a7RI9+\ndVr7EZBljOdNpEI9WAqgTwS7SWj5rrqCR9ShsGK6Omodz8MThIWBqG/G7QL5sm92\n3GdU+Qz5AgMBAAECggEAJoEfAJYhKM3WEP/xEGsYSOB1lyFdV5iyKpTSwmqcjTHC\n4aFHNxLFPT9QQnBT4lspq7pvXI0mmkXHTMCHwbb11CybC0RDWQpQmxHB1uldG9lV\n23U8QSCF1UwSCUrBv1B51GIwcYavQUPwBZCUo9YpmQEwWVLrSlPheloSNlw1Kd7R\nA/gPvMAhgrkeFh3i0sm04z23TdD9cWu6XWW3jfPPCFkiSbRvKDvK+a+Hq1TXqmdd\nDVUd4lVPxXgTFReRAVJF5sYZV8ITcPsWoXsLechzYGCeM+m/miewwLwPelujZZY4\nA6tXIqgKk3ZFANQnp8W3K4NWfLF94LfOMIcA8/AtWwKBgQDl0hh8rM+k8Kfu8RLL\nJtUx0vaPpBN7Y6q+f/gnAg/9jsIsimcay2NfqPFHsAhqpYC3JCuDISYRvRI23/1w\ngTIn5wCqFcQRb2v00Q94Wql8tMM2YEr1MQCFCtDB0Ad7XlOFAHybuLEodhIJBVxA\nxJxmI01AuLCmyo9i/vizuhlvbwKBgQDdrBK3y5ZnExmQ5upMCMcfStPVoGwgFNFB\nbySO3Kor0R7cYD3kKyx5ekarIKE8NF9sJODx7fcxCkUKnlwutBAPxwniK5eLBOnN\nczDpXOhpbzxpGI2b6AbpPF1mfiLvBo4FeIUpgaN0yFCLgnABsvF4kRb089mQ+5y5\n/d3L/muWFwKBgQCSG6THtpH4WataJFd/YjvOBkIMhhKAspd9rxvTqOMDn3vhF0h/\nZ2jRCzYCDm77ZibTyCIFptBuHJb03ihhGzII3jq050uUjhLDPRopuPHhv4YQDt34\nzeN3sa2QWjI3g3tzpiCSW7P9djr3EzpYTubjpHPbvs9H6qWIGXOBx8Gd7wKBgHwh\nbn3jkH550Jg25r7bL34Tbdozsjioz6Efts4VPWm5+dkYP7A0iPwhf882P3OyNDkf\n0aNISWL5yD2w/hfdFx1urNcs5/ieMLqupZYYQ8E+3ApSCIJkhPI4rmjFe5R0DDV+\nDrt2b+zme0wUJ9qbtOJ6BOv4XT312AbC5V/lQaPTAoGAUaKIjdohQDT6jFUzvNDH\nEgsRAi8WeUGyy+AU+j9QgqrUZDmhn72Em4cPsM813kCbCVO9I3XAVDld+fwxYYze\ncEYOn5jEFHHrzxbNvr4QnfPMnNMeh0Ntb3W4pGlLleeXZfUSP4fAgAhKOFsdw8Su\ng5RUNv3gLAYw7cJNOz08lWg=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-xvmgw@rabbit-2ba47.iam.gserviceaccount.com",
        "client_id": "106153603425470812867",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xvmgw%40rabbit-2ba47.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }

    cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)

# Upload data to Firestore
def upload_data_to_firestore(collection_name, df):
    db = firestore.client()
    
    for index, row in df.iterrows():
        doc_ref = db.collection(collection_name).document(str(index))
        doc_ref.set(row.to_dict())

    print(f"Uploaded {len(df)} documents to Firestore collection '{collection_name}'.")

# Example usage:
df = pd.read_csv('one.csv')  # Load your CSV file
initialize_firebase()  # Initialize Firebase
upload_data_to_firestore('places', df)  # Upload data
