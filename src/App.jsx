import React, { useRef, useState, useEffect } from "react";

export default function App() {
  const [bg, setBg] = useState("studio");
  const [bgColor, setBgColor] = useState("#eaeaea");
  const [carImages, setCarImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRefs = useRef([]);

  function getBgColor() {
    if (bg === "studio") return "#f2f2f2";
    if (bg === "dark") return "#111";
    if (bg === "sky") return "#bcdcff";
    if (bg === "custom") return bgColor;
  }

  function drawImages(images, bgOverride) {
    images.forEach((img, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = bgOverride || getBgColor();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    });
  }

  useEffect(() => {
    if (carImages.length > 0) {
      drawImages(carImages);
    }
  }, [carImages]);

  async function handleImageUpload(files) {
    setLoading(true);
    const fileArray = Array.from(files);

    const processedImages = await Promise.all(
      fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("https://car-studio-71wv.onrender.com/remove-bg", {
          method: "POST",
          body: formData,
        });

        const blob = await response.blob();
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          img.onload = () => resolve(img);
        });
      })
    );

    setCarImages(processedImages);
    setLoading(false);
  }

  function drawAll() {
    drawImages(carImages);
  }

  async function saveAll() {
    for (let i = 0; i < carImages.length; i++) {
      const canvas = canvasRefs.current[i];
      await new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `car-studio-${i + 1}.png`, { type: "image/png" });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: `Car ${i + 1}` });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `car-studio-${i + 1}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
          resolve();
        }, "image/png");
      });
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚗 AI Car Studio</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImageUpload(e.target.files)}
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

        <button onClick={drawAll} disabled={carImages.length === 0} style={{ marginLeft: 8 }}>
          Apply to All
        </button>

        <button onClick={saveAll} disabled={carImages.length === 0} style={{ marginLeft: 8 }}>
          Save All
        </button>
      </div>

      {loading && <p>Processing images...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
        {carImages.map((_, i) => (
          <canvas
            key={i}
            ref={(el) => (canvasRefs.current[i] = el)}
            style={{ maxWidth: "300px", border: "1px solid #ccc" }}
          />
        ))}
      </div>
    </div>
  );
}