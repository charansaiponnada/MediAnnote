/* Real open-source medical images from public datasets */

// Chest X-Ray images (from public/medical dir to avoid CORS on canvas)
export const chestXrayImages = [
    "/medical/xray-1.jpg",
    "/medical/xray-2.jpg",
    "/medical/xray-3.jpg",
];

// Retinal OCT images (public domain)
export const retinalOCTImages = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/OCT_macula_normal.png/800px-OCT_macula_normal.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Retina_OCT_scan.png/800px-Retina_OCT_scan.png",
];

// Dermoscopy images (public domain)
export const dermoscopyImages = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Dermatoscopy_of_benign_nevus.jpg/800px-Dermatoscopy_of_benign_nevus.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Melanoma_dermatoscopy.jpg/800px-Melanoma_dermatoscopy.jpg",
];

// Mapping image type to image set
export function getImagesForBatchType(imageType: string): string[] {
    // Return a set of images suitable for the batch type
    switch (imageType.toLowerCase()) {
        case "chest x-ray":
            return chestXrayImages;
        case "retinal oct":
            return retinalOCTImages;
        case "dermoscopy":
            return dermoscopyImages;
        default:
            return chestXrayImages;
    }
}

// Fallback X-ray SVG for when real images fail to load
export const fallbackXraySVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#0a0a0a"/>
  <ellipse cx="320" cy="380" rx="120" ry="180" fill="none" stroke="rgba(180,180,180,0.12)" stroke-width="1.5"/>
  <ellipse cx="480" cy="380" rx="120" ry="180" fill="none" stroke="rgba(180,180,180,0.12)" stroke-width="1.5"/>
  <ellipse cx="380" cy="430" rx="60" ry="80" fill="none" stroke="rgba(180,180,180,0.08)" stroke-width="1"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M200,${240 + i * 40} Q400,${210 + i * 40} 600,${240 + i * 40}" fill="none" stroke="rgba(150,150,150,0.06)" stroke-width="1"/>`).join('')}
  <text x="20" y="30" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="12">Chest X-Ray PA View</text>
  <radialGradient id="g" cx="50%" cy="45%" r="35%"><stop offset="0%" stop-color="rgba(200,200,200,0.04)"/><stop offset="100%" stop-color="rgba(50,50,50,0.01)"/></radialGradient>
  <rect width="800" height="800" fill="url(#g)"/>
</svg>
`)}`;

// Annotation tool types
export type AnnotationTool = "select" | "bbox" | "polygon" | "freehand" | "point" | "eraser";

export const annotationTools: { id: AnnotationTool; label: string; desc: string }[] = [
    { id: "select", label: "Select", desc: "Select and move annotations" },
    { id: "bbox", label: "Bounding Box", desc: "Draw rectangular region" },
    { id: "polygon", label: "Polygon", desc: "Draw multi-point polygon" },
    { id: "freehand", label: "Freehand", desc: "Free-draw contour" },
    { id: "point", label: "Point", desc: "Mark a single point" },
    { id: "eraser", label: "Eraser", desc: "Remove annotations" },
];
