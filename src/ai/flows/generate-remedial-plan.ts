'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized remedial plans for struggling students.
 *
 * - generateRemedialPlan - A function that generates a remedial plan for a student.
 * - GenerateRemedialPlanInput - The input type for the generateRemedialPlan function.
 * - GenerateRemedialPlanOutput - The output type for the generateRemedialPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRemedialPlanInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  subject: z.string().describe('The subject for which the remedial plan is being generated.'),
  teacherObservations: z.string().describe('Qualitative observations from the teacher regarding the student.'),
  lowPerformanceIndicators: z.string().describe('A list of low-performance indicators for the student.'),
});
export type GenerateRemedialPlanInput = z.infer<typeof GenerateRemedialPlanInputSchema>;

const GenerateRemedialPlanOutputSchema = z.object({
  planTitle: z.string().describe('A motivational title for the remedial plan.'),
  diagnosis: z.string().describe('An analysis of the student performance and possible causes.'),
  objectives: z.string().describe('Clear and measurable objectives for the student.'),
  actionPlan: z.string().describe('Specific steps the student should take to improve.'),
  recommendedResources: z.string().describe('Links to videos, readings, and other helpful resources.'),
  motivationalMessage: z.string().describe('A final message of encouragement for the student.'),
});
export type GenerateRemedialPlanOutput = z.infer<typeof GenerateRemedialPlanOutputSchema>;

export async function generateRemedialPlan(input: GenerateRemedialPlanInput): Promise<GenerateRemedialPlanOutput> {
  return generateRemedialPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRemedialPlanPrompt',
  input: {schema: GenerateRemedialPlanInputSchema},
  output: {schema: GenerateRemedialPlanOutputSchema},
  prompt: `You are a virtual pedagogical assistant helping teachers create personalized remedial plans for struggling students.

  Analyze the provided information to diagnose the possible causes of the student's low performance and create a structured, empathetic, and actionable plan.

  Student Name: {{{studentName}}}
  Subject: {{{subject}}}
  Teacher Observations: {{{teacherObservations}}}
  Low Performance Indicators: {{{lowPerformanceIndicators}}}

  The remedial plan should include the following:
  - planTitle: A motivational title for the remedial plan.
  - diagnosis: An analysis of the student's situation.
  - objectives: Clear and measurable goals for the student.
  - actionPlan: Specific steps the student should take.
  - recommendedResources: Links to helpful videos, readings, etc.
  - motivationalMessage: A final message of encouragement.
  Output the plan as a JSON object.
  `,
});

const generateRemedialPlanFlow = ai.defineFlow(
  {
    name: 'generateRemedialPlanFlow',
    inputSchema: GenerateRemedialPlanInputSchema,
    outputSchema: GenerateRemedialPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
