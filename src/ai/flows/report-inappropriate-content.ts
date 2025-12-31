'use server';

/**
 * @fileOverview Flow for reporting inappropriate content and detecting toxic behavior.
 *
 * - reportInappropriateContent - A function that handles the reporting process.
 * - ReportInappropriateContentInput - The input type for the reportInappropriateContent function.
 * - ReportInappropriateContentOutput - The return type for the reportInappropriateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportInappropriateContentInputSchema = z.object({
  message: z.string().describe('The content of the message being reported.'),
  reporterId: z.string().describe('The ID of the user reporting the message.'),
  reportedUserId: z.string().describe('The ID of the user who sent the message.'),
  chatRoomId: z.string().describe('The ID of the chat room where the message was sent.'),
});
export type ReportInappropriateContentInput = z.infer<typeof ReportInappropriateContentInputSchema>;

const ReportInappropriateContentOutputSchema = z.object({
  isToxic: z.boolean().describe('Whether the message is considered toxic or inappropriate.'),
  reason: z.string().describe('The reason why the message is considered toxic or inappropriate.'),
});
export type ReportInappropriateContentOutput = z.infer<typeof ReportInappropriateContentOutputSchema>;

export async function reportInappropriateContent(
  input: ReportInappropriateContentInput
): Promise<ReportInappropriateContentOutput> {
  return reportInappropriateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportInappropriateContentPrompt',
  input: {schema: ReportInappropriateContentInputSchema},
  output: {schema: ReportInappropriateContentOutputSchema},
  prompt: `You are an AI assistant specializing in detecting toxic behavior in chat messages.
  A user has reported the following message as inappropriate:
  \"{{{message}}}\"
  The message was sent by user {{{reportedUserId}}} in chat room {{{chatRoomId}}}.
  The message was reported by user {{{reporterId}}}.

  Determine if the message is toxic, hateful, or inappropriate. If it is, explain why.
  Return a JSON object with the following format:
  {
    \"isToxic\": true/false,
    \"reason\": \"explanation here\"
  }`,
});

const reportInappropriateContentFlow = ai.defineFlow(
  {
    name: 'reportInappropriateContentFlow',
    inputSchema: ReportInappropriateContentInputSchema,
    outputSchema: ReportInappropriateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
