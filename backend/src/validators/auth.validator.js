import { body } from "express-validator";

export const registerValidator = [
  body("fullName").notEmpty().withMessage("Full name is required"),

  body("username")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email").isEmail().withMessage("Invalid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];
