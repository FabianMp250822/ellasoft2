/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Creates an administrator user in Firebase Auth and assigns custom claims.
 * This function NO LONGER handles Firestore document creation or file uploads.
 * That logic is now managed on the client-side.
 */
export const createOrganization = onCall(async (request) => {
  // 1. Check if user is a superadmin
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be a super-administrator to create an organization."
    );
  }

  const data = request.data;
  logger.info("Received data for admin user creation:", {
    ...data,
    adminPassword: "REDACTED",
  });

  // 2. Validate input data for creating the admin user
  const requiredFields = [
    "adminEmail",
    "adminPassword",
    "adminFirstName",
    "adminLastName",
    "adminPhone",
    "adminPhotoUrl",
    "organizationId", // Crucial: The ID of the doc created on the client
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new HttpsError("invalid-argument", `The function must be called with a '${field}' argument.`);
    }
  }

  try {
    // 3. Create the admin user in Firebase Auth
    const adminUser = await admin.auth().createUser({
      email: data.adminEmail,
      password: data.adminPassword,
      displayName: `${data.adminFirstName} ${data.adminLastName}`,
      phoneNumber: data.adminPhone,
      photoURL: data.adminPhotoUrl, // URL is now passed from the client
    });
    logger.info(`Admin user created with UID: ${adminUser.uid}`);


    // 4. Assign custom claims to the admin user
    await admin.auth().setCustomUserClaims(adminUser.uid, {
      admin: true,
      organizationId: data.organizationId,
    });
    logger.info(`Custom claims set for admin user: ${adminUser.uid}`);

    return {
      success: true,
      message: "Admin user created and claims assigned successfully.",
      userId: adminUser.uid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating admin user:", error);
    throw new HttpsError("internal", `Failed to create admin user: ${errorMessage}`);
  }
});
