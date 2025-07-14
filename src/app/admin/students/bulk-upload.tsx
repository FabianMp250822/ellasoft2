"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, UploadCloud } from "lucide-react";
import React from "react";

export function BulkUpload() {

    const handleDownloadTemplate = () => {
        const headers = "firstName,lastName,email,password,phone,gradeId";
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "student_upload_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Student Upload</CardTitle>
        <CardDescription>
          Efficiently enroll multiple students by uploading a CSV file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h3 className="font-medium">Step 1: Download Template</h3>
            <p className="text-sm text-muted-foreground">
                Download the CSV template to ensure your data is in the correct format. 
                You will need the internal Grade ID, which can be found by inspecting the network requests or we can add a feature to export grades with IDs later.
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
            </Button>
        </div>

        <div className="space-y-2">
            <h3 className="font-medium">Step 2: Upload Your File</h3>
            <p className="text-sm text-muted-foreground">
                Once you have filled out the template, upload the CSV file here.
            </p>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="file" accept=".csv" />
                <Button>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload
                </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">Backend processing for bulk uploads is coming soon.</p>
        </div>
      </CardContent>
       <CardFooter>
        <p className="text-sm text-muted-foreground">
          This feature provides the UI for bulk uploads. The full backend processing can be implemented as a next step.
        </p>
      </CardFooter>
    </Card>
  );
}
