
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { functions, storage, db } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

export type FormValues = {
  // Organization fields
  orgName: string;
  orgAddress: string;
  orgPhone: string;
  orgEmail: string;
  orgNit: string;
  orgDane: string;
  userLimit: number;
  logo: FileList;
  
  // Admin fields
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
  adminPhoto: FileList;
};

interface CreateOrganizationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Helper to upload a file and get its public URL
const uploadFileAndGetURL = async (file: File, path: string): Promise<string> => {
    if (!file) throw new Error("File not provided for upload.");
    const filePath = `${path}/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    let orgId = '';
    try {
        if (!data.logo[0] || !data.adminPhoto[0]) {
            throw new Error("Logo and Administrator Photo are required.");
        }

        // 1. Upload images to Firebase Storage
        toast({ title: "Step 1/3: Uploading Images..." });
        const logoUrl = await uploadFileAndGetURL(data.logo[0], "logos");
        const adminPhotoUrl = await uploadFileAndGetURL(data.adminPhoto[0], "admin_photos");

        // 2. Create the organization document in Firestore
        toast({ title: "Step 2/3: Creating Organization Document..." });
        const orgCollectionRef = collection(db, "organizations");
        const newOrgData = {
            name: data.orgName,
            address: data.orgAddress,
            phone: data.orgPhone,
            email: data.orgEmail,
            nit: data.orgNit,
            dane: data.orgDane,
            userLimit: Number(data.userLimit),
            logoUrl: logoUrl,
            adminId: '', // Will be updated later
            adminPhotoUrl: adminPhotoUrl, // We already have it
            status: "Active",
            createdAt: serverTimestamp(),
            userCount: 1,
            dataConsumption: 0,
        };
        const orgDocRef = await addDoc(orgCollectionRef, newOrgData);
        orgId = orgDocRef.id;

        // 3. Call the simplified Cloud Function to create the Auth user and set claims
        toast({ title: "Step 3/3: Creating Administrator Account..." });
        const createOrganizationFunction = httpsCallable(functions, 'createOrganization');
        
        const functionPayload = {
            organizationId: orgId,
            adminEmail: data.adminEmail,
            adminPassword: data.adminPassword,
            adminFirstName: data.adminFirstName,
            adminLastName: data.adminLastName,
            adminPhone: data.adminPhone,
            adminPhotoUrl: adminPhotoUrl,
        };
        
        const result = await createOrganizationFunction(functionPayload);
        const resultData = result.data as { success: boolean; message: string; userId: string };

        if (!resultData.success) {
            // Rollback: If function fails, we should ideally delete the Firestore doc and images.
            // For now, we'll show an error.
            throw new Error(resultData.message || "Admin user creation failed.");
        }

        // 4. Final step: Update the organization document with the new admin's UID
        const orgDocToUpdate = doc(db, "organizations", orgId);
        await updateDoc(orgDocToUpdate, { adminId: resultData.userId });

        toast({ title: "Success!", description: "Organization and admin created successfully." });
        onSuccess();

    } catch (error: any) {
        console.error("Error creating organization:", error);
        toast({
            title: "Creation Failed",
            description: error.message || "An unexpected error occurred during the process.",
            variant: "destructive",
        });
        // Here you could add rollback logic, e.g., delete the Firestore document if it was created
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-6">
            
            {/* Organization Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" {...register("orgName", { required: "Name is required" })} />
                  {errors.orgName && <p className="text-destructive text-sm">{errors.orgName.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="orgEmail">Organization Email</Label>
                  <Input id="orgEmail" type="email" {...register("orgEmail", { required: "Email is required" })} />
                  {errors.orgEmail && <p className="text-destructive text-sm">{errors.orgEmail.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="orgAddress">Address</Label>
                  <Input id="orgAddress" {...register("orgAddress", { required: "Address is required" })} />
                  {errors.orgAddress && <p className="text-destructive text-sm">{errors.orgAddress.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Phone</Label>
                  <Input id="orgPhone" type="tel" {...register("orgPhone", { required: "Phone is required" })} />
                  {errors.orgPhone && <p className="text-destructive text-sm">{errors.orgPhone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgNit">NIT</Label>
                  <Input id="orgNit" {...register("orgNit", { required: "NIT is required" })} />
                  {errors.orgNit && <p className="text-destructive text-sm">{errors.orgNit.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgDane">DANE Code</Label>
                  <Input id="orgDane" {...register("orgDane", { required: "DANE code is required" })} />
                  {errors.orgDane && <p className="text-destructive text-sm">{errors.orgDane.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="userLimit">User Limit</Label>
                    <Input id="userLimit" type="number" {...register("userLimit", { required: "User limit is required", valueAsNumber: true, min: 1 })} />
                    {errors.userLimit && <p className="text-destructive text-sm">{errors.userLimit.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logo">Organization Logo</Label>
                    <Input id="logo" type="file" accept="image/*" {...register("logo", { required: "Logo is required" })} />
                    {errors.logo && <p className="text-destructive text-sm">{errors.logo.message}</p>}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Administrator Details */}
            <div className="space-y-4">
               <h3 className="text-lg font-medium text-foreground">
                Tenant Administrator Details
              </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name</Label>
                    <Input id="adminFirstName" {...register("adminFirstName", { required: "Admin first name is required" })} />
                    {errors.adminFirstName && <p className="text-destructive text-sm">{errors.adminFirstName.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name</Label>
                    <Input id="adminLastName" {...register("adminLastName", { required: "Admin last name is required" })} />
                    {errors.adminLastName && <p className="text-destructive text-sm">{errors.adminLastName.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" type="email" {...register("adminEmail", { required: "Admin email is required" })} />
                    {errors.adminEmail && <p className="text-destructive text-sm">{errors.adminEmail.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input id="adminPassword" type="password" {...register("adminPassword", { required: "Password is required", minLength: 6 })} />
                    {errors.adminPassword && <p className="text-destructive text-sm">{errors.adminPassword.message || "Password must be at least 6 characters."}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="adminPhone">Admin Phone</Label>
                    <Input id="adminPhone" type="tel" {...register("adminPhone", { required: "Admin phone is required" })} />
                    {errors.adminPhone && <p className="text-destructive text-sm">{errors.adminPhone.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="adminPhoto">Admin Photo</Label>
                    <Input id="adminPhoto" type="file" accept="image/*" {...register("adminPhoto", { required: "Admin photo is required" })} />
                    {errors.adminPhoto && <p className="text-destructive text-sm">{errors.adminPhoto.message}</p>}
                  </div>
               </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
        </DialogFooter>
      </form>
  );
}
