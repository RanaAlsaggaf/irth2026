// Import dotenv to load environment variables from the backend .env file.
import dotenv from "dotenv";

// Import path utilities for building the environment file path.
import path from "path";

// Import fileURLToPath to recreate __filename in ES modules.
import { fileURLToPath } from "url";

// Import the Google Gemini SDK.
import { GoogleGenAI } from "@google/genai";

// Import a helper that checks whether the uploaded file is a PDF.
import { isPdfFile } from "../utils/fileHelpers.js";

// Import a helper that validates and normalizes the AI response.
import { normalizeAnalysisResult } from "../utils/analysisNormalizer.js";

// Recreate the current file path in the ES module environment.
const __filename = fileURLToPath(import.meta.url);

// Retrieve the directory containing this service file.
const __dirname = path.dirname(__filename);

// Load environment variables from the backend .env file.
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// Log the environment file path for debugging.
console.log("ENV PATH:", path.join(__dirname, "../.env"));

// Confirm whether the Gemini API key was loaded without exposing its value.
console.log(
  "GEMINI KEY LOADED:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

// Display an error during startup when the Gemini API key is missing.
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "GEMINI_API_KEY is missing. Add it inside backend/.env"
  );
}

// Initialize the Gemini client using the configured API key.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Define the maximum number of Gemini generation attempts.
const MAX_ATTEMPTS = 4;

// Define the delay applied before each retry attempt.
const RETRY_DELAYS = [2000, 5000, 10000];

// Pause execution for the specified number of milliseconds.
function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// Determine whether an error is temporary and can be retried.
function isTemporaryGeminiError(error) {
  // Extract the most useful error message from different response structures.
  const errorMessage =
    error?.message ||
    error?.error?.message ||
    JSON.stringify(error);

  // Check common status codes and messages for temporary Gemini failures.
  return (
    error?.status === 503 ||
    error?.code === 503 ||
    error?.code === "UNAVAILABLE" ||
    error?.error?.code === 503 ||
    error?.error?.status === "UNAVAILABLE" ||
    errorMessage.includes("503") ||
    errorMessage.toLowerCase().includes("high demand") ||
    errorMessage.toLowerCase().includes("unavailable") ||
    errorMessage
      .toLowerCase()
      .includes("currently experiencing high demand")
  );
}

// Determine whether an error was caused by an exhausted API quota.
function isQuotaError(error) {
  // Extract the most useful error message from different response structures.
  const errorMessage =
    error?.message ||
    error?.error?.message ||
    JSON.stringify(error);

  // Check common status codes and messages related to quota limits.
  return (
    error?.status === 429 ||
    error?.code === 429 ||
    error?.code === "RESOURCE_EXHAUSTED" ||
    error?.code === "insufficient_quota" ||
    error?.error?.code === 429 ||
    error?.error?.status === "RESOURCE_EXHAUSTED" ||
    errorMessage.toLowerCase().includes("quota") ||
    errorMessage.toLowerCase().includes("resource exhausted")
  );
}

// Send a generation request to Gemini and retry temporary failures.
async function generateContentWithRetry(requestConfig) {
  // Store the latest error in case all attempts fail.
  let lastError;

  // Attempt the request until it succeeds or reaches the maximum attempts.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      console.log(
        `GEMINI GENERATION ATTEMPT: ${attempt}/${MAX_ATTEMPTS}`
      );

      // Send the content generation request to Gemini.
      const response = await ai.models.generateContent(
        requestConfig
      );

      return response;
    } catch (error) {
      // Preserve the current error for the final failure state.
      lastError = error;

      console.error(
        `GEMINI ATTEMPT ${attempt} FAILED:`,
        error?.message || error
      );

      // Retry only temporary errors when more attempts are available.
      const shouldRetry =
        isTemporaryGeminiError(error) &&
        attempt < MAX_ATTEMPTS;

      if (!shouldRetry) {
        throw error;
      }

      // Select the delay for the current retry attempt.
      const delay =
        RETRY_DELAYS[attempt - 1] ||
        RETRY_DELAYS[RETRY_DELAYS.length - 1];

      console.log(
        `GEMINI IS BUSY. RETRYING AFTER ${
          delay / 1000
        } SECONDS...`
      );

      // Wait before sending the next request.
      await sleep(delay);
    }
  }

  // Throw the latest error if every retry attempt fails.
  throw lastError;
}

// Define the architectural analysis rules and required JSON structure.
const SYSTEM_INSTRUCTIONS = `
أنت مساعد متخصص في تحليل واجهات وتصاميم المباني حسب الهوية المعمارية السعودية.

قبل حساب النسبة، يجب أن تحدد هل الملف قابل للتحليل معماريًا أم لا.

الملف قابل للتحليل فقط إذا كان يحتوي على:
- مبنى حقيقي
- واجهة مبنى
- مخطط معماري
- تصميم معماري
- نموذج واضح لمبنى

الملف غير قابل للتحليل إذا كان يحتوي على:
- شخصية كرتونية
- شعار
- رسمة مجردة
- أشكال هندسية فقط
- صورة لا تحتوي على مبنى أو واجهة
- لقطة شاشة غير معمارية

قواعد مهمة جدًا:
- إذا الملف غير قابل للتحليل معماريًا، اجعل is_analyzable = false.
- إذا is_analyzable = false، يجب أن تكون complianceScore = 0.
- لا تعطِ نسبة توافق عالية لأي صورة غير معمارية حتى لو كانت تحتوي على ألوان أو أشكال قريبة من الهوية.
- لا تحسب التوافق إلا بناءً على عناصر معمارية فعلية مثل: الواجهة، الفتحات، الأقواس، المواد، الكتل، النسب، الزخارف، والألوان المعمارية.

أعد JSON فقط.
ممنوع استخدام markdown.
ممنوع استخدام \`\`\`.
ممنوع كتابة أي نص خارج JSON.
كل النصوص يجب أن تكون بالعربية.

أعد النتيجة بهذا الشكل فقط:
{
  "is_analyzable": false,
  "summary": "ملخص قصير وواضح بالعربية",
  "detected_style": "اسم الطراز المكتشف بالعربية أو غير قابل للتحليل",
  "matches_region": false,
  "confidence": 0,
  "complianceScore": 0,
  "findings": ["ملاحظة 1", "ملاحظة 2"],
  "recommendations": ["توصية 1", "توصية 2"]
}
`;

