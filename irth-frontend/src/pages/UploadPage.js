// Import React hooks used for references, state management, and side effects.
import { useRef, useState, useEffect } from "react";

// Import router hooks used to access navigation state and change routes.
import { useLocation, useNavigate } from "react-router-dom";

// Import the shared top navigation component.
import TopBar from "../components/TopBar";

// Import the stylesheet for the upload page.
import "../styles/uploadPage2.css";

// Import the upload icon and decorative architectural assets.
import cloudIcon from "../assets/images/cloudIcon.png";
import triangle from "../assets/images/triangle.png";
import palm from "../assets/images/tree palm.png";
import leg from "../assets/images/leg.png";

// Render the second step of the architectural analysis workflow.
export default function UploadPage2() {
  // Store the selected file and the current drag/upload states.
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Store references to the hidden file inputs and the main panel.
  const pickRef = useRef(null);
  const replaceRef = useRef(null);
  const panelRef = useRef(null);

  // Scroll the panel into view after a file is selected.
  useEffect(() => {
    if (file && panelRef.current) {
      setTimeout(() => {
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  }, [file]);

  // Read the selected city and initialize route navigation.
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCity =
    location.state?.city || localStorage.getItem("selectedCity") || "";

  // Handle the initial file selection.
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Replace the currently selected file.
  const onReplace = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Remove the selected file.
  const onDelete = () => setFile(null);

  // Activate the drop zone while a file is dragged over it.
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Reset the drag state when the file leaves the drop zone.
  const onDragLeave = () => setIsDragging(false);

  // Accept the first file dropped into the upload area.
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  // Convert the file size into a readable unit.
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload the selected file and request architectural analysis.
  const onUpload = async () => {
    // Prevent the request when either the city or file is missing.
    if (!file || !selectedCity) {
      alert("الرجاء اختيار المدينة ورفع الملف أولًا");
      return;
    }

    try {
      setIsUploading(true);

      // Build the multipart form payload expected by the backend.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("region", selectedCity);

      // Send the design file and selected region to the analysis endpoint.
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      // Parse and validate the server response.
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || "Failed to analyze file.");
      }

      // Store the result locally and continue to the results page.
      localStorage.setItem("analysisResult", JSON.stringify(data));

      navigate("/results", {
        state: { city: selectedCity, analysisData: data },
      });
    } catch (error) {
      // Display an error message when the analysis request fails.
      alert(error.message || "حدث خطأ أثناء تحليل الملف");
    } finally {
      setIsUploading(false);
    }
  };

  // Render the upload page interface.
  return (
    <>
      {/* Display the shared application header. */}
      <TopBar />

      {/* Main upload page content. */}
      <div className="uPage">
        {/* Display the three-step workflow indicator. */}
        <div className="uStepperWrap">
          <div className="sStepper" dir="rtl">
            <StepItem number={1} label="المرحلة 1" done={true} />
            <Track filled={true} />
            <StepItem number={2} label="المرحلة 2" active={true} />
            <Track filled={false} />
            <StepItem number={3} label="النتائج" />
          </div>
        </div>

        {/* Center the upload panel within the page. */}
        <div className="uContainer">
          {/* Main upload panel. */}
          <section className="uPanel" ref={panelRef}>
            {/* Decorative background gradients. */}
            <div className="uBlob uBlob--tr" aria-hidden="true" />
            <div className="uBlob uBlob--bl" aria-hidden="true" />

            {/* Architectural decorative images. */}
            <img className="uDecor uTriangle" src={triangle} alt="" />
            <img className="uDecor uPalm" src={palm} alt="" />
            <img className="uDecor uLeg" src={leg} alt="" />

            {/* Main interactive upload content. */}
            <div className="uContent">
              {/* Page heading and supporting instructions. */}
              <div className="uTitleGroup">
                <span className="uEyebrow">الخطوة الثانية</span>
                <h1 className="uTitle">ارفع تصميم المبنى</h1>
                <p className="uSubtitle">للمراجعة الفورية وتحليل التصميم</p>
              </div>

              {/* Hidden inputs used to select or replace a file. */}
              <input ref={pickRef} className="uHiddenInput" type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={onPick} />
              <input ref={replaceRef} className="uHiddenInput" type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={onReplace} />

              {/* Show the drop zone before selection and file details afterward. */}
              {!file ? (
                <div
                  className={`uDropzone ${isDragging ? "uDropzone--active" : ""}`}
                  onClick={() => pickRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && pickRef.current?.click()}
                  aria-label="ارفع ملف"
                >
                  <div className="uDropInner">
                    <div className="uCloudWrap">
                      <img className="uCloud" src={cloudIcon} alt="" />
                    </div>
                    <p className="uDropMain">اسحب ملفك هنا أو اضغط للاختيار</p>
                    <p className="uDropSub">PDF · PNG · JPG · WEBP</p>
                  </div>
                </div>
              ) : (
                <div className="uFileCard">
                  <div className="uFileIcon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>

                  <div className="uFileInfo">
                    <span className="uFileName">{file.name}</span>
                    <span className="uFileSize">{formatSize(file.size)}</span>
                  </div>

                  <div className="uFileCheck" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Actions used to replace or remove the selected file. */}
              <div className="uMiniActions">
                <button className="uMiniBtn uMiniBtn--replace" type="button"
                  onClick={() => replaceRef.current?.click()}
                  disabled={!file || isUploading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-3.61" />
                  </svg>
                  تبديل
                </button>

                <button className="uMiniBtn uMiniBtn--delete" type="button"
                  onClick={onDelete} disabled={!file || isUploading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  حذف
                </button>
              </div>

              {/* Submit the selected design for analysis. */}
              <button className="uUploadBtn" type="button"
                disabled={!file || !selectedCity || isUploading}
                onClick={onUpload}>
                {isUploading ? (
                  <>
                    <span className="uSpinner" aria-hidden="true" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <span>رفع الملف</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// Render one workflow step and its active or completed state.
function StepItem({ number, label, active, done }) {
  return (
    <div className="sStep">
      <div className={`sCircle ${active ? "isActive" : ""} ${done ? "isDone" : ""}`}>
        {done ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span className="sCircleNum">{number}</span>
        )}
      </div>

      <div className={`sLabel ${active ? "isActiveLabel" : ""}`}>{label}</div>
    </div>
  );
}

// Render the connector displayed between workflow steps.
function Track({ filled }) {
  return (
    <div className="sTrack" aria-hidden="true">
      <div className={`sTrackFill ${filled ? "isFilled" : ""}`} />
    </div>
  );
}