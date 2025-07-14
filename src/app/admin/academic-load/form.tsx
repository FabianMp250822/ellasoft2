"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Teacher, Subject, Grade, AcademicPeriod } from "@/lib/data";
import { Loader2 } from "lucide-react";

type FormValues = {
  teacherId: string;
  subjectId: string;
  gradeId: string;
  academicPeriodId: string;
};

interface AcademicLoadFormProps {
  organizationId: string;
  teachers: Teacher[];
  subjects: Subject[];
  grades: Grade[];
  periods: AcademicPeriod[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AcademicLoadForm({ organizationId, teachers, subjects, grades, periods, onSuccess, onCancel }: AcademicLoadFormProps) {
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const { toast } = useToast();

  const onSubmit = async (data: FormValues) => {
    try {
      const createAcademicLoadFn = httpsCallable(functions, 'createAcademicLoad');
      await createAcademicLoadFn({ organizationId, ...data });
      toast({ title: "Success", description: "Academic assignment created." });
      onSuccess();
    } catch (error: any) {
      console.error("Error creating academic load:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment.",
        variant: "destructive",
      });
    }
  };

  const getSubjectDetails = (subject: Subject) => {
    const grade = grades.find(g => g.id === subject.gradeId);
    return `${subject.name} (${grade ? `${grade.name} - ${grade.groupName}` : 'N/A'})`;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label>Academic Period</Label>
            <Controller
                name="academicPeriodId"
                control={control}
                rules={{ required: "Period is required" }}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a period" /></SelectTrigger>
                    <SelectContent>
                        {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                    </Select>
                )}
            />
            {errors.academicPeriodId && <p className="text-sm text-destructive">{errors.academicPeriodId.message}</p>}
        </div>

      <div className="space-y-2">
        <Label>Teacher</Label>
        <Controller
            name="teacherId"
            control={control}
            rules={{ required: "Teacher is required" }}
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                <SelectContent>
                    {teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{`${t.firstName} ${t.lastName}`}</SelectItem>)}
                </SelectContent>
                </Select>
            )}
        />
        {errors.teacherId && <p className="text-sm text-destructive">{errors.teacherId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Subject & Grade</Label>
        <Controller
            name="subjectId"
            control={control}
            rules={{ required: "Subject is required" }}
            render={({ field }) => (
                <Select onValueChange={(value) => {
                    const selectedSubject = subjects.find(s => s.id === value);
                    if (selectedSubject && selectedSubject.gradeId) {
                        // This assumes one subject is tied to one grade, which is our current model.
                        // We set both subject and grade from this one selection.
                        setValue('subjectId', selectedSubject.id);
                        setValue('gradeId', selectedSubject.gradeId);
                        field.onChange(value);
                    }
                }} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{getSubjectDetails(s)}</SelectItem>)}
                </SelectContent>
                </Select>
            )}
        />
        {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId.message}</p>}
      </div>
      

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign Load
        </Button>
      </div>
    </form>
  );
}
