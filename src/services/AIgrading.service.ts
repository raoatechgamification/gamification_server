import axios from 'axios';

interface AIGradingResult {
  score: number;
  feedback: string;
  error?: string;
}

export class AIGradingService {
  static async gradeSubmission(
    submissionText: string,
    expectedAnswer: string,
    keywords: string[],
    maxScore: number
  ): Promise<AIGradingResult> {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
        prompt: `Compare the following submission to the expected answer and grade it. \n\n Submission: ${submissionText}\n\n Expected Answer: ${expectedAnswer}\n\n Keywords: ${keywords.join(", ")}`,
        max_tokens: 100,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      const aiScore = calculateAIScore(response.data, keywords, maxScore);
      
      return {
        score: aiScore,
        feedback: response.data.feedback || 'AI Grading Completed',
      };
    } catch (error) {
      console.error("AI Grading Error:", error);
      return { score: 0, feedback: "", error: "Failed to grade submission using AI" };
    }
  }
}

function calculateAIScore(aiResponse: any, keywords: string[], maxScore: number): number {
  let score = 0;

  if (aiResponse.keywordsMatched) {
    score += (keywords.length ? (aiResponse.keywordsMatched / keywords.length) * maxScore : maxScore);
  }

  return score > maxScore ? maxScore : score;
}
