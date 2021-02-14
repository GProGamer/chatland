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
  res.send(signinTemplate());
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({
    email,
  });

  if (!user) return res.send("YOU HAVE TO SIGN UP FIRST");

  const comparison = await usersRepo.compararContraseñas(
    user.password,
    password
  );
  if (!comparison) {
    return res.send("password incorrect");
  }

  req.session.userId = user.id;

  return res.send(`welcome back ${req.session.userId}`);
});

module.exports = router;