// Upload and analyze a file according to the selected architectural region.
export async function analyzeFileWithRegion({
  region,
  filePath,
  originalName,
  mimeType,
}) {
  try {
    // Stop the analysis when the Gemini API key is unavailable.
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "مفتاح Gemini غير موجود. تأكدي من إضافته داخل ملف backend/.env."
      );
    }

    // Log the incoming analysis information for debugging.
    console.log("START GEMINI ANALYSIS");
    console.log("REGION:", region);
    console.log("FILE PATH:", filePath);
    console.log("FILE NAME:", originalName);
    console.log("MIME TYPE:", mimeType);

    // Upload the design file to Gemini.
    const uploaded = await ai.files.upload({
      file: filePath,
      config: {
        mimeType,
      },
    });

    console.log(
      "FILE UPLOADED TO GEMINI:",
      uploaded.name
    );

    // Wait for Gemini to finish processing uploaded PDF files.
    if (isPdfFile(mimeType)) {
      let fileState = uploaded.state;
      let processingAttempts = 0;
      const maxProcessingAttempts = 60;

      // Check the file status repeatedly until it becomes active.
      while (
        fileState &&
        fileState !== "ACTIVE" &&
        processingAttempts < maxProcessingAttempts
      ) {
        console.log(
          "WAITING FOR FILE TO BECOME ACTIVE. CURRENT STATE:",
          fileState
        );

        // Wait two seconds before checking the file state again.
        await sleep(2000);

        // Retrieve the latest uploaded file status.
        const current = await ai.files.get({
          name: uploaded.name,
        });

        fileState = current.state;
        processingAttempts += 1;

        // Stop immediately when Gemini reports a processing failure.
        if (fileState === "FAILED") {
          throw new Error(
            "فشلت خدمة Gemini في معالجة ملف PDF."
          );
        }
      }

      // Stop when the PDF does not become active within the allowed time.
      if (fileState !== "ACTIVE") {
        throw new Error(
          "استغرقت معالجة ملف PDF وقتًا طويلًا. يرجى إعادة المحاولة."
        );
      }
    }

    // Build the analysis prompt using the selected architectural region.
    const prompt = `
${SYSTEM_INSTRUCTIONS}

المنطقة المختارة: ${region}

حلل الملف المرفوع بناءً على التعليمات.

لا تفترض أنه تصميم مبنى إلا إذا كان واضحًا فعلًا.

إذا لم يكن الملف يحتوي على مبنى أو واجهة أو مخطط معماري واضح:
- is_analyzable = false
- complianceScore = 0

أعد JSON فقط.
`;

    // Send the prompt and uploaded file to the Gemini model.
    const response = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: prompt,
        },
        {
          fileData: {
            mimeType,
            fileUri: uploaded.uri,
          },
        },
      ],
    });

    // Extract the generated text from supported response properties.
    const rawText =
      response?.text ||
      response?.output_text ||
      "";

    console.log("RAW GEMINI RESPONSE:", rawText);

    // Reject empty AI responses before normalization.
    if (!rawText.trim()) {
      throw new Error(
        "لم ترجع خدمة Gemini نتيجة للتحليل. يرجى إعادة المحاولة."
      );
    }

    // Validate and normalize the generated JSON result.
    return normalizeAnalysisResult(rawText);
  } catch (error) {
    // Log the complete service error for backend debugging.
    console.error(
      "GEMINI SERVICE ERROR:",
      error
    );

    // Return a structured fallback result when the API quota is exhausted.
    if (isQuotaError(error)) {
      console.log(
        "Using fallback result because quota exceeded."
      );

      return {
        is_analyzable: false,
        summary:
          "تعذر إجراء التحليل بسبب تجاوز حصة استخدام خدمة الذكاء الاصطناعي.",
        detected_style: "غير قابل للتحليل",
        matches_region: false,
        confidence: 0,
        complianceScore: 0,
        findings: [
          "لم يتم تحليل الملف لأن خدمة الذكاء الاصطناعي أرجعت خطأ متعلقًا بحصة الاستخدام.",
        ],
        recommendations: [
          "يرجى إعادة المحاولة لاحقًا أو مراجعة إعدادات وحصة مفتاح Gemini API.",
        ],
      };
    }

    // Return a user-friendly message when Gemini is temporarily unavailable.
    if (isTemporaryGeminiError(error)) {
      throw new Error(
        "خدمة التحليل مشغولة حاليًا بسبب الضغط على نموذج Gemini. انتظري قليلًا ثم أعيدي المحاولة."
      );
    }

    // Preserve the original error message or use a general fallback message.
    throw new Error(
      error?.message ||
        "حدث خطأ غير متوقع أثناء تحليل الملف."
    );
  }
}