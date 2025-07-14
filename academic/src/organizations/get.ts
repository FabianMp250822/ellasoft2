import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getOrganizations = functions.https.onCall(async (data, context) => {
  // Check if the user is a superadmin
  if (context.auth?.token.superadmin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be a super-administrator to list organizations."
    );
  }

  try {
    const orgsSnapshot = await admin.firestore().collection("organizations").get();
    const orgsList = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orgsList;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while fetching the organizations."
    );
  }
});
