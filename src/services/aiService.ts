import { GoogleGenerativeAI } from "@google/generative-ai";
import { NAV_CATEGORIES } from "@/constants/categories";

// This service handles interactions with AI APIs for content generation
// Supports Google Gemini (via SDK) + Tavily Search (for real-time research)

export interface AIContentRequest {
  topic: string;
  type: 'blog-post' | 'outline' | 'improve';
  geminiApiKey?: string;
  tavilyApiKey?: string;
}

export interface AIResponse {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  subCategory?: string;
  sources?: string[]; // To display where the info came from
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

// Step 1: Search using Tavily
const performResearch = async (topic: string, apiKey: string): Promise<SearchResult[]> => {
  console.log(`Researching "${topic}" with Tavily...`);
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `latest news and detailed facts about ${topic}`,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5
      }),
    });

    if (!response.ok) {
      console.warn("Tavily Search failed, proceeding without research.");
      return [];
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content
    }));
  } catch (error) {
    console.error("Tavily Error:", error);
    return [];
  }
};

export const aiService = {
  generateArticle: async (request: AIContentRequest): Promise<AIResponse> => {
    // If no Gemini key, throw error
    if (!request.geminiApiKey) {
      throw new Error("Gemini API key is required for AI content generation.");
    }

    try {
      // Step 1: Research (if Tavily key is present)
      let researchContext = "";
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let sources: string[] = [];

      if (request.tavilyApiKey) {
        const searchResults = await performResearch(request.topic, request.tavilyApiKey);
        if (searchResults.length > 0) {
          researchContext = `
Here is the latest research on the topic from trusted sources:
${searchResults.map((r, i) => `Source ${i+1}: [${r.title}](${r.url})\nSummary: ${r.content}`).join("\n\n")}

Use this information to ensure the blog post is up-to-date and factual.
IMPORTANT: You are a ghostwriter.
1. Do NOT use inline citations like [1], [Source 1], or (Source 1).
2. Do NOT include a "References" or "Sources" section at the end.
3. Incorporate the facts naturally into the narrative.
4. Write it as if it is your own original thought and research.
`;
          sources = searchResults.map(r => r.url);
        }
      }

      // Step 2: Generate Content with Gemini
      const prompt = `
        Act as a professional tech blog writer. Follow these instructions to write a concise, engaging, and SEO-optimized blog post: "${request.topic}".
        
        ${researchContext}

        Available Categories and Subcategories:
        ${JSON.stringify(NAV_CATEGORIES.map(c => ({ category: c.name, subcategories: c.subcategories })))}

        Structure requirements:
        1. Do NOT include a "Table of Contents".
        2. Use ## for main headings and ### for subheadings.
        3. Include relevant markdown tables where comparing data or listing features helps clarity.
        4. Include image placeholders like ![Description of image](https://via.placeholder.com/800x400?text=Topic+Image) where visual aids would be helpful.
        5. If the user instructions mention including a YouTube video, use the HTML iframe embed code. Ensure the iframe is responsive (width="100%" height="400") and the entire <iframe> tag is on a single line without line breaks.
        6. Keep the article concise and to the point (around 500-600 words).
        
        Return the response in valid JSON format with the following structure:
        {
          "title": "Catchy Title",
          "excerpt": "Short summary (2-3 sentences)",
          "content": "Full blog post content in Markdown format (HTML is allowed for embeds). Make it concise (around 500-600 words). Do NOT include a Table of Contents. Use ## for headings. Include markdown tables, image placeholders, and YouTube embeds if requested. Ensure HTML tags are on single lines.",
          "tags": ["tag1", "tag2", "tag3"],
          "category": "Select one EXACT category name from the provided list",
          "subCategory": "Select one EXACT subcategory from the provided list that matches the selected category (optional, leave empty if no subcategories exist for the chosen category)"
        }
      `;

      // Initialize Gemini SDK
      const genAI = new GoogleGenerativeAI(request.geminiApiKey);

      // List of models to try in order
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro'
      ];

      let generatedText = "";
      const errors: Error[] = [];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting generation with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          generatedText = response.text();
          
          if (generatedText) {
            console.log(`Successfully generated content with ${modelName}`);
            break;
          }
        } catch (error) {
          console.warn(`Failed to generate with ${modelName}:`, error);
          const err = error instanceof Error ? error : new Error(String(error));
          errors.push(err);
          // Continue to next model
        }
      }

      if (!generatedText) {
        const errorMessages = errors.map(e => e.message).join(' | ');
        console.error("All Gemini models failed. Errors:", errorMessages);
        
        // Check for common issues in the errors
        if (errorMessages.includes("API key")) {
          throw new Error("Invalid Gemini API Key. Please check your .env.local file.");
        }
        
        throw errors[0] || new Error("Failed to generate content with any available Gemini model.");
      }

      // Improved JSON extraction: find the first { and last }
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
      
      try {
        const result = JSON.parse(jsonString);
        
        // Clean up any potential leftover citations in the content
        if (result.content) {
          result.content = result.content
            .replace(/\[\s*Source\s*\d+\s*\]/gi, '') // Remove [Source 1]
            .replace(/\[\s*\d+\s*\]/g, '')           // Remove [1]
            .replace(/\(\s*Source\s*\d+\s*\)/gi, '') // Remove (Source 1)
            .replace(/^##\s*(Sources|References|Citations)[\s\S]*$/gim, '') // Remove Sources section
            .trim();
        }

        return {
          ...result,
          // sources // Sources removed as requested
        };
      } catch (e) {
        console.error("Failed to parse JSON:", jsonString, e);
        throw new Error("Failed to parse AI response. The AI might have returned invalid JSON.");
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  }
};
