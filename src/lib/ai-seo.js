// src/lib/ai-seo.js

/**
 * Simplified AI-powered SEO optimization service
 */

// Import OpenAI - you'll need to install this package:
// npm install openai
const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Optimize SEO content for a given page
 * @param {Object} contentData - The page content data
 * @param {Object} seoSettings - Current SEO settings
 * @param {Object} aiSettings - AI optimization settings
 * @returns {Promise<Object>} - Optimized SEO data
 */
async function optimizeSeoContent(
  contentData,
  seoSettings = {},
  aiSettings = {}
) {
  try {
    // Extract content and settings
    const {
      title,
      content,
      excerpt,
      slug,
      contentType = "blog_post",
    } = contentData;

    const { targetKeywords = "", geographicFocus = "" } = aiSettings;

    // Create prompt for the AI
    const prompt = `
As an SEO expert for law firms, optimize the following legal content for search engines:

CONTENT TYPE: ${contentType}
GEOGRAPHIC FOCUS: ${geographicFocus || "Not specified"}

CURRENT TITLE: "${title}"

CONTENT PREVIEW:
${content ? content.substring(0, 1500) + (content.length > 1500 ? "..." : "") : "No content provided"}

CURRENT EXCERPT:
${excerpt || "No excerpt provided"}

TARGET KEYWORDS: ${targetKeywords || "Not specified"}

Please provide optimized SEO metadata including:
1. Meta title (max 60 characters)
2. Meta description (max 155 characters)
3. Focus keyword (most important keyword phrase)
4. Content improvement suggestions (2-3 points)
5. Schema markup recommendations

Make the recommendations specific for a law firm website.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use an appropriate model
      messages: [
        {
          role: "system",
          content:
            "You are an expert SEO specialist for law firms with deep knowledge of legal marketing and search engine optimization.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    // Parse the AI response
    const aiResponse = response.choices[0].message.content;

    // Extract recommendations from AI response
    // This is a simple parsing approach - you could make this more robust
    const metaTitle = extractValue(aiResponse, "Meta title", 60);
    const metaDescription = extractValue(aiResponse, "Meta description", 155);
    const focusKeyword = extractValue(aiResponse, "Focus keyword");
    const contentSuggestions = extractList(
      aiResponse,
      "Content improvement suggestions"
    );

    // Calculate a simple optimization score
    const optimizationScore = calculateSimpleScore(
      metaTitle,
      metaDescription,
      focusKeyword
    );

    // Return optimized SEO data
    return {
      metaTitle,
      metaDescription,
      focusKeyword,
      contentSuggestions,
      optimizationScore,
      aiResponse, // Include the full AI response for reference
      lastOptimizationRun: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error optimizing SEO content:", error);
    throw new Error(`Failed to optimize SEO content: ${error.message}`);
  }
}

/**
 * Extract a value from AI response text
 * @param {String} text - AI response text
 * @param {String} label - Label to look for
 * @param {Number} maxLength - Maximum length to extract
 * @returns {String} - Extracted value
 */
function extractValue(text, label, maxLength = 0) {
  const regex = new RegExp(`${label}[:\\s]+(.*?)(?:\\n|$)`, "i");
  const match = text.match(regex);

  if (match && match[1]) {
    const value = match[1].trim();
    return maxLength > 0 ? value.substring(0, maxLength) : value;
  }

  return "";
}

/**
 * Extract a list from AI response text
 * @param {String} text - AI response text
 * @param {String} label - Label to look for
 * @returns {Array} - Extracted list items
 */
function extractList(text, label) {
  const sectionRegex = new RegExp(
    `${label}[:\\s]+((?:.|\\n)*?)(?:\\n\\n|$)`,
    "i"
  );
  const sectionMatch = text.match(sectionRegex);

  if (sectionMatch && sectionMatch[1]) {
    const sectionText = sectionMatch[1].trim();
    // Look for numbered or bullet points
    const listItems = sectionText
      .split(/\n\s*[-*]|\n\s*\d+\.\s*/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return listItems;
  }

  return [];
}

/**
 * Calculate a simple optimization score
 * @param {String} title - Meta title
 * @param {String} description - Meta description
 * @param {String} keyword - Focus keyword
 * @returns {Number} - Score from 0-100
 */
function calculateSimpleScore(title, description, keyword) {
  let score = 50; // Start with base score

  // Title optimization (0-20 points)
  if (title) {
    // Length check (optimal: 50-60 chars)
    if (title.length >= 50 && title.length <= 60) score += 10;
    else if (title.length >= 40 && title.length <= 65) score += 5;

    // Keyword presence check
    if (keyword && title.toLowerCase().includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  // Description optimization (0-20 points)
  if (description) {
    // Length check (optimal: 140-155 chars)
    if (description.length >= 140 && description.length <= 155) score += 10;
    else if (description.length >= 120 && description.length <= 170) score += 5;

    // Keyword presence check
    if (keyword && description.toLowerCase().includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  // Cap score at 100
  return Math.min(Math.round(score), 100);
}

module.exports = {
  optimizeSeoContent,
};
