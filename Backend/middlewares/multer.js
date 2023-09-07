const multer = require("multer");

const storage = multer.diskStorage({
  destination: String(process.env.IMAGES_FOLDER),
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase() + Date.now() + ".jpg";
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = upload;
