'use server';
/**
 * @fileOverview An AI assistant flow to generate a detailed project description from keywords or an outline.
 *
 * - generateProjectDescription - A function that handles the project description generation process.
 * - GenerateProjectDescriptionInput - The input type for the generateProjectDescription function.
 * - GenerateProjectDescriptionOutput - The return type for the generateProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectDescriptionInputSchema = z
  .object({
    keywords:
      z.string().optional().describe('Comma-separated keywords describing the project.'),
    outline:
      z.string().optional().describe('A short outline or brief description of the project.'),
  })
  .refine(data => data.keywords || data.outline, {
    message: "Either 'keywords' or 'outline' must be provided.",
  });
export type GenerateProjectDescriptionInput = z.infer<
  typeof GenerateProjectDescriptionInputSchema
>;

const GenerateProjectDescriptionOutputSchema = z.object({
  projectDescription:
    z.string().describe('A detailed and structured project description.'),
});
export type GenerateProjectDescriptionOutput = z.infer<
  typeof GenerateProjectDescriptionOutputSchema
>;

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput
): Promise<GenerateProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDescriptionPrompt',
  input: {schema: GenerateProjectDescriptionInputSchema},
  output: {schema: GenerateProjectDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in generating professional, detailed, and structured project descriptions.
Your goal is to elaborate on provided keywords or a short outline to create a comprehensive project overview.
The description should be clear, concise, and articulate, suitable for sharing and showcasing.

Include sections such as:
- Project Title
- Objective
- Key Features
- Technologies Used (if applicable, infer if not explicitly provided)
- Target Audience
- Unique Selling Proposition (USP)

Instructions:
{{#if keywords}}
Based on the following keywords: {{{keywords}}}
{{/if}}
{{#if outline}}
Based on the following outline: {{{outline}}}
{{/if}}

Generate a detailed and structured project description. Ensure it is professional and ready for presentation.`,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: GenerateProjectDescriptionInputSchema,
    outputSchema: GenerateProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
