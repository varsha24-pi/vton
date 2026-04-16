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
      const res = await fetch("http://localhost:8000/try-on", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      setResultUrl(data.result_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>✨ AI Virtual Try-On</h1>
        <p>Upload your photo + any outfit to see how it looks on you</p>
      </header>

      <div className="upload-row">
        <UploadCard
          label="📸 Your Photo"
          hint="Clear, front-facing photo"
          preview={personPreview}
          onChange={(e) => handleFileChange(e, "person")}
        />
        <div className="arrow">→</div>
        <UploadCard
          label="👗 The Outfit"
          hint="Flat-lay or product photo"
          preview={garmentPreview}
          onChange={(e) => handleFileChange(e, "garment")}
        />
        <div className="arrow">→</div>
        <ResultCard loading={loading} resultUrl={resultUrl} />
      </div>

      {error && <p className="error">{error}</p>}

      <button
        className="btn"
        onClick={handleTryOn}
        disabled={loading || !personFile || !garmentFile}
      >
        {loading ? "⏳ AI is working... (may take ~60s)" : "Try It On ✨"}
      </button>

      {loading && (
        <p className="queue-note">
          You may be in a queue on Hugging Face's free servers — please wait!
        </p>
      )}
    </div>
  );
}

function UploadCard({ label, hint, preview, onChange }) {
  return (
    <div className="card upload-card">
      <h3>{label}</h3>
      <p className="hint">{hint}</p>
      <label className="upload-label">
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="upload-placeholder">Click to upload</div>
        )}
        <input type="file" accept="image/*" onChange={onChange} hidden />
      </label>
    </div>
  );
}

function ResultCard({ loading, resultUrl }) {
  return (
    <div className="card result-card">
      <h3>🪄 Result</h3>
      {loading && <div className="spinner" />}
      {resultUrl && <img src={resultUrl} alt="Try-on result" className="preview-img" />}
      {!loading && !resultUrl && (
        <div className="upload-placeholder muted">Result appears here</div>
      )}
    </div>
  );
}