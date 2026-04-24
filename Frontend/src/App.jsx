import { useState } from "react";
import "./App.css";

export default function App() {
  const [personFile, setPersonFile] = useState(null);
  const [garmentFile, setGarmentFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [garmentPreview, setGarmentPreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "person") {
      setPersonFile(file);
      setPersonPreview(preview);
    } else {
      setGarmentFile(file);
      setGarmentPreview(preview);
    }
  };

  const handleTryOn = async () => {
    if (!personFile || !garmentFile) {
      setError("Please upload both images.");
      return;
    }
    setError(null);
    setLoading(true);
    setResultUrl(null);

    const formData = new FormData();
    formData.append("person_image", personFile);
    formData.append("garment_image", garmentFile);
    formData.append("garment_description", "stylish clothing item");

    try {
      const res = await fetch("https://vton-2dhr.onrender.com/try-on", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      setResultUrl(data.result_url);
    } catch (err) {
      const msg = err.message;
      if (msg.includes("GPU quota") || msg.includes("quota")) {
        setError("GPU quota exceeded on free servers. Please wait a few minutes and try again.");
      } else if (msg.includes("upstream Gradio") || msg.includes("Gradio")) {
        setError("AI server is busy. Please try again in a moment.");
      } else if (msg.includes("fetch") || msg.includes("network")) {
        setError("Cannot connect to backend. Make sure the server is running on port 8000.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <header className="header">
        <div className="header-badge">AI Powered</div>
        <h1 className="title">Virtual <span className="title-accent">Try‑On</span></h1>
        <p className="subtitle">Upload your photo & any outfit — see the magic instantly</p>
      </header>

      <div className="cards-row">
        <UploadCard
          label="Your Photo"
          icon="🧍"
          hint="Front-facing, full body"
          preview={personPreview}
          onChange={(e) => handleFileChange(e, "person")}
          step="01"
        />

        <div className="connector">
          <div className="connector-line" />
          <div className="connector-icon">+</div>
          <div className="connector-line" />
        </div>

        <UploadCard
          label="The Outfit"
          icon="👗"
          hint="Flat-lay or product photo"
          preview={garmentPreview}
          onChange={(e) => handleFileChange(e, "garment")}
          step="02"
        />

        <div className="connector">
          <div className="connector-line" />
          <div className="connector-arrow">→</div>
          <div className="connector-line" />
        </div>

        <ResultCard loading={loading} resultUrl={resultUrl} />
      </div>

      {error && (
        <div className="error-box">
          <span className="error-icon">⚠️</span> {error}
        </div>
      )}

      <button
        className={`btn ${loading ? "btn-loading" : ""}`}
        onClick={handleTryOn}
        disabled={loading || !personFile || !garmentFile}
      >
        {loading ? (
          <>
            <span className="btn-spinner" />
            AI is working…
          </>
        ) : (
          <>
            <span className="btn-icon">✨</span>
            Try It On
          </>
        )}
      </button>

      {loading && (
        <p className="queue-note">
          ⏳ This may take up to 60 seconds on free servers — hang tight!
        </p>
      )}

      <footer className="footer">
        Powered by <strong>Leffa AI</strong> · Hosted on Hugging Face
      </footer>
    </div>
  );
}

function UploadCard({ label, icon, hint, preview, onChange, step }) {
  return (
    <div className="card upload-card">
      <div className="card-step">{step}</div>
      <div className="card-label">
        <span className="card-icon">{icon}</span>
        {label}
      </div>
      <p className="card-hint">{hint}</p>
      <label className="upload-area">
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="upload-placeholder">
            <div className="upload-plus">+</div>
            <span>Click to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} hidden />
      </label>
    </div>
  );
}

function ResultCard({ loading, resultUrl }) {
  return (
    <div className={`card result-card ${resultUrl ? "has-result" : ""}`}>
      <div className="card-step">03</div>
      <div className="card-label">
        <span className="card-icon">🪄</span>
        Result
      </div>
      <div className="upload-area result-area">
        {loading && (
          <div className="loading-state">
            <div className="loading-ring" />
            <span>Generating…</span>
          </div>
        )}
        {resultUrl && (
          <>
            <img src={resultUrl} alt="Try-on result" className="preview-img" />
            <a href={resultUrl} download className="download-btn" target="_blank" rel="noreferrer">
              ↓ Download
            </a>
          </>
        )}
        {!loading && !resultUrl && (
          <div className="upload-placeholder muted">
            <div className="result-placeholder-icon">🖼️</div>
            <span>Result appears here</span>
          </div>
        )}
      </div>
    </div>
  );
}
