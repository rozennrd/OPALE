import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/auth.config";


// Étendre l'interface Request pour ajouter userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token = req.headers["x-access-token"] as string;

  if (!token) {
    res.status(403).send({ message: "No token provided!" });
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized pour toi!" });
      return;
    }

    req.userId = (decoded as JwtPayload).id;
    next();
  });
};

const authJwt = { verifyToken };
export default authJwt;
