const express = require("express");
const { check, validationResult } = require("express-validator");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
} = require("./validators");

const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const usersRepo = require("../../repository/users");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation],
  async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    const errors = validationResult(req);
    console.log(errors.mapped());

    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req }, errors));
    }

    const user = await usersRepo.crearUsuario({ email, password });
    //store the id into the cookie
    req.session.userId = user.id;
    res.send("Account created");
  }
);

router.get("/signout", (req, res) => {
  req.session = null;

  res.send(`you are a logging out`);
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  "/signin",
  [
    check("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Must be a valid email")
      .custom(async (email) => {
        const user = await usersRepo.getOneBy({ email });
        console.log(user);
        console.log(!user);
        if (!user) {
          throw new Error("You must sign up first");
        }
      }),
    check("password")
      .trim()
      .custom(async (password, { req }) => {
        const user = await usersRepo.getOneBy({ email: req.body.email });

        if (!user) {
          throw new Error("Invalid password");
        }

        const comparacion = await usersRepo.compararContraseñas(
          user.password,
          password
        );

        if (!comparacion) {
          throw new Error("Invalid password");
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    const { email, password } = req.body;
    if (!errors.isEmpty()) {
      return res.send(signinTemplate({ errors }));
    }
    const user = await usersRepo.getOneBy({
      email,
    });

    req.session.userId = user.id;
    return res.send(`welcome back ${req.session.userId}`);
  }
);

module.exports = router;
