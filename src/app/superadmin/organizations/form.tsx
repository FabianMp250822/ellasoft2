"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import React from "react";

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

// Helper to convert a file to a Base64 string
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});


export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
        const createOrganizationFunction = httpsCallable(functions, 'createOrganization');

        const logoBase64 = data.logo.length > 0 ? await toBase64(data.logo[0]) : null;
        const adminPhotoBase64 = data.adminPhoto.length > 0 ? await toBase64(data.adminPhoto[0]) : null;

        if (!logoBase64 || !adminPhotoBase64) {
            toast({
                title: "Error",
                description: "Logo and administrator photo are required.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            ...data,
            userLimit: Number(data.userLimit),
            logoBase64,
            adminPhotoBase64,
        };
        
        // We don't need these fields in the payload anymore
        delete (payload as any).logo;
        delete (payload as any).adminPhoto;

        const result = await createOrganizationFunction(payload);
        
        const resultData = result.data as { success: boolean; message: string };

        if (resultData.success) {
            toast({ title: "Success", description: resultData.message });
            onSuccess();
        } else {
            toast({
                title: "Error",
                description: resultData.message,
                variant: "destructive",
            });
        }
    } catch (error: any) {
        console.error("Error creating organization:", error);
        toast({
            title: "Function Error",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ScrollArea className="h-[70vh] pr-6">
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
        <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
        </DialogFooter>
      </form>
    </>
  );
}
