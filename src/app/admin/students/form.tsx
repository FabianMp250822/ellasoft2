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
import { Separator } from "@/components/ui/separator";

export type FormValues = {
  // Personal Data
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  email: string;
  phone: string;
  photo: FileList;

  // Academic Data
  gradeId: string;
  password: string;

  // Family Data
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;

  motherName?: string;
  motherPhone?: string;
  
  fatherName?: string;
  fatherPhone?: string;
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

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres</Label>
                  <Input id="firstName" {...register("firstName", { required: "Nombres son requeridos" })} />
                  {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input id="lastName" {...register("lastName", { required: "Apellidos son requeridos" })} />
                  {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                   <Controller
                      name="documentType"
                      control={control}
                      rules={{ required: 'Seleccione un tipo' }}
                      render={({ field }) => (
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Seleccione un tipo..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                <SelectItem value="RC">Registro Civil</SelectItem>
                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                            </SelectContent>
                        </Select>
                      )}
                    />
                  {errors.documentType && <p className="text-destructive text-sm">{errors.documentType.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input id="documentNumber" {...register("documentNumber", { required: "Número es requerido" })} />
                  {errors.documentNumber && <p className="text-destructive text-sm">{errors.documentNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth", { required: "Fecha es requerida" })} />
                  {errors.dateOfBirth && <p className="text-destructive text-sm">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                   <Controller
                      name="gender"
                      control={control}
                      rules={{ required: 'Seleccione un género' }}
                      render={({ field }) => (
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Seleccione un género..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Masculino</SelectItem>
                                <SelectItem value="female">Femenino</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                      )}
                    />
                  {errors.gender && <p className="text-destructive text-sm">{errors.gender.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="address">Dirección de Residencia</Label>
                  <Input id="address" {...register("address", { required: "Dirección es requerida" })} />
                  {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" {...register("phone", { required: "Teléfono es requerido" })} />
                  {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Academic Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Información Académica y de Acceso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email", { required: "Email es requerido" })} />
                        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Temporal</Label>
                        <Input id="password" type="password" {...register("password", { required: "Contraseña es requerida", minLength: 6 })} />
                        {errors.password && <p className="text-destructive text-sm">{errors.password.message || "La contraseña debe tener al menos 6 caracteres."}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="photo">Foto del Estudiante</Label>
                        <Input id="photo" type="file" accept="image/*" {...register("photo", { required: "Foto es requerida" })} />
                        {errors.photo && <p className="text-destructive text-sm">{errors.photo.message}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="gradeId">Asignar a Grado</Label>
                    <Controller
                        name="gradeId"
                        control={control}
                        rules={{ required: 'Por favor seleccione un grado' }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un grado..." />
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
            </div>

            <Separator className="my-6" />

             {/* Family Details */}
             <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Información del Acudiente / Padres</h3>
                <div className="rounded-md border p-4 space-y-4">
                    <h4 className="font-medium text-md">Acudiente Principal (Obligatorio)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guardianName">Nombre Completo del Acudiente</Label>
                            <Input id="guardianName" {...register("guardianName", { required: "Nombre del acudiente es requerido" })} />
                            {errors.guardianName && <p className="text-destructive text-sm">{errors.guardianName.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="guardianPhone">Teléfono del Acudiente</Label>
                            <Input id="guardianPhone" type="tel" {...register("guardianPhone", { required: "Teléfono del acudiente es requerido" })} />
                            {errors.guardianPhone && <p className="text-destructive text-sm">{errors.guardianPhone.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="guardianEmail">Email del Acudiente</Label>
                            <Input id="guardianEmail" type="email" {...register("guardianEmail", { required: "Email del acudiente es requerido" })} />
                            {errors.guardianEmail && <p className="text-destructive text-sm">{errors.guardianEmail.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                   <div className="rounded-md border p-4 space-y-4">
                        <h4 className="font-medium text-md">Datos de la Madre (Opcional)</h4>
                        <div className="space-y-2">
                            <Label htmlFor="motherName">Nombre Completo</Label>
                            <Input id="motherName" {...register("motherName")} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="motherPhone">Teléfono</Label>
                            <Input id="motherPhone" type="tel" {...register("motherPhone")} />
                        </div>
                    </div>
                    <div className="rounded-md border p-4 space-y-4">
                        <h4 className="font-medium text-md">Datos del Padre (Opcional)</h4>
                        <div className="space-y-2">
                            <Label htmlFor="fatherName">Nombre Completo</Label>
                            <Input id="fatherName" {...register("fatherName")} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="fatherPhone">Teléfono</Label>
                            <Input id="fatherPhone" type="tel" {...register("fatherPhone")} />
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </ScrollArea>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creando Estudiante..." : "Crear Estudiante"}
            </Button>
        </DialogFooter>
      </form>
  );
}
