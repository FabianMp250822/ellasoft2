/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {v4 as uuidv4} from "uuid";

// Helper to upload a base64 image and return its public URL
const uploadImage = async (dataUri: string, path: string): Promise<string> => {
  if (!dataUri) {
    throw new Error("Image data URI not provided.");
  }

  // Extract mime type and base64 data
  const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid data URI format.");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  const bucket = admin.storage().bucket();
  const fileName = `${path}/${uuidv4()}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {contentType: mimeType},
    public: true, // Make the file publicly readable
  });

  // Return the public URL
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};


export const createOrganization = onCall(async (request) => {
  // 1. Check if user is a superadmin
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be a super-administrator to create an organization."
    );
  }

  const data = request.data;
  const requiredFields = [
    "orgName", "orgEmail", "logoDataUri",
    "adminEmail", "adminPassword", "adminFirstName", "adminLastName", "adminPhotoDataUri",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new HttpsError("invalid-argument", `The function must be called with a '${field}' argument.`);
    }
  }

  let orgId = "";
  try {
    // 2. Upload images
    const logoUrl = await uploadImage(data.logoDataUri, "logos");
    const adminPhotoUrl = await uploadImage(data.adminPhotoDataUri, "admin_photos");

    // 3. Create the organization document in Firestore first to get an ID
    const orgData = {
      name: data.orgName,
      address: data.orgAddress,
      phone: data.orgPhone,
      email: data.orgEmail,
      nit: data.orgNit,
      dane: data.orgDane,
      userLimit: data.userLimit,
      logoUrl: logoUrl,
      adminId: "", // Will be filled in after admin user creation
      status: "Active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userCount: 1, // Starts with the admin user
      dataConsumption: 0,
      adminPhotoUrl: adminPhotoUrl,
    };
    const orgDocRef = await admin.firestore().collection("organizations").add(orgData);
    orgId = orgDocRef.id;
    logger.info(`Organization document created with ID: ${orgId}`);

    // 4. Create the admin user in Firebase Auth
    const adminUser = await admin.auth().createUser({
      email: data.adminEmail,
      password: data.adminPassword,
      displayName: `${data.adminFirstName} ${data.adminLastName}`,
      phoneNumber: data.adminPhone,
      photoURL: adminPhotoUrl,
    });
    logger.info(`Admin user created with UID: ${adminUser.uid}`);

    // 5. Assign custom claims to the admin user
    await admin.auth().setCustomUserClaims(adminUser.uid, {
      admin: true,
      organizationId: orgId,
    });
    logger.info(`Custom claims set for admin user: ${adminUser.uid}`);

    // 6. Update the organization document with the new admin's UID
    await orgDocRef.update({adminId: adminUser.uid});
    logger.info(`Organization ${orgId} updated with adminId: ${adminUser.uid}`);

    return {
      success: true,
      message: "Organization and admin user created successfully.",
      organizationId: orgId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error in createOrganization function:", error);
    // Basic rollback: If organization document was created but something failed after, delete it.
    if (orgId) {
      logger.warn(`Rolling back: Deleting organization document ${orgId}`);
      await admin.firestore().collection("organizations").doc(orgId).delete();
    }
    throw new HttpsError("internal", `Failed to create organization: ${errorMessage}`);
  }
});
