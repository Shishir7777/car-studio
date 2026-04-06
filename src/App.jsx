import React, { useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);

  const [bg, setBg] = useState("studio");
  const [bgColor, setBgColor] = useState("#eaeaea");
  const [carImage, setCarImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleImageUpload(file) {
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://127.0.0.1:5000/remove-bg", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    img.onload = () => {
      setCarImage(img);
      draw(img);
      setLoading(false);
    };
  }

  function draw(img = carImage) {
    if (!img) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    // background
    if (bg === "studio") ctx.fillStyle = "#f2f2f2";
    if (bg === "dark") ctx.fillStyle = "#111";
    if (bg === "sky") ctx.fillStyle = "#bcdcff";
    if (bg === "custom") ctx.fillStyle = bgColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // car (transparent png)
    ctx.drawImage(img, 0, 0);
  }

  function download() {
    const a = document.createElement("a");
    a.download = "car-studio.png";
    a.href = canvasRef.current.toDataURL();
    a.click();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚗 AI Car Studio</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files[0])}
      />

      <div style={{ marginTop: 10 }}>
        <select value={bg} onChange={(e) => setBg(e.target.value)}>
          <option value="studio">Studio</option>
          <option value="dark">Dark</option>
          <option value="sky">Sky</option>
          <option value="custom">Custom</option>
        </select>

        {bg === "custom" && (
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        )}

        <button onClick={() => draw()} disabled={!carImage} style={{ marginLeft: 8 }}>
          Apply
        </button>

        <button onClick={download} disabled={!carImage} style={{ marginLeft: 8 }}>
          Download
        </button>
      </div>

      {loading && <p>Processing image...</p>}

      <br />

      <canvas ref={canvasRef} style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
    </div>
  );
}
