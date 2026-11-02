const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

// Reads the access token from the "Authorization: Bearer <token>" header
function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1] || null;
}

async function authMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const isBlacklisted = await tokenBlackListModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Unauthorized access, token is invalid",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const isBlacklisted = await tokenBlackListModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Unauthorized access, token is invalid",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("+systemUser");
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
};