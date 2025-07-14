import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import busboy from "busboy";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";

const corsHandler = cors({ origin: true });

const storage = admin.storage();
const db = admin.firestore();

// 🔧 Extiende el tipo de Request para incluir rawBody
interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

export const createOrganization = functions.https.onRequest(
  async (req: RawBodyRequest, res: Response): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    corsHandler(req, res, () => {
      const bb = busboy({ headers: req.headers });

      const fields: Record<string, string> = {};
      const files: Record<
        string,
        { buffer: Buffer; mimeType: string; fileName: string }
      > = {};

      bb.on(
        "file",
        (
          fieldname: string,
          file: NodeJS.ReadableStream,
          info: busboy.FileInfo
        ) => {
          const { filename, mimeType } = info;
          const chunks: Buffer[] = [];
          file.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });
          file.on("end", () => {
            files[fieldname] = {
              buffer: Buffer.concat(chunks),
              mimeType,
              fileName: filename,
            };
          });
        }
      );

      bb.on("field", (fieldname: string, val: string) => {
        fields[fieldname] = val;
      });

      bb.on("finish", async () => {
        try {
          // 1. Crear el usuario administrador
          const adminUser = await admin.auth().createUser({
            email: fields.adminEmail,
            password: fields.adminPassword,
            displayName: `${fields.adminFirstName} ${fields.adminLastName}`,
          });

          // 2. Subir imágenes a Storage y obtener URLs
          const uploadFile = async (
            fileData: { buffer: Buffer; mimeType: string; fileName: string },
            path: string
          ): Promise<string> => {
            if (!fileData) return "";
            const bucket = storage.bucket();
            const fileUpload = bucket.file(
              `${path}/${uuidv4()}-${fileData.fileName}`
            );
            await fileUpload.save(fileData.buffer, {
              metadata: { contentType: fileData.mimeType },
            });
            const [url] = await fileUpload.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            });
            return url;
          };

          const logoUrl = await uploadFile(files.orgLogo, "logos");
          const adminPhotoUrl = await uploadFile(
            files.adminPhoto,
            "admin_photos"
          );

          await admin
            .auth()
            .updateUser(adminUser.uid, { photoURL: adminPhotoUrl });

          // 3. Crear la organización en Firestore
          const newOrganizationRef = db.collection("organizations").doc();
          const newOrgData = {
            name: fields.orgName,
            address: fields.orgAddress,
            phone: fields.orgPhone,
            email: fields.orgEmail,
            nit: fields.orgNit,
            dane: fields.orgDane,
            userLimit: parseInt(fields.userLimit, 10),
            logoUrl: logoUrl,
            adminId: adminUser.uid,
            status: "Active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userCount: 1, // Se inicia con el administrador
            dataConsumption: 0,
          };
          await newOrganizationRef.set(newOrgData);

          // 4. Asignar custom claims al administrador
          await admin
            .auth()
            .setCustomUserClaims(adminUser.uid, {
              admin: true,
              organizationId: newOrganizationRef.id,
            });

          res.status(201).send({
            message: "Organization created successfully",
            id: newOrganizationRef.id,
          });
        } catch (error) {
          console.error("Error creating organization:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          res.status(500).send({
            details: `Error creating organization: ${errorMessage}`,
          });
        }
      });

      bb.end(req.rawBody);
    });
  }
);
