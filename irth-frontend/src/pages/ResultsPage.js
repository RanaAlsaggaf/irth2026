// Import React hooks used for memoized values, DOM references, and component state.
import { useMemo, useRef, useState } from "react";

// Import router hooks used to read navigation state and move between pages.
import { useLocation, useNavigate } from "react-router-dom";

// Import libraries used to capture the report and generate a PDF file.
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Import the shared application header.
import TopBar from "../components/TopBar";

// Import architectural images and decorative assets used on the page.
import NajdImg from "../assets/images/Najd.png";
import JeddahImg from "../assets/images/Jeddah.png";
import MadinahImg from "../assets/images/almadinah.png";
import AbhaImg from "../assets/images/Abha.svg";
import triangle from "../assets/images/triangle.png";
import palm from "../assets/images/tree palm.png";

// Import the Results page stylesheet.
import "../styles/resultsPage.css";

// Map each supported architectural region to its corresponding image.
const CITY_IMAGES = {
  النجدية: NajdImg,
  "الحجازية الساحلية": JeddahImg,
  "المدينة المنورة": MadinahImg,
  "مرتفعات ابها": AbhaImg,
};

// Safely retrieve and parse the most recent analysis result from local storage.
function getStoredAnalysis() {
  try {
    const storedAnalysis =
      localStorage.getItem("analysisResult");

    return storedAnalysis
      ? JSON.parse(storedAnalysis)
      : null;
  } catch (error) {
    console.error(
      "Unable to read stored analysis:",
      error
    );

    return null;
  }
}

