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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/data";
import Image from "next/image";
import { createOrganizationAction, setOrganizationStatusAction } from "./actions";
import { ScrollArea } from "@/components/ui/scroll-area";


export type FormValues = {
  name: string;
  address: string;
  phone: string;
  email:string;
  nit: string;
  dane: string;
  userLimit: number;
};


function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Note: Admin user creation and image uploads are simplified/omitted
    // in this client-only approach. A real app would need a callable function
    // for secure user creation and signed URLs for uploads.
    
    const result = await createOrganizationAction({
        ...data,
        userLimit: Number(data.userLimit) // Ensure it's a number
    });

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
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address", {
                    required: "Address is required",
                  })}
                />
                {errors.address && (
                  <p className="text-destructive text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", { required: "Phone is required" })}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  {...register("nit", { required: "NIT is required" })}
                />
                {errors.nit && (
                  <p className="text-destructive text-sm">
                    {errors.nit.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dane">DANE</Label>
                <Input
                  id="dane"
                  {...register("dane", {
                    required: "DANE code is required",
                  })}
                />
                {errors.dane && (
                  <p className="text-destructive text-sm">
                    {errors.dane.message}
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

function OrganizationTable({
  organizations,
  onStatusChange,
}: {
  organizations: Organization[];
  onStatusChange: (orgId: string, status: Organization["status"]) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
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
            {organizations.map((org) => (
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
                      <span className="text-xs text-muted-foreground">
                        {org.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      org.status === "Active"
                        ? "default"
                        : org.status === "Suspended"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {org.userCount || 0} / {org.userLimit}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {(org.dataConsumption || 0).toFixed(2)} GB
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
                      <DropdownMenuSeparator />
                      {org.status === "Active" ? (
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => onStatusChange(org.id, "Suspended")}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600 focus:bg-green-100 focus:text-green-700"
                          onClick={() => onStatusChange(org.id, "Active")}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
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
  );
}

export function OrganizationsClient({ data }: { data: Organization[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (orgId: string, newStatus: Organization['status']) => {
    const result = await setOrganizationStatusAction(orgId, newStatus);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ title: "Error", description: String(result.message), variant: "destructive" });
    }
  }

  const activeOrgs = data.filter(org => org.status === 'Active');
  const suspendedOrgs = data.filter(org => org.status === 'Suspended');
  const inArrearsOrgs = data.filter(org => org.status === 'In Arrears');


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Create Organization
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeOrgs.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspendedOrgs.length})</TabsTrigger>
          <TabsTrigger value="arrears">In Arrears ({inArrearsOrgs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <OrganizationTable organizations={activeOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="suspended" className="mt-4">
           <OrganizationTable organizations={suspendedOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="arrears" className="mt-4">
            <OrganizationTable organizations={inArrearsOrgs} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>


      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Fill out the form below to register a new institution on the
              platform. Note: Admin creation and image uploads are handled separately.
            </DialogDescription>
          </DialogHeader>
          <CreateOrganizationForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
