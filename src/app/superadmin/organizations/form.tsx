"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createOrganizationAction } from "./actions";

export type FormValues = {
  name: string;
  address: string;
  phone: string;
  email: string;
  nit: string;
  dane: string;
  userLimit: number;
};

interface CreateOrganizationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const result = await createOrganizationAction({
        ...data,
        userLimit: Number(data.userLimit)
    });

    if (result.success) {
        toast({ title: "Success", description: result.message });
        onSuccess();
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
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </>
  );
}
