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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Grade } from "@/lib/data";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createGradeAction, updateGradeAction, deleteGradeAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getGrades } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

function GradeForm({
  grade,
  onClose,
}: {
  grade?: Grade;
  onClose: () => void;
}) {
  const action = grade ? updateGradeAction : createGradeAction;
  const [state, dispatch] = useActionState(action, { message: null, errors: {} });
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors || {}).length > 0) {
        toast({ title: "Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
        onClose();
      }
    }
  }, [state, toast, onClose]);

  return (
    <form action={dispatch}>
      {grade && <input type="hidden" name="id" value={grade.id} />}
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Grade Name
          </Label>
          <div className="col-span-3">
            <Input id="name" name="name" defaultValue={grade?.name} />
            {state.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="groupName" className="text-right">
            Group Name
          </Label>
          <div className="col-span-3">
            <Input id="groupName" name="groupName" defaultValue={grade?.groupName} placeholder="e.g. Group A, Section 1"/>
            {state.errors?.groupName && <p className="text-destructive text-sm mt-1">{state.errors.groupName[0]}</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <SubmitButton>{grade ? "Save Changes" : "Create Grade"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}

function DeleteGradeDialog({ gradeId, onDeleted }: { gradeId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        const result = await deleteGradeAction(gradeId);
        if (result.message) {
            toast({ title: "Success", description: result.message });
            onDeleted();
        }
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the grade.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function GradesClient() {
  const [data, setData] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [currentGrade, setCurrentGrade] = React.useState<Grade | undefined>(undefined);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const grades = await getGrades(orgId);
      setData(grades);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
      toast({ title: "Error", description: "Could not fetch grades.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user && claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [user, claims, fetchData]);

  const handleEdit = (grade: Grade) => {
    setCurrentGrade(grade);
    setDialogOpen(true);
    setMenuOpen(null);
  };

  const handleCreate = () => {
    setCurrentGrade(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentGrade(undefined);
    if (claims?.organizationId) fetchData(claims.organizationId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Grade
            </Button>
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Grade Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.map((grade) => (
                <TableRow key={grade.id}>
                <TableCell className="font-medium">{grade.name}</TableCell>
                <TableCell>{grade.groupName}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu onOpenChange={(isOpen) => setMenuOpen(isOpen ? grade.id : null)} open={isMenuOpen === grade.id}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(grade)}>
                        Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DeleteGradeDialog gradeId={grade.id} onDeleted={() => { setMenuOpen(null); if (claims?.organizationId) fetchData(claims.organizationId); }}/>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{currentGrade ? "Edit Grade" : "Create Grade"}</DialogTitle>
                <DialogDescription>
                    {currentGrade ? "Make changes to the grade here. Click save when you're done." : "Add a new grade to your institution."}
                </DialogDescription>
                </DialogHeader>
                <GradeForm grade={currentGrade} onClose={handleDialogClose} />
            </DialogContent>
        </Dialog>
    </>
  );
}
