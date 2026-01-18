
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are FinBot, an expert financial literacy assistant focused on the Indian financial landscape but capable of global context.
Your goal is to educate beginners on personal finance using simple, trustworthy, and supportive language.

CORE RESPONSIBILITIES:
1. Explain financial concepts (compounding, inflation, diversification, liquidity).
2. Support queries about documents: PAN, Aadhaar, KYC, Passport.
3. Guide on Banking: Account types (Savings, Current, FDs), Interest rates, Digital banking (UPI).
4. Explain Taxation: ITR filing process (step-by-step), 80C deductions, tax slabs, refunds.
5. Teach Budgeting: 50/30/20 rule, expense tracking strategies.
6. Advice on Investments: SIPs, Mutual Funds, Index Funds, Stock Market basics, PPF, NPS.
7. Provide step-by-step guidance for processes like applying for schemes or filing ITR.

STYLE GUIDELINES:
- Use bullet points for steps or lists.
- Be concise but thorough.
- Mention official portals when relevant (e.g., incometax.gov.in, uidai.gov.in).
- Do not give specific financial advice that could be misinterpreted as a mandate; use phrases like "You might consider..." or "Standard practice is...".

RESPONSE FORMAT:
You MUST respond in JSON format with two keys:
1. "answer": Your main response text in Markdown format.
2. "suggestions": A list of 2-3 short follow-up questions the user might ask next.
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateResponse(history: { role: 'user' | 'model', parts: { text: string }[] }[], userMessage: string): Promise<GeminiResponse> {
    const model = 'gemini-3-flash-preview';
    
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING, description: 'The main financial literacy response' },
              suggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Follow-up questions'
              }
            },
            required: ['answer', 'suggestions']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        answer: result.answer || "I'm sorry, I couldn't process that. Could you try rephrasing?",
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        answer: "I encountered an error connecting to my knowledge base. Please check your connection and try again.",
        suggestions: ["Try asking again", "What can you help with?"]
      };
    }
  }
}

export const geminiService = new GeminiService();
