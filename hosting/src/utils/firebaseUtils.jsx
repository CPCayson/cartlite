// convertTimestamp(timestamp): Convert Firestore timestamp to JavaScript Date object.
//Other reusable functions like data manipulation or utility helpers.

// Convert Firestore timestamp to JavaScript Date object
export const convertTimestamp = (timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate();
  };
  