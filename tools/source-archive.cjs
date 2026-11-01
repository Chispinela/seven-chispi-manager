const fs = require("node:fs");
const path = require("node:path");
const Zip = require("adm-zip");
const root = path.resolve(__dirname, ".."),
  zip = new Zip();
for (const folder of ["src", "ui", "assets", "tests", "docs/screenshots"])
  zip.addLocalFolder(path.join(root, folder), folder);
for (const file of [
  "package.json",
  "package-lock.json",
  "README.md",
  "LICENSE",
  ".gitignore",
  "docs/FEATURES.md",
  "docs/EVENTS.md",
  "docs/BRAND.md",
  "docs/VALIDATION.md",
  "docs/SCREENSHOTS.md",
  "docs/RELEASE-1.0.4.md",
  "Open Seven Chispi Manager.cmd",
  "tools/after-pack.cjs",
  "tools/source-archive.cjs",
  "tools/capture-screenshots.cjs",
])
  zip.addLocalFile(
    path.join(root, file),
    path.dirname(file) === "." ? "" : path.dirname(file),
  );
const dest = path.join(
  root,
  require("../package.json").build.directories.output,
  "Seven-Chispi-Manager-Source-" + require("../package.json").version + ".zip",
);
zip.writeZip(dest);
console.log(dest);
