'use server';

/**
 * @fileOverview A platform summary generation AI agent.
 *
 * - generatePlatformSummary - A function that handles the summary generation process.
 * - GeneratePlatformSummaryInput - The input type for the generatePlatformSummary function.
 * - GeneratePlatformSummaryOutput - The return type for the generatePlatformSummary function.
 */

import {ai} from '@/ai/genkit';
import { Organization } from '@/lib/data';
import {z} from 'genkit';

const GeneratePlatformSummaryInputSchema = z.object({
  organizations: z.custom<Organization[]>(),
});
export type GeneratePlatformSummaryInput = z.infer<typeof GeneratePlatformSummaryInputSchema>;

const GeneratePlatformSummaryOutputSchema = z.object({
  analysis: z.string().describe('A brief, insightful summary of the platform state.'),
});
export type GeneratePlatformSummaryOutput = z.infer<typeof GeneratePlatformSummaryOutputSchema>;

export async function generatePlatformSummary(
  input: GeneratePlatformSummaryInput
): Promise<GeneratePlatformSummaryOutput> {
  return generatePlatformSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlatformSummaryPrompt',
  input: {schema: GeneratePlatformSummaryInputSchema},
  output: {schema: GeneratePlatformSummaryOutputSchema},
  prompt: `You are a business analyst AI for the EduAI platform. Analyze the following JSON data representing all tenant organizations and provide a concise executive summary.

Your summary should highlight:
- Key trends (e.g., user growth, resource consumption).
- Potential risks (e.g., organizations nearing user limits, high number of suspended accounts).
- Actionable insights for the platform's superadministrator.

Keep the summary to 3-4 key bullet points.

Organization Data:
{{{json organizations}}}
`,
});

const generatePlatformSummaryFlow = ai.defineFlow(
  {
    name: 'generatePlatformSummaryFlow',
    inputSchema: GeneratePlatformSummaryInputSchema,
    outputSchema: GeneratePlatformSummaryOutputSchema,
  },
  async input => {
    // Convert complex objects to JSON strings for the prompt
    const promptInput = {
        organizations: JSON.stringify(input.organizations, null, 2)
    };
    const {output} = await prompt(promptInput as any);
    return output!;
  }
);
