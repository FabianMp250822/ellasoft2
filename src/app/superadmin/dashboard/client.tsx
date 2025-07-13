"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import Image from "next/image";
import { createOrganizationAction } from "./actions";

type FormValues = {
  orgName: string;
  orgAddress: string;
  orgPhone: string;
  orgEmail: string;
  orgNit: string;
  orgDane: string;
  orgLogo: FileList;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  adminEmail: string;
  adminPassword: string;
  adminPhoto: FileList;
};

function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'orgLogo' || key === 'adminPhoto') {
            if (value instanceof FileList && value.length > 0) {
                formData.append(key, value[0]);
            }
        } else {
            formData.append(key, value);
        }
    });

    const result = await createOrganizationAction(formData);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      onClose();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
       <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" {...register("orgName", { required: "Name is required" })} />
                {errors.orgName && <p className="text-destructive text-sm">{errors.orgName.message}</p>}
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
                <Label htmlFor="orgEmail">Email</Label>
                <Input id="orgEmail" type="email" {...register("orgEmail", { required: "Email is required" })} />
                {errors.orgEmail && <p className="text-destructive text-sm">{errors.orgEmail.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="orgNit">NIT</Label>
                <Input id="orgNit" {...register("orgNit", { required: "NIT is required" })} />
                {errors.orgNit && <p className="text-destructive text-sm">{errors.orgNit.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="orgDane">DANE</Label>
                <Input id="orgDane" {...register("orgDane", { required: "DANE code is required" })} />
                {errors.orgDane && <p className="text-destructive text-sm">{errors.orgDane.message}</p>}
            </div>
            <div className="space-y-2 col-span-full">
                <Label htmlFor="orgLogo">Organization Logo</Label>
                <Input id="orgLogo" type="file" accept="image/*" {...register("orgLogo", { required: "Logo is required" })} />
                {errors.orgLogo && <p className="text-destructive text-sm">{errors.orgLogo.message}</p>}
            </div>
        </div>
       </div>

        <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium text-foreground">Administrator Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="adminFirstName">First Name</Label>
                <Input id="adminFirstName" {...register("adminFirstName", { required: "First name is required" })} />
                {errors.adminFirstName && <p className="text-destructive text-sm">{errors.adminFirstName.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="adminLastName">Last Name</Label>
                <Input id="adminLastName" {...register("adminLastName", { required: "Last name is required" })} />
                 {errors.adminLastName && <p className="text-destructive text-sm">{errors.adminLastName.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone</Label>
                <Input id="adminPhone" type="tel" {...register("adminPhone", { required: "Admin phone is required" })} />
                 {errors.adminPhone && <p className="text-destructive text-sm">{errors.adminPhone.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" {...register("adminEmail", { required: "Admin email is required" })} />
                {errors.adminEmail && <p className="text-destructive text-sm">{errors.adminEmail.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input id="adminPassword" type="password" {...register("adminPassword", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
                {errors.adminPassword && <p className="text-destructive text-sm">{errors.adminPassword.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="adminPhoto">Admin Photo</Label>
                <Input id="adminPhoto" type="file" accept="image/*" {...register("adminPhoto", { required: "Admin photo is required" })} />
                {errors.adminPhoto && <p className="text-destructive text-sm">{errors.adminPhoto.message}</p>}
            </div>
        </div>
        </div>

        <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
        </DialogFooter>
    </form>
  )
}

export function OrganizationsClient({ data }: { data: Organization[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-end">
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="font-headline">Tenant Institutions</CardTitle>
          <CardDescription>
            A list of all organizations currently using EduAI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {org.logoUrl && <Image src={org.logoUrl} alt={org.name} width={32} height={32} className="rounded-md" data-ai-hint="logo" />}
                    {org.name}
                    </TableCell>
                  <TableCell>
                    <Badge variant={org.status === "Active" ? "default" : "secondary"}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{org.admin}</div>
                    <div className="text-sm text-muted-foreground">{org.email}</div>
                  </TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Fill out the form below to register a new institution on the platform.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
