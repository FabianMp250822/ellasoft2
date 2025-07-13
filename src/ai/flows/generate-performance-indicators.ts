'use server';

/**
 * @fileOverview A performance indicator generation AI agent.
 *
 * - generatePerformanceIndicators - A function that handles the indicator generation process.
 * - GeneratePerformanceIndicatorsInput - The input type for the generatePerformanceIndicators function.
 * - GeneratePerformanceIndicatorsOutput - The return type for the GeneratePerformanceIndicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerformanceIndicatorsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate indicators.'),
  gradeLevel: z.string().describe('The grade level for which to generate indicators.'),
});
export type GeneratePerformanceIndicatorsInput = z.infer<typeof GeneratePerformanceIndicatorsInputSchema>;

const GeneratePerformanceIndicatorsOutputSchema = z.object({
  indicators: z.object({
    bajo: z.array(z.string()).describe('Indicators for the Bajo (Low) performance level.'),
    basico: z.array(z.string()).describe('Indicators for the Basico (Basic) performance level.'),
    alto: z.array(z.string()).describe('Indicators for the Alto (High) performance level.'),
    superior: z.array(z.string()).describe('Indicators for the Superior performance level.'),
  }).describe('A set of performance indicators for each performance level.'),
});
export type GeneratePerformanceIndicatorsOutput = z.infer<typeof GeneratePerformanceIndicatorsOutputSchema>;

export async function generatePerformanceIndicators(
  input: GeneratePerformanceIndicatorsInput
): Promise<GeneratePerformanceIndicatorsOutput> {
  return generatePerformanceIndicatorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePerformanceIndicatorsPrompt',
  input: {schema: GeneratePerformanceIndicatorsInputSchema},
  output: {schema: GeneratePerformanceIndicatorsOutputSchema},
  prompt: `You are an expert educator specializing in creating performance indicators for academic subjects.

You will generate a set of 4 performance indicators for each of the following performance levels: Bajo (Low), Basico (Basic), Alto (High), and Superior.

The performance indicators should be specific, measurable, achievable, relevant, and time-bound (SMART).

Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}

Output a JSON object with the following structure:
{
  "indicators": {
    "bajo": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
    "basico": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
    "alto": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"],
    "superior": ["indicator 1", "indicator 2", "indicator 3", "indicator 4"]
  }
}
`,
});

const generatePerformanceIndicatorsFlow = ai.defineFlow(
  {
    name: 'generatePerformanceIndicatorsFlow',
    inputSchema: GeneratePerformanceIndicatorsInputSchema,
    outputSchema: GeneratePerformanceIndicatorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
