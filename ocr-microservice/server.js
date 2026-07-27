const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { runOcrTesseractJs } = require("./ocrEngine");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/ocr", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
    }
    try {
        const raw_text = await runOcrTesseractJs(req.file.path);
        res.json({ engine: "tesseract-js", raw_text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        fs.unlink(req.file.path, () => { });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`OCR microservice running on http://localhost:${PORT}`);
});