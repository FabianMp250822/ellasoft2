
/* eslint-disable max-len */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import * as logger from "firebase-functions/logger";

const storage = admin.storage();
const db = admin.firestore();

export const createOrganization = onCall(async (request) => {
  // 1. Check if user is a superadmin
  if (request.auth?.token.superadmin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be a super-administrator to create an organization."
    );
  }

  const data = request.data;
  logger.info("Received data for organization creation:", {
    ...data, 
    logoBase64: 'REDACTED', 
    adminPhotoBase64: 'REDACTED' 
  });

  // 2. Validate input data
  const requiredFields = [
    "orgName", "orgAddress", "orgPhone", "orgEmail", "orgNit", "orgDane",
    "userLimit", "adminFirstName", "adminLastName", "adminEmail", "adminPassword",
    "adminPhone", "logoBase64", "adminPhotoBase64",
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
    });
    logger.info(`Admin user created with UID: ${adminUser.uid}`);

    // 4. Upload images to Storage and get URLs
    const uploadImage = async (base64String: string, path: string, fileName: string): Promise<string> => {
      const base64EncodedImageString = base64String.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64EncodedImageString, "base64");

      const bucket = storage.bucket(); 
      const fileUpload = bucket.file(`${path}/${uuidv4()}-${fileName}`);

      await fileUpload.save(imageBuffer, {
        metadata: { contentType: "image/jpeg" }, // Adjust content type if needed
      });
      
      const [url] = await fileUpload.getSignedUrl({
          action: "read",
          expires: "03-09-2491", // Far-future expiration date
      });

      return url;
    };

    const logoUrl = await uploadImage(data.logoBase64, "logos", `${data.orgName}-logo.jpg`);
    const adminPhotoUrl = await uploadImage(data.adminPhotoBase64, "admin_photos", `${adminUser.uid}-photo.jpg`);
    
    // Update the user's photoURL
    await admin.auth().updateUser(adminUser.uid, { photoURL: adminPhotoUrl });
    logger.info("Images uploaded and user photoURL updated.");
    
    // 5. Create the organization document in Firestore
    const newOrganizationRef = db.collection("organizations").doc();
    const newOrgData = {
      name: data.orgName,
      address: data.orgAddress,
      phone: data.orgPhone,
      email: data.orgEmail,
      nit: data.orgNit,
      dane: data.orgDane,
      userLimit: parseInt(data.userLimit, 10),
      logoUrl: logoUrl,
      adminId: adminUser.uid,
      status: "Active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userCount: 1, // Starts with the admin user
      dataConsumption: 0,
    };
    await newOrganizationRef.set(newOrgData);
    logger.info(`Organization document created with ID: ${newOrganizationRef.id}`);

    // 6. Assign custom claims to the admin user
    await admin.auth().setCustomUserClaims(adminUser.uid, {
      admin: true,
      organizationId: newOrganizationRef.id,
    });
    logger.info(`Custom claims set for admin user: ${adminUser.uid}`);

    return {
      success: true,
      message: "Organization created successfully",
      organizationId: newOrganizationRef.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error creating organization:", error);
    throw new HttpsError("internal", `Failed to create organization: ${errorMessage}`);
  }
});
