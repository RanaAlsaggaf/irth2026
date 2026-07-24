// Parse, validate, and normalize the raw AI analysis response.
export function normalizeAnalysisResult(text) {
  try {
    // Reject empty model responses.
    if (!text) {
      throw new Error("Empty response");
    }

    // Remove surrounding whitespace from the response.
    let cleaned = text.trim();

    // Remove optional Markdown code block markers.
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");

    // Locate the first and last JSON object braces.
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    // Extract only the JSON object when extra text surrounds it.
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    // Convert the cleaned JSON string into a JavaScript object.
    const parsed = JSON.parse(cleaned);

    // Safely retrieve the main text fields from the model response.
    const summary = safeString(parsed.summary, "");
    const detectedStyle = safeString(parsed.detected_style, "غير معروف");

    // Ensure findings and recommendations are always arrays.
    const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [];

    // Combine all generated text to detect non-architectural responses.
    const combinedText = [
      summary,
      detectedStyle,
      ...findings,
      ...recommendations,
    ]
      .join(" ")
      .toLowerCase();

    // Keywords indicating that the uploaded file is not architecturally analyzable.
    const nonArchitecturalKeywords = [
      "ليست تصميم مبنى",
      "ليس تصميم مبنى",
      "ليست واجهة مبنى",
      "ليس واجهة مبنى",
      "لا تمثل تصميم مبنى",
      "لا يمثل تصميم مبنى",
      "لا تمثل مبنى",
      "لا يمثل مبنى",
      "لا تحتوي على مبنى",
      "لا يحتوي على مبنى",
      "لا تحتوي على واجهة",
      "لا يحتوي على واجهة",
      "لا تحتوي على عناصر معمارية",
      "لا يحتوي على عناصر معمارية",
      "غير معمارية",
      "غير معماري",
      "غير قابل للتحليل",
      "لا يمكن إجراء تحليل معماري",
      "لا يمكن تحليلها معماري",
      "شخصية كرتونية",
      "رسم شخصية",
      "رسمة شخصية",
      "شعار",
      "أشكال هندسية",
      "مجردة",
    ];

    // Check whether any non-architectural keyword appears in the response.
    const modelSaysNotAnalyzable = nonArchitecturalKeywords.some((keyword) =>
      combinedText.includes(keyword.toLowerCase())
    );

    // Use the model's explicit value when available.
    // Otherwise, infer analyzability from the generated text.
    let isAnalyzable =
      typeof parsed.is_analyzable === "boolean"
        ? parsed.is_analyzable
        : !modelSaysNotAnalyzable;

    // Convert the compliance score into a numeric value.
    let complianceScore = Number(parsed.complianceScore);

    // Apply a fallback score when the model returns an invalid value.
    if (!Number.isFinite(complianceScore)) {
      complianceScore = isAnalyzable ? 50 : 0;
    }

    // Restrict the compliance score to the valid 0–100 range.
    complianceScore = Math.round(Math.max(0, Math.min(100, complianceScore)));

    // Force non-architectural uploads to receive a zero compliance score.
    if (!isAnalyzable || modelSaysNotAnalyzable) {
      isAnalyzable = false;
      complianceScore = 0;
    }

    // Return a consistent and validated analysis result.
    return {
      is_analyzable: isAnalyzable,

      // Use the model summary or provide a context-aware fallback.
      summary:
        summary ||
        (isAnalyzable
          ? "تم تحليل التصميم بنجاح."
          : "الملف المرفوع لا يحتوي على تصميم معماري واضح يمكن تحليله."),

      // Hide the detected style when the file is not analyzable.
      detected_style: isAnalyzable ? detectedStyle : "غير قابل للتحليل",

      // Accept the region match value only for analyzable files.
      matches_region:
        isAnalyzable && typeof parsed.matches_region === "boolean"
          ? parsed.matches_region
          : false,

      // Restrict confidence to the valid 0–1 range.
      confidence:
        isAnalyzable && typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,

      // Return the normalized compliance score.
      complianceScore,

      // Use the model findings or provide a suitable fallback list.
      findings:
        findings.length > 0
          ? findings
          : isAnalyzable
          ? ["لم يتم إرجاع ملاحظات تفصيلية من النموذج."]
          : ["الملف لا يحتوي على عناصر معمارية واضحة قابلة للتحليل."],

      // Use the model recommendations or provide a suitable fallback list.
      recommendations:
        recommendations.length > 0
          ? recommendations
          : isAnalyzable
          ? ["يرجى مراجعة تفاصيل التحليل قبل اعتماد النتيجة."]
          : ["يرجى رفع صورة واضحة لمبنى أو واجهة معمارية للمنطقة المحددة."],
    };
  } catch (error) {
    // Return a safe fallback result when JSON parsing or normalization fails.
    return {
      is_analyzable: false,
      summary: "تعذر تنسيق نتيجة التحليل بشكل صحيح.",
      detected_style: "غير قابل للتحليل",
      matches_region: false,
      confidence: 0,
      complianceScore: 0,
      findings: ["تعذر تحويل رد النموذج إلى JSON منظم."],
      recommendations: ["راجع الـ prompt أو أضف parsing أقوى."],
    };
  }
}

// Return a trimmed string or the provided fallback value.
function safeString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}