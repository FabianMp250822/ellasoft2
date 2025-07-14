import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import busboy from "busboy";

const corsHandler = cors({origin: true});

export const createOrganization = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // TODO: Add authentication check for superadmin.
    // const idToken = req.headers.authorization?.split("Bearer ")[1];
    // if (!idToken) {
    //   res.status(401).json({error: "Unauthorized: Missing token."});
    //   return;
    // }
    // try {
    //   const decodedToken = await admin.auth().verifyIdToken(idToken);
    //   if (!decodedToken.superadmin) {
    //     res.status(403)
    //       .json({error: "Unauthorized: User is not a superadmin."});
    //     return;
    //   }
    // } catch (error) {
    //   res.status(401).json({error: "Unauthorized: Invalid token."});
    //   return;
    // }

    const bb = busboy({headers: req.headers});

    const fields: {[key: string]: string} = {};
    const fileUploads: {
      [key: string]: {
        promise: Promise<string>;
        filename: string;
        mimetype: string;
      };
    } = {};

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
          const publicUrl =
            `https://storage.googleapis.com/${bucket.name}/${filePath}`;
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
          userLimit: parseInt(fields.userLimit, 10) || 100,
          userCount: 1, // Starts with the admin user
          dataConsumption: 0,
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
      } catch (error) {
        console.error("Error creating organization:", error);
        const message =
          error instanceof Error ?
            error.message :
            "An unknown error occurred.";
        res.status(500).json({
          error: "Failed to create organization.",
          details: message,
        });
      }
    });

    bb.end(req.rawBody);
  });
});
