const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");


const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(422).json({
        message: "User already exists with email.",
        status: "failed",
      });
    }

    const user = await userModel.create({ email, password, name });

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });

    // Send the email AFTER responding, and don't let a failure crash the app
    try {
      await emailService.sendRegistrationEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Registration email failed:", emailErr);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Email or password is invalid" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email or password is invalid" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    }); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function refreshTokenController(req, res) {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const isBlacklisted = await tokenBlackListModel.findOne({
      token: oldRefreshToken,
    });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Refresh token is invalid" });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Rotate: blacklist the old refresh token so it can't be reused
    await tokenBlackListModel.create({ token: oldRefreshToken });

    const { accessToken, refreshToken } = generateTokens(decoded.id);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function userLogoutController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    await tokenBlackListModel.create({ token: refreshToken });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
  refreshTokenController,
  userLogoutController,
};