// Format the report date and time using the Saudi Arabic locale.
function formatReportDate(value) {
  const date = value
    ? new Date(value)
    : new Date();

  if (Number.isNaN(date.getTime())) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// Convert the confidence value into a readable percentage.
function formatConfidence(value) {
  if (typeof value !== "number") {
    return "غير متوفر";
  }

  const normalizedValue =
    value >= 0 && value <= 1
      ? value * 100
      : value;

  return `${Math.round(normalizedValue)}%`;
}

// Build a safe and consistent PDF filename from the report identifier.
function createPdfFileName(reportId) {
  const safeReportId = String(
    reportId || Date.now()
  ).replace(/[^a-zA-Z0-9-_]/g, "");

  return `IRTH-Report-${safeReportId}.pdf`;
}

// Render the analysis results page.
export default function ResultsPage() {
  // Initialize route state access and navigation.
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve analysis data from route state or local storage.
  const storedAnalysis =
    getStoredAnalysis();

  const analysisData =
    location.state?.analysisData ||
    storedAnalysis ||
    null;


  // Support both possible API response structures.
  const result =
    analysisData?.result ||
    analysisData?.analysis ||
    {};

  // Determine the selected architectural region from all available sources.
  const selectedCity =
    location.state?.city ||
    analysisData?.input?.region ||
    analysisData?.region ||
    localStorage.getItem("selectedCity") ||
    "المدينة المختارة";

  // Select the matching architectural image or use Najd as a fallback.
  const cityImage =
    CITY_IMAGES[selectedCity?.trim()] ||
    NajdImg;

  // Track the details panel visibility and PDF generation status.
  const [showDetails, setShowDetails] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  // Store references to the details section and hidden PDF report.
  const detailsRef = useRef(null);
  const pdfReportRef = useRef(null);

  // Normalize the compliance score into a rounded numeric value.
  const scoreValue = useMemo(() => {
    if (
      typeof result.complianceScore ===
      "number"
    ) {
      return Math.round(
        result.complianceScore
      );
    }

    return null;
  }, [result.complianceScore]);

  // Format the compliance score for display.
  const percentage = useMemo(() => {
    if (scoreValue === null) {
      return "غير متوفر";
    }

    return `${scoreValue}%`;
  }, [scoreValue]);

  // Generate a concise message based on the compliance score range.
  const shortMessage = useMemo(() => {
    if (scoreValue === null) {
      return "لم يتم العثور على نتيجة تحليل. ارفع تصميمًا للبدء.";
    }

    if (scoreValue >= 80) {
      return `تصميمك متوافق بدرجة عالية مع هوية ${selectedCity} بنسبة ${scoreValue}%.`;
    }

    if (scoreValue >= 50) {
      return `تصميمك متوافق جزئيًا مع هوية ${selectedCity} بنسبة ${scoreValue}%.`;
    }

    return `تصميمك منخفض التوافق مع هوية ${selectedCity} بنسبة ${scoreValue}%، وتوجد ملاحظات موضحة في التقرير.`;
  }, [scoreValue, selectedCity]);

  // Use the API summary when available, otherwise use the generated message.
  const summaryText =
    typeof result.summary === "string" &&
      result.summary.trim()
      ? result.summary
      : shortMessage;

  // Validate the findings list and provide a fallback message.
  const findingsText =
    Array.isArray(result.findings) &&
      result.findings.length > 0
      ? result.findings.filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      )
      : [
        "لا توجد ملاحظات إضافية حاليًا",
      ];

  // Validate the recommendations list and provide a fallback message.
  const recommendationsText =
    Array.isArray(
      result.recommendations
    ) &&
      result.recommendations.length > 0
      ? result.recommendations.filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      )
      : [
        "لا توجد توصيات إضافية حاليًا",
      ];

  // Extract additional report metadata while supporting alternate field names.
  const detectedStyle =
    result.detected_style ||
    result.detectedStyle ||
    "غير متوفر";

  const matchesRegion =
    typeof result.matches_region ===
      "boolean"
      ? result.matches_region
      : result.matchesRegion;

  const matchesRegionText =
    typeof matchesRegion === "boolean"
      ? matchesRegion
        ? "نعم، يتوافق مع المنطقة المختارة"
        : "لا يتوافق بالكامل مع المنطقة المختارة"
      : "غير متوفر";

  const isAnalyzable =
    typeof result.is_analyzable ===
      "boolean"
      ? result.is_analyzable
      : result.isAnalyzable;

  const isAnalyzableText =
    typeof isAnalyzable === "boolean"
      ? isAnalyzable
        ? "نعم"
        : "لا"
      : "غير متوفر";

  const confidenceText =
    formatConfidence(result.confidence);

  const fileName =
    analysisData?.input?.fileName ||
    analysisData?.fileName ||
    analysisData?.report?.fileName ||
    "غير متوفر";

  const reportId =
    analysisData?.report?.reportId ||
    analysisData?.reportId ||
    analysisData?.report?.id ||
    "";

  const createdAt =
    analysisData?.report?.createdAt ||
    analysisData?.createdAt ||
    new Date().toISOString();

  const createdAtText =
    formatReportDate(createdAt);

  // Toggle the detailed results and scroll to them when opened.
  const toggleDetails = () => {
    const openingDetails =
      !showDetails;

    setShowDetails(openingDetails);

    if (openingDetails) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  // Capture the hidden report layout and export it as a multi-page PDF.
  const downloadPdf = async () => {
    if (
      !pdfReportRef.current ||
      !analysisData ||
      isDownloading
    ) {
      return;
    }

    try {
      setIsDownloading(true);

      // Wait for every required Arabic font weight before capturing the report.
      if (document.fonts) {
        await Promise.all([
          document.fonts.load(
            '400 16px "IBM Plex Sans Arabic"'
          ),
          document.fonts.load(
            '500 16px "IBM Plex Sans Arabic"'
          ),
          document.fonts.load(
            '600 16px "IBM Plex Sans Arabic"'
          ),
          document.fonts.load(
            '700 16px "IBM Plex Sans Arabic"'
          ),
        ]);

        await document.fonts.ready;
      }

      // Capture the complete hidden report as a high-resolution canvas.
      const reportElement =
        pdfReportRef.current;

      const canvas = await html2canvas(
        reportElement,
        {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          logging: false,
          scrollX: 0,
          scrollY: 0,

          width:
            reportElement.scrollWidth,

          height:
            reportElement.scrollHeight,

          windowWidth:
            reportElement.scrollWidth,

          windowHeight:
            reportElement.scrollHeight,

          // Make the cloned report visible and enforce the PDF font before capture.
          onclone: (
            clonedDocument
          ) => {
            const clonedReport =
              clonedDocument.querySelector(
                ".pdfReport"
              );

            if (!clonedReport) {
              return;
            }

            clonedReport.style.position =
              "absolute";

            clonedReport.style.top = "0";
            clonedReport.style.left = "0";

            clonedReport.style.zIndex =
              "9999";

            clonedReport.style.visibility =
              "visible";

            clonedReport.style.opacity =
              "1";

            clonedReport.style.transform =
              "none";

            clonedReport.style.direction =
              "rtl";

            clonedReport.style.textAlign =
              "right";

            clonedReport.style.fontFamily =
              '"IBM Plex Sans Arabic", sans-serif';

            clonedReport.style.letterSpacing =
              "0";

            clonedReport.style.wordSpacing =
              "normal";

            clonedReport
              .querySelectorAll("*")
              .forEach((element) => {
                element.style.fontFamily =
                  '"IBM Plex Sans Arabic", sans-serif';

                element.style.letterSpacing =
                  "0";

                element.style.wordSpacing =
                  "normal";
              });
          },
        }
      );

      // Stop PDF generation when the captured canvas is empty.
      if (
        !canvas.width ||
        !canvas.height
      ) {
        throw new Error(
          "تعذر إنشاء صورة التقرير."
        );
      }

      // Create a portrait A4 PDF document.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Calculate the printable page area and the canvas-to-PDF scale.
      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const contentWidth =
        pageWidth - margin * 2;

      const contentHeight =
        pageHeight - margin * 2;

      const pixelsPerMillimeter =
        canvas.width / contentWidth;

      const pageHeightInPixels =
        Math.floor(
          contentHeight *
          pixelsPerMillimeter
        );

      let renderedHeight = 0;
      let pageIndex = 0;

      // Split the captured report into page-sized canvas slices.
      while (
        renderedHeight <
        canvas.height
      ) {
        const remainingHeight =
          canvas.height -
          renderedHeight;

        const sliceHeight = Math.min(
          pageHeightInPixels,
          remainingHeight
        );

        const pageCanvas =
          document.createElement(
            "canvas"
          );

        pageCanvas.width =
          canvas.width;

        pageCanvas.height =
          sliceHeight;

        const pageContext =
          pageCanvas.getContext("2d");

        if (!pageContext) {
          throw new Error(
            "تعذر تجهيز صفحات التقرير."
          );
        }

        pageContext.fillStyle =
          "#ffffff";

        pageContext.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        pageContext.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const pageImage =
          pageCanvas.toDataURL(
            "image/jpeg",
            0.95
          );

        const pageImageHeight =
          (sliceHeight *
            contentWidth) /
          canvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageImage,
          "JPEG",
          margin,
          margin,
          contentWidth,
          pageImageHeight,
          undefined,
          "FAST"
        );

        renderedHeight +=
          sliceHeight;

        pageIndex += 1;
      }

      // Save the generated PDF using the report identifier.
      pdf.save(
        createPdfFileName(reportId)
      );

    // Handle PDF generation failures and restore the button state.
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "تعذر تجهيز تقرير PDF. حدّثي الصفحة ثم حاولي مرة أخرى."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Return the user to the appropriate page for another analysis.
  const openAnotherAnalysis = () => {
    navigate(
      analysisData
        ? "/upload"
        : "/city",
      {
        state: {
          city: selectedCity,
        },
      }
    );
  };

  // Render the visible results interface and hidden printable report.
  return (
    <main
      className="rPage"
      dir="rtl"
      lang="ar"
    >
      {/* Shared application header. */}
      <div className="rTopbar">
        <TopBar />
      </div>

      {/* Main two-column results layout. */}
      <div className="rLayout">
        {/* Score summary and expandable report details. */}
        <div className="rContent">
          {/* Primary result summary card. */}
          <section className="rScoreCard">
            {/* Decorative background gradients. */}
            <div className="rScoreBlob rScoreBlob--a" />
            <div className="rScoreBlob rScoreBlob--b" />

            <div className="rScoreInner">
              <h1 className="rTitle">
                النتائج
              </h1>

              <h2 className="rHeading">
                تمت مقارنة تصميمك مع
                عمارة {selectedCity}
              </h2>

              <p className="rSummaryShort">
                {scoreValue !== null ? (
                  <>
                    <span className="rAccent">
                      {percentage}
                    </span>{" "}
                    {shortMessage
                      .replace(
                        `${scoreValue}%.`,
                        ""
                      )
                      .replace(
                        `${scoreValue}%،`,
                        "،"
                      )}
                  </>
                ) : (
                  shortMessage
                )}
              </p>

              {/* Result actions. */}
              <div className="rActions">
                {analysisData && (
                  <button
                    className="rPrimaryBtn"
                    type="button"
                    onClick={
                      toggleDetails
                    }
                  >
                    {showDetails
                      ? "إخفاء التفاصيل"
                      : "شرح مفصل للنتيجة"}
                  </button>
                )}

                <button
                  className="rSecondaryBtn"
                  type="button"
                  onClick={
                    openAnotherAnalysis
                  }
                >
                  {analysisData
                    ? "تحليل تصميم آخر"
                    : "ابدأ التحليل"}
                </button>
              </div>
            </div>
          </section>

          {/* Detailed findings, recommendations, and PDF download action. */}
          {showDetails &&
            analysisData && (
              <section
                className="rDetails"
                ref={detailsRef}
              >
                <div className="rBlock">
                  <h3 className="rBlockTitle">
                    الملخص
                  </h3>

                  <p className="rBlockText">
                    {summaryText}
                  </p>
                </div>

                <div className="rBlock">
                  <h3 className="rBlockTitle">
                    الملاحظات
                  </h3>

                  <ul className="rList">
                    {findingsText.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={`${item}-${index}`}
                          className="rListItem"
                        >
                          <span className="rListDot" />

                          <span>
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="rBlock">
                  <h3 className="rBlockTitle">
                    التوصيات
                  </h3>

                  <ul className="rList">
                    {recommendationsText.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={`${item}-${index}`}
                          className="rListItem"
                        >
                          <span className="rListDot" />

                          <span>
                            {item}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="rDownloadWrap">
                  <button
                    type="button"
                    className="rDownloadBtn"
                    onClick={
                      downloadPdf
                    }
                    disabled={
                      isDownloading
                    }
                  >
                    {isDownloading
                      ? "جاري تجهيز التقرير..."
                      : "تحميل التقرير PDF"}
                  </button>
                </div>
              </section>
            )}
        </div>

        {/* Architectural image and decorative assets. */}
        <aside
          className={`rImageCol ${
            showDetails
              ? "isExpanded"
              : ""
          }`}
          aria-hidden="true"
        >
          <img
            className="rDecor rDecorTriangle"
            src={triangle}
            alt=""
          />

          <img
            className="rDecor rDecorPalm"
            src={palm}
            alt=""
          />

          <img
            className="rMainImg"
            src={cityImage}
            alt=""
          />
        </aside>
      </div>

      {/* Hidden report layout used only during PDF generation. */}
      {analysisData && (
        <PdfReport
          reportRef={pdfReportRef}
          selectedCity={selectedCity}
          percentage={percentage}
          detectedStyle={
            detectedStyle
          }
          matchesRegionText={
            matchesRegionText
          }
          isAnalyzableText={
            isAnalyzableText
          }
          confidenceText={
            confidenceText
          }
          fileName={fileName}
          reportId={reportId}
          createdAtText={
            createdAtText
          }
          summaryText={summaryText}
          findingsText={
            findingsText
          }
          recommendationsText={
            recommendationsText
          }
        />
      )}
    </main>
  );
}

// Render the structured report that is captured for PDF export.
function PdfReport({
  reportRef,
  selectedCity,
  percentage,
  detectedStyle,
  matchesRegionText,
  isAnalyzableText,
  confidenceText,
  fileName,
  reportId,
  createdAtText,
  summaryText,
  findingsText,
  recommendationsText,
}) {
  return (
    <article
      ref={reportRef}
      className="pdfReport"
      dir="rtl"
      lang="ar"
      aria-hidden="true"
    >
      {/* Report branding header. */}
      <header className="pdfReportHeader">
        <div className="pdfBrandGroup">
          <div className="pdfBrand">
            إرث
          </div>

          <div className="pdfBrandSubtitle">
            منصة تحليل الهوية
            المعمارية السعودية
          </div>
        </div>
      </header>

      <div className="pdfDivider" />

      {/* Report title and selected region description. */}
      <section className="pdfTitleSection">
        <h1 className="pdfTitle">
          تقرير تحليل التصميم المعماري
        </h1>

        <p className="pdfSubtitle">
          تم تحليل التصميم ومقارنته
          مع الخصائص المعمارية الخاصة
          بمنطقة {selectedCity}.
        </p>
      </section>

      {/* Main compliance score. */}
      <section className="pdfScoreBox">
        <div className="pdfScoreLabel">
          نسبة التوافق
        </div>

        <div className="pdfScoreValue">
          {percentage}
        </div>

        <div className="pdfScoreDescription">
          مستوى توافق التصميم مع
          الهوية المعمارية المختارة
        </div>
      </section>

      {/* Analysis metadata grid. */}
      <section className="pdfInfoGrid">
        <PdfInfoItem
          label="المنطقة المعمارية"
          value={selectedCity}
        />

        <PdfInfoItem
          label="الطراز المكتشف"
          value={detectedStyle}
        />

        <PdfInfoItem
          label="مطابقة المنطقة"
          value={
            matchesRegionText
          }
        />

        <PdfInfoItem
          label="نسبة الثقة"
          value={confidenceText}
        />

        <PdfInfoItem
          label="قابل للتحليل معماريًا"
          value={
            isAnalyzableText
          }
        />

        <PdfInfoItem
          label="اسم الملف"
          value={fileName}
        />
      </section>

      {/* Analysis summary. */}
      <PdfSection title="ملخص التحليل">
        <p className="pdfParagraph">
          {summaryText}
        </p>
      </PdfSection>

      {/* Detected findings. */}
      <PdfSection title="الملاحظات">
        <ul className="pdfList">
          {findingsText.map(
            (item, index) => (
              <li
                key={`${item}-${index}`}
                className="pdfListItem"
              >
                <span className="pdfBullet">
                  •
                </span>

                <span>{item}</span>
              </li>
            )
          )}
        </ul>
      </PdfSection>

      {/* Improvement recommendations. */}
      <PdfSection title="التوصيات">
        <ul className="pdfList">
          {recommendationsText.map(
            (item, index) => (
              <li
                key={`${item}-${index}`}
                className="pdfListItem"
              >
                <span className="pdfBullet">
                  •
                </span>

                <span>{item}</span>
              </li>
            )
          )}
        </ul>
      </PdfSection>

      {/* Report identifier and creation date. */}
      <footer className="pdfFooter">
        <div>
          رقم التقرير:{" "}
          {reportId || "غير متوفر"}
        </div>

        <div>
          تاريخ إنشاء التقرير:{" "}
          {createdAtText}
        </div>
      </footer>
    </article>
  );
}

// Render one label-and-value item inside the PDF metadata grid.
function PdfInfoItem({
  label,
  value,
}) {
  return (
    <div className="pdfInfoItem">
      <div className="pdfInfoLabel">
        {label}
      </div>

      <div className="pdfInfoValue">
        {value || "غير متوفر"}
      </div>
    </div>
  );
}

// Render a reusable titled section inside the PDF report.
function PdfSection({
  title,
  children,
}) {
  return (
    <section className="pdfSection">
      <h2 className="pdfSectionTitle">
        {title}
      </h2>

      <div className="pdfSectionContent">
        {children}
      </div>
    </section>
  );
}