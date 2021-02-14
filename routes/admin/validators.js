const { check } = require("express-validator");
const usersRepo = require("../../repository/users");

module.exports = {
  requireEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid Email")
    .custom(async (email) => {
      const inUse = await usersRepo.getOneBy({ email });
      if (inUse) {
        throw new Error("Email in use");
      }
    }),
  requirePassword: check("password")
    .trim()
    .isLength({ min: 6, max: 10 })
    .withMessage("Password must be greater than 6 and less than 10"),
  requirePasswordConfirmation: check("passwordConfirmation")
    .trim()
    .isLength({ min: 6, max: 10 })
    .withMessage(
      "Password confirmation must be greater than 6 and less than 10"
    )
    .custom((passwordConfirmation, { req }) => {
      //   console.log(req.body.password !== passwordConfirmation);
      if (req.body.password !== passwordConfirmation) {
        throw new Error("contraseñas no son iguales");
      }
      return true;
    }),
};
