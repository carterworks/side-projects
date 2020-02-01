const fs = require("fs");
const hb = require("handlebars");
const path = require("path");
const htmlPdf = require("html-pdf");
const markdownIt = require("markdown-it")();

const outputPath = path.resolve("output");
const htmlPath = path.resolve("templates", "document.html");

function getTemplateFunc(path) {
  const template = fs.readFileSync(path, "utf-8");
  const templateFunc = hb.compile(template);
  return templateFunc;
}

function compile(filePath, data) {
  const markdown = getTemplateFunc(filePath)(data);
  const html = markdownIt.render(markdown);
  const fullHtml = getTemplateFunc(htmlPath)(html);
  const pdfFilePath = path.resolve(outputPath, `${Date.now()}.pdf`);
  return new Promise((res, rej) => {
    htmlPdf
      .create(fullHtml, { format: "Letter" })
      .toFile(pdfFilePath, function(err, result) {
        if (err) return rej(err);
        return res(result); // { filename: '/app/businesscard.pdf' }
      });
  });
}

module.exports = { compile };
