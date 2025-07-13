"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

const gradesData = [
  { subject: "Calculus", grade: 4.5 },
  { subject: "Physics", grade: 3.8 },
  { subject: "Art History", grade: 4.9 },
  { subject: "Chemistry", grade: 2.5 },
  { subject: "Literature", grade: 3.2 },
];

const getBadgeVariant = (grade: number): "default" | "secondary" | "destructive" => {
  if (grade >= 4.0) return "default";
  if (grade >= 3.0) return "secondary";
  return "destructive";
};

const getStatus = (grade: number) => {
    if (grade >= 3.0) return "Passing";
    return "Failing";
}

const chartConfig = {
    grade: {
      label: "Grade",
      color: "hsl(var(--primary))",
    },
};

export function StudentDashboardClient() {
    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Grades Overview</CardTitle>
            <CardDescription>Your performance across all subjects this period.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height={350}>
                <BarChart data={gradesData} accessibilityLayer>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                    dataKey="subject"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    />
                    <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 5]}
                    />
                    <Tooltip
                        cursor={{fill: 'hsl(var(--muted))'}}
                        content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="grade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Subject Details</CardTitle>
            <CardDescription>
              A detailed list of your grades per subject.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData.map((item) => (
                  <TableRow key={item.subject}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(item.grade)}>
                        {getStatus(item.grade)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{item.grade.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
}
