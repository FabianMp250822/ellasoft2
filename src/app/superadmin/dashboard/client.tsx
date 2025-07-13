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
import { MoreHorizontal, PlusCircle, Ban, PlayCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import Image from "next/image";
import { createOrganizationAction, suspendOrganizationAction } from "./actions";
import { ScrollArea } from "@/components/ui/scroll-area";


type FormValues = {
  orgName: string;
  orgAddress: string;
  orgPhone: string;
  orgEmail:string;
  orgNit: string;
  orgDane: string;
  orgLogo: FileList;
  userLimit: number;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  adminEmail: string;
  adminPassword: string;
  adminPhoto: FileList;
};

function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "orgLogo" || key === "adminPhoto") {
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        }
      } else {
        formData.append(key, String(value));
      }
    });

    const result = await createOrganizationAction(formData);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ScrollArea className="h-[70vh] pr-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Organization Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  {...register("orgName", { required: "Name is required" })}
                />
                {errors.orgName && (
                  <p className="text-destructive text-sm">
                    {errors.orgName.message}
                  </p>
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor="userLimit">User Limit</Label>
                <Input
                  id="userLimit"
                  type="number"
                  {...register("userLimit", { required: "User limit is required", valueAsNumber: true, min: 1 })}
                />
                {errors.userLimit && (
                  <p className="text-destructive text-sm">
                    {errors.userLimit.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgAddress">Address</Label>
                <Input
                  id="orgAddress"
                  {...register("orgAddress", {
                    required: "Address is required",
                  })}
                />
                {errors.orgAddress && (
                  <p className="text-destructive text-sm">
                    {errors.orgAddress.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgPhone">Phone</Label>
                <Input
                  id="orgPhone"
                  type="tel"
                  {...register("orgPhone", { required: "Phone is required" })}
                />
                {errors.orgPhone && (
                  <p className="text-destructive text-sm">
                    {errors.orgPhone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgEmail">Email</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  {...register("orgEmail", { required: "Email is required" })}
                />
                {errors.orgEmail && (
                  <p className="text-destructive text-sm">
                    {errors.orgEmail.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgNit">NIT</Label>
                <Input
                  id="orgNit"
                  {...register("orgNit", { required: "NIT is required" })}
                />
                {errors.orgNit && (
                  <p className="text-destructive text-sm">
                    {errors.orgNit.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgDane">DANE</Label>
                <Input
                  id="orgDane"
                  {...register("orgDane", {
                    required: "DANE code is required",
                  })}
                />
                {errors.orgDane && (
                  <p className="text-destructive text-sm">
                    {errors.orgDane.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="orgLogo">Organization Logo</Label>
                <Input
                  id="orgLogo"
                  type="file"
                  accept="image/*"
                  {...register("orgLogo", { required: "Logo is required" })}
                />
                {errors.orgLogo && (
                  <p className="text-destructive text-sm">
                    {errors.orgLogo.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-foreground">
              Administrator Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">First Name</Label>
                <Input
                  id="adminFirstName"
                  {...register("adminFirstName", {
                    required: "First name is required",
                  })}
                />
                {errors.adminFirstName && (
                  <p className="text-destructive text-sm">
                    {errors.adminFirstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName">Last Name</Label>
                <Input
                  id="adminLastName"
                  {...register("adminLastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.adminLastName && (
                  <p className="text-destructive text-sm">
                    {errors.adminLastName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Phone</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  {...register("adminPhone", {
                    required: "Admin phone is required",
                  })}
                />
                {errors.adminPhone && (
                  <p className="text-destructive text-sm">
                    {errors.adminPhone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register("adminEmail", {
                    required: "Admin email is required",
                  })}
                />
                {errors.adminEmail && (
                  <p className="text-destructive text-sm">
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register("adminPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.adminPassword && (
                  <p className="text-destructive text-sm">
                    {errors.adminPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhoto">Admin Photo</Label>
                <Input
                  id="adminPhoto"
                  type="file"
                  accept="image/*"
                  {...register("adminPhoto", {
                    required: "Admin photo is required",
                  })}
                />
                {errors.adminPhoto && (
                  <p className="text-destructive text-sm">
                    {errors.adminPhoto.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 -mx-6 px-6">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </>
  );
}

export function OrganizationsClient({ data }: { data: Organization[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSuspend = async (orgId: string, currentStatus: "Active" | "Suspended") => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const result = await suspendOrganizationAction(orgId, newStatus);
    if (result.success) {
      toast({ title: "Success", description: `Organization has been ${newStatus.toLowerCase()}.` });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Tenant Institutions</CardTitle>
                <CardDescription>
                A list of all organizations currently using EduAI.
                </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Create Organization
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-3">
                        {org.logoUrl && (
                        <Image
                            src={org.logoUrl}
                            alt={org.name}
                            width={32}
                            height={32}
                            className="rounded-md"
                            data-ai-hint="logo"
                        />
                        )}
                        <div className="flex flex-col">
                           <span className="font-semibold">{org.name}</span>
                           <span className="text-xs text-muted-foreground">{org.email}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={org.status === "Active" ? "default" : "destructive"}
                    >
                      {org.status}
                    </Badge>
                  </TableCell>
                   <TableCell>
                    <div className="font-medium">{org.userCount} / {org.userLimit}</div>
                  </TableCell>
                   <TableCell>
                    <div className="font-medium">{(org.dataConsumption || 0).toFixed(2)} GB</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        {org.status === 'Active' ? (
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleSuspend(org.id, org.status)}>
                                <Ban className="mr-2 h-4 w-4"/>
                                Suspend
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem className="text-green-600 focus:bg-green-100 focus:text-green-700" onClick={() => handleSuspend(org.id, org.status)}>
                                <PlayCircle className="mr-2 h-4 w-4"/>
                                Reactivate
                            </DropdownMenuItem>
                        )}
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
              Fill out the form below to register a new institution on the
              platform.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
