import { GoogleGenAI } from "@google/genai";
import { SubjectSummary } from "../types";

const getGeminiClient = () => {
    // Ideally from process.env, but handling safely if missing
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
        console.warn("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

export const getStudyInsight = async (subjects: SubjectSummary[]): Promise<string> => {
    try {
        const ai = getGeminiClient();
        if (!process.env.API_KEY) return "Please configure your API Key to get AI insights.";

        const subjectData = subjects.map(s => `${s.subject}: ${s.totalMinutes}m`).join(', ');
        const prompt = `
            You are a study productivity coach.
            Here is a student's study time distribution: [${subjectData}].
            Provide a single, short, motivating, and specific sentence of advice or encouragement based on their balance (or lack thereof).
            If the list is empty, tell them to start studying!
            Keep it under 30 words.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Keep up the good work!";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Could not fetch insight at this moment. Keep studying!";
    }
};
