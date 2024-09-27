import express from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

const router = express.Router();
import authRoutes from "./admin.auth.routes";

// router.use("/auth", require("./auth.routes"));
router.use("/auth", authRoutes);

router.use("/", (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Gamificatioon API V1'
  })
});

module.exports = router;
