const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getUserInfo,

} = require('../controllers/authController')
const upload = require('../middleware/uploadmiddleware')

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect , getUserInfo);

router.post("/uploads-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });

    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.fieldname
    }`;
    res.status(200).json({ imageUrl });
});

module.exports = router;

