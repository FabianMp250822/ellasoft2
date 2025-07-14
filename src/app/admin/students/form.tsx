"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import type { Grade } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  photo: FileList;
  gradeId: string;
};

interface CreateStudentFormProps {
  organizationId: string;
  grades: Grade[];
  onSuccess: () => void;
  onCancel: () => void;
}

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function CreateStudentForm({ organizationId, grades, onSuccess, onCancel }: CreateStudentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
        if (!data.photo[0]) {
            throw new Error("Student Photo is required.");
        }
        if (!data.gradeId) {
            throw new Error("Please assign a grade to the student.");
        }

        toast({ title: "Processing...", description: "Preparing data and creating student." });
        
        const photoDataUri = await fileToDataUri(data.photo[0]);
        
        const payload = {
            organizationId,
            ...data,
            photoDataUri,
        };
        // remove FileList from payload as it's not serializable
        delete (payload as any).photo;

        const createStudentFn = httpsCallable(functions, 'createStudent');
        await createStudentFn(payload);

        toast({ title: "Success!", description: "Student created successfully." });
        onSuccess();

    } catch (error: any) {
        console.error("Error creating student:", error);
        toast({
            title: "Creation Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName", { required: "First name is required" })} />
                {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
              </div>
                <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName", { required: "Last name is required" })} />
                {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
              </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
                <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" {...register("password", { required: "Password is required", minLength: 6 })} />
                {errors.password && <p className="text-destructive text-sm">{errors.password.message || "Password must be at least 6 characters."}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register("phone", { required: "Phone is required" })} />
                {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="photo">Student's Photo</Label>
                  <Input id="photo" type="file" accept="image/*" {...register("photo", { required: "Photo is required" })} />
                  {errors.photo && <p className="text-destructive text-sm">{errors.photo.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeId">Assign to Grade</Label>
               <Controller
                  name="gradeId"
                  control={control}
                  rules={{ required: 'Please select a grade' }}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a grade..." />
                        </SelectTrigger>
                        <SelectContent>
                            {grades.map(grade => (
                            <SelectItem key={grade.id} value={grade.id}>{grade.name} - {grade.groupName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}
                />
              {errors.gradeId && <p className="text-destructive text-sm">{errors.gradeId.message}</p>}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Student..." : "Create Student"}
            </Button>
        </DialogFooter>
      </form>
  );
}
