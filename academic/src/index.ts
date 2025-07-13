import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();
const corsHandler = cors({origin: true});

export const createOrganization = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // TODO: Add authentication check to ensure only superadmins can call this.
    // const idToken = req.headers.authorization?.split("Bearer ")[1];
    // try {
    //   const decodedToken = await admin.auth().verifyIdToken(idToken);
    //   if (!decodedToken.superadmin) {
    //     res.status(403).json({ error: "Unauthorized: User is not a superadmin." });
    //     return;
    //   }
    // } catch (error) {
    //   res.status(401).json({ error: "Unauthorized: Invalid token." });
    //   return;
    // }

    const busboy = await import("busboy");
    const bb = busboy({headers: req.headers});

    const fields: {[key: string]: string} = {};
    const fileUploads: {[key: string]: {
        promise: Promise<string>,
        filename: string,
        mimetype: string,
    }} = {};

    bb.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on("file", (fieldname, file, info) => {
      const {filename, mimeType} = info;
      const bucket = admin.storage().bucket();
      const filePath = `uploads/${Date.now()}_${filename}`;
      const fileStream = bucket.file(filePath).createWriteStream({
        metadata: {contentType: mimeType},
      });

      file.pipe(fileStream);

      const promise = new Promise<string>((resolve, reject) => {
        fileStream.on("error", reject);
        fileStream.on("finish", () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          resolve(publicUrl);
        });
      });
      fileUploads[fieldname] = {promise, filename, mimetype: mimeType};
    });

    bb.on("finish", async () => {
      try {
        const orgRef = admin.firestore().collection("organizations").doc();
        const orgId = orgRef.id;

        const adminUser = await admin.auth().createUser({
          email: fields.adminEmail,
          password: fields.adminPassword,
          displayName: `${fields.adminFirstName} ${fields.adminLastName}`,
        });

        await admin.auth().setCustomUserClaims(adminUser.uid, {
          admin: true,
          organizationId: orgId,
        });

        const logoUrl = await fileUploads["orgLogo"].promise;
        const adminPhotoUrl = await fileUploads["adminPhoto"].promise;

        const organizationData = {
          id: orgId,
          name: fields.orgName,
          address: fields.orgAddress,
          phone: fields.orgPhone,
          email: fields.orgEmail,
          nit: fields.orgNit,
          dane: fields.orgDane,
          logoUrl,
          adminId: adminUser.uid,
          adminName: `${fields.adminFirstName} ${fields.adminLastName}`,
          adminPhotoUrl,
          createdAt: new Date().toISOString(),
          status: "Active",
        };

        await orgRef.set(organizationData);

        res.status(201).json({
          message: "Organization created successfully.",
          organizationId: orgId,
        });
      } catch (error: any) {
        console.error("Error creating organization:", error);
        res.status(500).json({error: "Failed to create organization.", details: error.message});
      }
    });

    bb.end(req.rawBody);
  });
});
