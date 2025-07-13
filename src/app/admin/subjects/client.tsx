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
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "@/lib/data";
import { useFormState, useFormStatus } from "react-dom";
import { createSubjectAction, updateSubjectAction, deleteSubjectAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

function SubjectForm({
  subject,
  onClose,
}: {
  subject?: Subject;
  onClose: () => void;
}) {
  const action = subject ? updateSubjectAction : createSubjectAction;
  const [state, dispatch] = useFormState(action, { message: null, errors: {} });
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.message) {
      if(Object.keys(state.errors || {}).length > 0) {
        toast({ title: "Error", description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: state.message });
        onClose();
      }
    }
  }, [state, toast, onClose]);

  return (
    <form action={dispatch}>
      {subject && <input type="hidden" name="id" value={subject.id} />}
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <div className="col-span-3">
            <Input id="name" name="name" defaultValue={subject?.name} placeholder="e.g. Calculus I" />
             {state.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <div className="col-span-3">
            <Textarea id="description" name="description" defaultValue={subject?.description} placeholder="A brief description of the subject"/>
            {state.errors?.description && <p className="text-destructive text-sm mt-1">{state.errors.description[0]}</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <SubmitButton>{subject ? "Save Changes" : "Create Subject"}</SubmitButton>
      </DialogFooter>
    </form>
  );
}

function DeleteSubjectDialog({ subjectId, onDeleted }: { subjectId: string, onDeleted: () => void }) {
    const {toast} = useToast();
    const handleDelete = async () => {
        const result = await deleteSubjectAction(subjectId);
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

export function SubjectsClient({ data }: { data: Subject[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = React.useState<Subject | undefined>(undefined);

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
                      <DeleteSubjectDialog subjectId={subject.id} onDeleted={() => setMenuOpen(null)} />
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
          <SubjectForm subject={currentSubject} onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
