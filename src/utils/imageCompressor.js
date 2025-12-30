import imageCompression from "browser-image-compression";

/**
 * Compresses an image file before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Max file size in MB (default: 0.5)
 * @param {number} options.maxWidthOrHeight - Max dimension in pixels (default: 1024)
 * @param {string} options.fileType - Output file type (default: "image/jpeg")
 * @returns {Promise<File>} - Compressed file
 */
export async function compressImage(file, options = {}) {
  const defaultOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    fileType: "image/jpeg",
    useWebWorker: true,
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    const compressedBlob = await imageCompression(file, compressionOptions);

    const originalName = file.name || "image";
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const newFileName = `${baseName}.jpg`;

    const compressedFile = new File([compressedBlob], newFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    console.log(
      `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`
    );
    return compressedFile;
  } catch (err) {
    console.error("Error compressing image:", err);
    return file;
  }
}
