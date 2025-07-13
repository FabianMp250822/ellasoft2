'use server';

/**
 * @fileOverview A student feedback generation AI agent.
 *
 * - generateStudentFeedback - A function that handles the student feedback generation process.
 * - GenerateStudentFeedbackInput - The input type for the generateStudentFeedback function.
 * - GenerateStudentFeedbackOutput - The return type for the GenerateStudentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudentFeedbackInputSchema = z.object({
  performanceIndicators: z
    .array(z.string())
    .describe('A list of performance indicators for the student.'),
  formatInstructions: z
    .string()
    .describe('Instructions on the format and length of the feedback.'),
});
export type GenerateStudentFeedbackInput = z.infer<
  typeof GenerateStudentFeedbackInputSchema
>;

const GenerateStudentFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The generated feedback for the student.'),
});
export type GenerateStudentFeedbackOutput = z.infer<
  typeof GenerateStudentFeedbackOutputSchema
>;

export async function generateStudentFeedback(
  input: GenerateStudentFeedbackInput
): Promise<GenerateStudentFeedbackOutput> {
  return generateStudentFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentFeedbackPrompt',
  input: {schema: GenerateStudentFeedbackInputSchema},
  output: {schema: GenerateStudentFeedbackOutputSchema},
  prompt: `You are an AI assistant designed to help teachers generate student feedback based on performance indicators.

  Given the following performance indicators and format instructions, generate feedback for the student:

  Performance Indicators:
  {{#each performanceIndicators}}
  - {{{this}}}
  {{/each}}

  Format Instructions: {{{formatInstructions}}}`,
});

const generateStudentFeedbackFlow = ai.defineFlow(
  {
    name: 'generateStudentFeedbackFlow',
    inputSchema: GenerateStudentFeedbackInputSchema,
    outputSchema: GenerateStudentFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
