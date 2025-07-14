/* eslint-disable max-len */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const db = admin.firestore();

// Helper to upload a base64 image and return its public URL
const uploadImage = async (dataUri: string, path: string): Promise<string> => {
  if (!dataUri) {
    throw new Error("Image data URI not provided.");
  }
  const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid data URI format.");
  }
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");
  const bucket = admin.storage().bucket();
  const fileExtension = mimeType.split("/")[1] || "jpg";
  const fileName = `${path}/${Date.now()}.${fileExtension}`;
  const file = bucket.file(fileName);
  await file.save(buffer, {
    metadata: {contentType: mimeType},
    public: true,
  });
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};


export const createTeacher = onCall(async (request) => {
  // 1. Authentication and Authorization Check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  if (!request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Must be an administrator to create a teacher.");
  }

  const {
    organizationId,
    firstName,
    lastName,
    email,
    password,
    phone,
    photoDataUri,
    assignedSubjects, // Expected to be an array of subject IDs
  } = request.data;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  if (!organizationId || !firstName || !lastName || !email || !password || !phone || !photoDataUri || !assignedSubjects) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }
  
  if (!Array.isArray(assignedSubjects)) {
    throw new HttpsError("invalid-argument", "The 'assignedSubjects' field must be an array.");
  }


  // 3. Security Check: Ensure the admin belongs to the organization they're trying to modify.
  if (organizationId !== tokenOrgId) {
    logger.warn(`Admin ${request.auth.uid} attempted to create a teacher for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only create teachers for your own organization.");
  }

  let teacherUid = "";
  try {
    // 4. Upload teacher's photo
    const photoUrl = await uploadImage(photoDataUri, `organizations/${organizationId}/teacher_photos`);

    // 5. Create the teacher user in Firebase Auth
    const teacherUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: phone.startsWith("+") ? phone : `+57${phone}`, // Assuming Colombia country code
      photoURL: photoUrl,
    });
    teacherUid = teacherUserRecord.uid;
    logger.info(`Teacher user created with UID: ${teacherUid}`);

    // 6. Assign custom claims to the teacher user
    await admin.auth().setCustomUserClaims(teacherUid, {
      teacher: true,
      organizationId: organizationId,
    });
    logger.info(`Custom claims set for teacher user: ${teacherUid}`);

    // 7. Create the teacher document in Firestore
    const teacherData = {
      uid: teacherUid,
      organizationId,
      firstName,
      lastName,
      email,
      phone,
      photoUrl,
      assignedSubjects, // an array of subject IDs
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("teachers").doc(teacherUid).set(teacherData);
    logger.info(`Teacher document created in Firestore for UID: ${teacherUid}`);

    // 8. Increment user count in the organization
    const orgRef = db.collection("organizations").doc(organizationId);
    await orgRef.update({
      userCount: admin.firestore.FieldValue.increment(1),
    });

    return {
      success: true,
      message: "Teacher created successfully.",
      teacherId: teacherUid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in createTeacher function for org ${organizationId}:`, error);

    // Rollback: If user was created in Auth, delete them.
    if (teacherUid) {
      logger.warn(`Rolling back: Deleting Auth user ${teacherUid}`);
      await admin.auth().deleteUser(teacherUid).catch((err) => logger.error(`Rollback failed for Auth user ${teacherUid}:`, err));
    }
    // No need to delete Firestore doc as we set it with the UID, so it won't exist if Auth creation fails.
    // No need to delete image as storage is cheap and it can be cleaned up later if needed.

    throw new HttpsError("internal", `Failed to create teacher: ${errorMessage}`);
  }
});
