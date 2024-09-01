import firebase_admin
from firebase_admin import credentials, firestore

# Use your Firebase service account key
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

# Initialize Firebase Admin SDK
cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_KEY)
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Define your menu data
menu_data = {
    'SpecialtyPizzas': [
        {
            'Name': 'Loaded Italian',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19},
            'Ingredients': ['Pepperoni', 'Italian Sausage', 'Green peppers', 'Green olives', 'Mushrooms', 'Mozzarella']
        },
        {
            'Name': 'Caribbean',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19},
            'Ingredients': ['Ham', 'Pineapple', 'Roasted red peppers', 'Mozzarella']
        },
        {
            'Name': 'Vegetarian',
            'SizePrices': {'PersonalPan': 9, '14Inch': 17},
            'Ingredients': ['Onions', 'Green peppers', 'Black olives', 'Green olives', 'Mushrooms', 'Feta Cheese', 'Basil', 'Tomato', 'Mozzarella']
        },
        {
            'Name': 'Greek',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19},
            'Ingredients': ['Gyro meat', 'Onions', 'Black olives', 'Feta Cheese', 'Basil', 'Tomato', 'Mozzarella']
        },
        {
            'Name': 'Spinach Chicken Alfredo',
            'SizePrices': {'PersonalPan': 11, '14Inch': 20},
            'Ingredients': ['Spinach', 'Onions', 'Chicken', 'Alfredo sauce', 'Mozzarella']
        },
        {
            'Name': 'BBQ',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19},
            'Ingredients': ['BBQ sauce', 'Chicken', 'Onions', 'Mushrooms', 'Pineapple', 'Mozzarella']
        },
        {
            'Name': 'Meat Lovers',
            'SizePrices': {'PersonalPan': 11, '14Inch': 20},
            'Ingredients': ['Pepperoni', 'Sausage', 'Ham', 'Gyro meat', 'Mozzarella']
        },
        {
            'Name': 'Buffalo Chicken',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19},
            'Ingredients': ['Buffalo sauce', 'Chicken', 'Onions', 'Mozzarella']
        },
        {
            'Name': 'The Ugly Pizza',
            'SizePrices': {'PersonalPan': 11, '14Inch': 21},
            'Ingredients': ['Pepperoni', 'Sausage', 'Gyro meat', 'Onions', 'Green peppers', 'Black olives', 'Green olives', 'Mushrooms', 'Feta Cheese', 'Basil', 'Tomato', 'Mozzarella']
        }
    ],
    'ClassicPizzas': [
        {
            'Name': 'Cheese Pizza',
            'SizePrices': {'PersonalPan': 7, '14Inch': 15}
        },
        {
            'Name': 'Pepperoni',
            'SizePrices': {'PersonalPan': 9, '14Inch': 18}
        },
        {
            'Name': 'Sausage',
            'SizePrices': {'PersonalPan': 9, '14Inch': 18}
        },
        {
            'Name': 'Pepperoni & Sausage',
            'SizePrices': {'PersonalPan': 10, '14Inch': 19}
        }
    ],
    'StartersGyrosSubs': [
        {
            'Name': 'Garlic Bread',
            'Price': 7,
            'Description': 'Garlic bread'
        },
        {
            'Name': 'Popeye Bread',
            'Price': 10,
            'Description': 'Spinach & Cheese with a touch of Garlic toasted on poboy bread.'
        },
        {
            'Name': 'Regular Gyro',
            'Price': 9,
            'Description': 'Gyro meat, Tzatziki sauce, onions, tomatoes. Served with chips.'
        },
        {
            'Name': 'The Ultimate Gyro',
            'Price': 11,
            'Description': 'Gyro meat, Tzatziki sauce, onions, tomatoes, roasted red peppers, Greek olives, and feta cheese. Served with chips.'
        },
        {
            'Name': 'Meatball Sub',
            'Price': 12,
            'Description': 'Meatball sub with sauce and cheese.'
        }
    ]
}

# Function to add data to Firestore
def add_menu_to_firestore():
    collection_name = 'deliveryMenu'
    
    for category, items in menu_data.items():
        category_ref = db.collection(collection_name).document(category)
        
        for item in items:
            item_name = item['Name']
            category_ref.collection('Items').document(item_name).set(item)

    print("Menu data successfully added to Firestore!")

# Run the function to add data
if __name__ == "__main__":
    add_menu_to_firestore()
