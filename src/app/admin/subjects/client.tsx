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
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getSubjects, addSubject, updateSubject, deleteSubject } from "@/lib/data";
import { LoadingSpinner } from "@/components/loading-spinner";

function SubjectForm({
  subject,
  organizationId,
  onClose,
}: {
  subject?: Subject;
  organizationId: string;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(subject?.name || "");
  const [description, setDescription] = React.useState(subject?.description || "");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        if (subject) {
            await updateSubject(subject.id, { name, description });
            toast({ title: "Success", description: "Subject updated successfully." });
        } else {
            await addSubject(organizationId, { name, description });
            toast({ title: "Success", description: "Subject created successfully." });
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
            Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Calculus I" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A brief description of the subject"/>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="ghost" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : (subject ? "Save Changes" : "Create Subject")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DeleteSubjectDialog({ subjectId, onDeleted }: { subjectId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        try {
            await deleteSubject(subjectId);
            toast({ title: "Success", description: "Subject deleted successfully." });
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
                        This action cannot be undone. This will permanently delete the subject.
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

export function SubjectsClient() {
  const [data, setData] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = React.useState<Subject | undefined>(undefined);
  const { user, claims } = useAuth();
  const { toast } = useToast();

  const fetchData = React.useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const subjects = await getSubjects(orgId);
      setData(subjects);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast({ title: "Error", description: "Could not fetch subjects.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (user && claims?.organizationId) {
      fetchData(claims.organizationId);
    }
  }, [user, claims, fetchData]);

  const handleEdit = (subject: Subject) => {
    setCurrentSubject(subject);
    setDialogOpen(true);
    setMenuOpen(null);
  };

  const handleCreate = () => {
    setCurrentSubject(undefined);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentSubject(undefined);
    if (claims?.organizationId) fetchData(claims.organizationId);
  }

  if (loading || !claims?.organizationId) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Subject
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell>{subject.description}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu onOpenChange={(isOpen) => setMenuOpen(isOpen ? subject.id : null)} open={isMenuOpen === subject.id}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(subject)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DeleteSubjectDialog subjectId={subject.id} onDeleted={() => { setMenuOpen(null); if (claims?.organizationId) fetchData(claims.organizationId);}} />
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
            <DialogTitle>{currentSubject ? "Edit Subject" : "Create Subject"}</DialogTitle>
            <DialogDescription>
              {currentSubject
                ? "Make changes to the subject here. Click save when you're done."
                : "Add a new subject to your institution."}
            </DialogDescription>
          </DialogHeader>
          <SubjectForm subject={currentSubject} organizationId={claims.organizationId} onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
