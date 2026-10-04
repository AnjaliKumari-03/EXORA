import multer from "multer";

export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message, code: err.code });
  }

  if (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }

  next();
}
