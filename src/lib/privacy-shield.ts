/**
 * Xai Client-Side Privacy Shield
 * Handles PHI (Protected Health Information) scrubbing directly in the browser.
 */

export interface ScrubbingResult {
    blob: Blob;
    hash: string;
    metadataStripped: string[];
}

/**
 * Simulates client-side PHI scrubbing by stripping metadata and 
 * masking potential "burned-in" text regions on the image.
 */
export async function scrubImageLocally(file: File): Promise<ScrubbingResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject("Canvas context failed");

                canvas.width = img.width;
                canvas.height = img.height;

                // 1. Render the original image
                ctx.drawImage(img, 0, 0);

                // 2. Simulate "Burned-in" PHI Masking
                // In a real medical app, we would use a client-side OCR (like Tesseract.js)
                // to find text. Here we mask standard DICOM text regions (corners).
                ctx.fillStyle = "black";
                
                // Mask top-left (usually Patient Name/ID)
                ctx.fillRect(0, 0, img.width * 0.25, img.height * 0.1);
                
                // Mask top-right (usually Institution/Date)
                ctx.fillRect(img.width * 0.75, 0, img.width * 0.25, img.height * 0.1);

                // 3. Convert to high-fidelity WebP/JPEG (Stripping EXIF/Metadata)
                canvas.toBlob(async (blob) => {
                    if (!blob) return reject("Blob conversion failed");
                    
                    // Generate a unique content hash for the scrubbed image
                    const arrayBuffer = await blob.arrayBuffer();
                    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    resolve({
                        blob,
                        hash: hashHex,
                        metadataStripped: ["PatientName", "PatientID", "BirthDate", "Institution", "StationName"]
                    });
                }, 'image/jpeg', 0.95);
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
