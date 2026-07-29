const Tesseract = require("tesseract.js");

async function runOcrTesseractJs(filePath) {
    const { data } = await Tesseract.recognize(filePath, "eng");
    return data.text;
}

module.exports = { runOcrTesseractJs };
