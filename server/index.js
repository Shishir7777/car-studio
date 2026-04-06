import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer();
app.use(cors());

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image_file", req.file.buffer, {
      filename: "car.png",
    });
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(text);
    }

    const buffer = await response.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Background removal failed");
  }
});

const PORT = 5000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ Backend running on http://127.0.0.1:${PORT}`);
});
