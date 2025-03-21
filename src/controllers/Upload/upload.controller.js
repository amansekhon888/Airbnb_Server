import cloudinary from "../../config/cloudinary.js";
import { catchAsyncErrors } from "../../middleware/catchAsyncErrors.js";
import ErrorHandler from "../../Utils/errorhandler.js";
import ResponseHandler from "../../Utils/resHandler.js";

// Upload single image
export const uploadSingleImage = catchAsyncErrors(async (req, res, next) => {
  console.log("req.body:", req.body);

  try {
    if (!req.file) return next(new ErrorHandler("No file uploaded", 400));

    const folder = req.body.folder || "uploads";
    const oldImagePublicId = req.body.oldImagePublicId; // Get old image public ID from request

    // Remove old image if exists
    if (oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
        console.log("Old image deleted successfully:", oldImagePublicId);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }

    // Upload new image
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    return ResponseHandler.send(
      res,
      "Image uploaded successfully",
      { url: result.secure_url, publicId: result.public_id },
      200
    );
  } catch (error) {
    return next(new ErrorHandler(`${error.message}`, 500));
  }
});


// Upload multiple images
export const uploadMultipleImages = catchAsyncErrors(async (req, res, next) => {
  console.log("req.body:", req.body);
  try {
    if (!Array.isArray(req.files) || req.files.length === 0) {
      return next(new ErrorHandler("No files uploaded", 400));
    }

    const folder = req.body.folder || "uploads"; // Default folder

    const results = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(file.buffer);
          })
      )
    );
    return ResponseHandler.send(
      res,
      "Images uploaded successfully",
      results.map((result) => ({ url: result.secure_url, folder })),
      200
    );
  } catch (error) {
    return next(new ErrorHandler(`${error.message}`, 500));
  }
});
