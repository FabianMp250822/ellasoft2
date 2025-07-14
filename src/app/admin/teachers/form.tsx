"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import type { Subject, Grade } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  photo: FileList;
  assignedSubjects: string[];
};

interface CreateTeacherFormProps {
  organizationId: string;
  subjects: Subject[];
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

export function CreateTeacherForm({ organizationId, subjects, grades, onSuccess, onCancel }: CreateTeacherFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      assignedSubjects: [],
    }
  });
  const { toast } = useToast();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
        if (!data.photo[0]) {
            throw new Error("Teacher Photo is required.");
        }
        if (data.assignedSubjects.length === 0) {
            throw new Error("Please assign at least one subject.");
        }

        toast({ title: "Processing...", description: "Preparing data and creating teacher." });
        
        const photoDataUri = await fileToDataUri(data.photo[0]);
        
        const payload = {
            organizationId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            photoDataUri,
            assignedSubjects: data.assignedSubjects,
        };

        const createTeacherFn = httpsCallable(functions, 'createTeacher');
        await createTeacherFn(payload);

        toast({ title: "Success!", description: "Teacher created and assigned successfully." });
        onSuccess();

    } catch (error: any) {
        console.error("Error creating teacher:", error);
        toast({
            title: "Creation Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    }
  };
  
  const getGradeName = (gradeId: string | undefined) => {
      return grades.find(g => g.id === gradeId)?.name || "N/A";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Teacher's Personal Details
              </h3>
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
                    <Label htmlFor="photo">Teacher's Photo</Label>
                    <Input id="photo" type="file" accept="image/*" {...register("photo", { required: "Photo is required" })} />
                    {errors.photo && <p className="text-destructive text-sm">{errors.photo.message}</p>}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
               <h3 className="text-lg font-medium text-foreground">
                Assign Subjects
              </h3>
              <p className="text-sm text-muted-foreground">Select the subjects and grades this teacher will be responsible for.</p>
              <Controller
                control={control}
                name="assignedSubjects"
                render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-48 overflow-y-auto rounded-md border p-4">
                        {subjects.map(subject => (
                            <div key={subject.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`subject-${subject.id}`}
                                    checked={field.value.includes(subject.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...field.value, subject.id])
                                        : field.onChange(field.value.filter(value => value !== subject.id))
                                    }}
                                />
                                <label htmlFor={`subject-${subject.id}`} className="text-sm font-medium leading-none">
                                    {subject.name} <span className="text-muted-foreground">({getGradeName(subject.gradeId)})</span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                />
                {errors.assignedSubjects && <p className="text-destructive text-sm">{errors.assignedSubjects.message}</p>}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Teacher..." : "Create Teacher"}
            </Button>
        </DialogFooter>
      </form>
  );
}
