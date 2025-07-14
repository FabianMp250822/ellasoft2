
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
import { MoreHorizontal, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Grade } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getGrades, updateGrade, deleteGrade } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";


function GradeForm({
  grade,
  organizationId,
  onClose,
}: {
  grade?: Grade;
  organizationId: string;
  onClose: () => void;
}) {
    const [name, setName] = React.useState(grade?.name || "");
    const [groupName, setGroupName] = React.useState(grade?.groupName || "");
    const [isSubmitting, setSubmitting] = React.useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (grade) {
                await updateGrade(grade.id, { name, groupName });
                toast({ title: "Success", description: "Grade updated successfully." });
            } else {
                const createGradeFn = httpsCallable(functions, 'createGrade');
                await createGradeFn({ organizationId, name, groupName });
                toast({ title: "Success", description: "Grade created successfully." });
            }
            onClose();
        } catch (error: any) {
            console.error("Error submitting form:", error);
            toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Grade Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 9th Grade, 1st Semester" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="groupName" className="text-right">
            Group Name
          </Label>
          <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Group A, Section 1" className="col-span-3"/>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : (grade ? "Save Changes" : "Create Grade")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteGradeDialog({ gradeId, onDeleted }: { gradeId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        try {
            await deleteGrade(gradeId);
            toast({ title: "Success", description: "Grade deleted successfully." });
            onDeleted();
        } catch(e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
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
                        This action cannot be undone. This will permanently delete the grade and group combination.
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

  if (loading || !claims?.organizationId) {
    return <LoadingSpinner />;
  }

  return (
    <>
        <div className="flex justify-end mb-4">
            <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Grade/Group
            </Button>
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Grade Name</TableHead>
                <TableHead>Group Name</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
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
                <DialogTitle>{currentGrade ? "Edit Grade/Group" : "Create Grade/Group"}</DialogTitle>
                <DialogDescription>
                    {currentGrade ? "Make changes to the grade/group combination here." : "Add a new grade and group to your institution."}
                </DialogDescription>
                </DialogHeader>
                <GradeForm grade={currentGrade} organizationId={claims.organizationId} onClose={handleDialogClose} />
            </DialogContent>
        </Dialog>
    </>
  );
}
