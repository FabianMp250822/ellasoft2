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


export const createStudent = onCall(async (request) => {
  // 1. Authentication and Authorization Check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  if (!request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Must be an administrator to create a student.");
  }

  const {
    organizationId,
    // Personal Data
    firstName,
    lastName,
    email,
    password,
    phone,
    photoDataUri,
    documentType,
    documentNumber,
    dateOfBirth,
    gender,
    address,
    // Academic Data
    gradeId,
    // Family Data
    guardianName,
    guardianPhone,
    guardianEmail,
    motherName,
    motherPhone,
    fatherName,
    fatherPhone,
  } = request.data;
  const tokenOrgId = request.auth.token.organizationId;

  // 2. Validate input
  const requiredFields = [
    "organizationId", "firstName", "lastName", "email", "password", "phone",
    "photoDataUri", "gradeId", "documentType", "documentNumber", "dateOfBirth",
    "gender", "address", "guardianName", "guardianPhone", "guardianEmail",
  ];
  for (const field of requiredFields) {
      if (!request.data[field]) {
          throw new HttpsError("invalid-argument", `Missing required field: ${field}.`);
      }
  }


  // 3. Security Check: Ensure the admin belongs to the organization they're trying to modify.
  if (organizationId !== tokenOrgId) {
    logger.warn(`Admin ${request.auth.uid} attempted to create a student for org ${organizationId} but belongs to ${tokenOrgId}.`);
    throw new HttpsError("permission-denied", "You can only create students for your own organization.");
  }

  let studentUid = "";
  try {
    // 4. Upload student's photo
    const photoUrl = await uploadImage(photoDataUri, `organizations/${organizationId}/student_photos`);

    // 5. Create the student user in Firebase Auth
    const studentUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: phone.startsWith("+") ? phone : `+57${phone}`, // Assuming Colombia country code
      photoURL: photoUrl,
    });
    studentUid = studentUserRecord.uid;
    logger.info(`Student user created with UID: ${studentUid}`);

    // 6. Assign custom claims to the student user
    await admin.auth().setCustomUserClaims(studentUid, {
      student: true,
      organizationId: organizationId,
    });
    logger.info(`Custom claims set for student user: ${studentUid}`);

    // 7. Create the student document in Firestore
    const studentData = {
      uid: studentUid,
      organizationId,
      // Personal Data
      firstName,
      lastName,
      email,
      phone,
      photoUrl,
      documentType,
      documentNumber,
      dateOfBirth,
      gender,
      address,
      // Academic Data
      gradeId,
      // Family Data
      guardianName,
      guardianPhone,
      guardianEmail,
      motherName,
      motherPhone,
      fatherName,
      fatherPhone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("students").doc(studentUid).set(studentData);
    logger.info(`Student document created in Firestore for UID: ${studentUid}`);

    // 8. Increment user count in the organization
    const orgRef = db.collection("organizations").doc(organizationId);
    await orgRef.update({
      userCount: admin.firestore.FieldValue.increment(1),
    });

    return {
      success: true,
      message: "Student created successfully.",
      studentId: studentUid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error in createStudent function for org ${organizationId}:`, error);

    // Rollback: If user was created in Auth, delete them.
    if (studentUid) {
      logger.warn(`Rolling back: Deleting Auth user ${studentUid}`);
      await admin.auth().deleteUser(studentUid).catch((err) => logger.error(`Rollback failed for Auth user ${studentUid}:`, err));
    }

    throw new HttpsError("internal", `Failed to create student: ${errorMessage}`);
  }
});
