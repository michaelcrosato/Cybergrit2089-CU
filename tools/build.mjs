import { cp, mkdir, rm, stat } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const f of ["index.html", "style.css", "src", "vendor", "favicon.svg"])
  await cp(f, `dist/${f}`, { recursive: true });
console.log(
  "Built offline-capable static game in dist/ (" +
    (await stat("dist/vendor/engine/my-3d2dge.js")).size +
    " byte engine).",
);
