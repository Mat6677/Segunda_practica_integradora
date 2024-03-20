const { Router } = require("express");
const userModel = require("../models/users");

const sessionRouter = Router();

sessionRouter.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "api/sessions/registerFail",
  }),
  async (req, res) => {
    res.send({ status: "Success", message: "User registered" });
  }
);
sessionRouter.get("/registerFail", (req, res) => {
  res.status(401).send({ status: "error", error: "Authentication error" });
});

sessionRouter.get("/registerFail", (req, res) => {
  res.status(401).send({ status: "error", error: "Authentication error" });
});
sessionRouter.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/api/session/loginFail" }),
  async (req, res) => {
    const user = req.user;
    req.session.user = {
      name: `${user.firts_name}${user.last_name}`,
      email: user.email,
      age: user.age,
    };

    res.send({
      status: "success",
      payload: req.session.user,
      message: "Successfully logged",
    });
  }
);
sessionRouter.get("/loginFail", (req, res) => {
  res.status(401).send({ status: "error", error: "Login fail" });
});

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    req.session.user = {
      name: req.user.first_name,
      email: req.user.email,
      age: req.user.age,
      rol:req.user.rol
    };

    res.redirect("/home");
  }
);

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("There was an error destroying session");
    }
    res.redirect("/login");
  });
});

module.exports = sessionRouter;
