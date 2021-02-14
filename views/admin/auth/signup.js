const layout = require("../layout");

const getErrors = (errors, prop) => {
  try {
    return errors.mapped()[prop].msg;
  } catch (err) {
    return "";
  }
};

module.exports = ({ req }, errors) => {
  return layout({
    contenido: `
    <div>
      ${req.session.userId}
      <form method=POST>
        <input name="email" placeholder="Email" >
        ${getErrors(errors, "email")}
        <input name="password" placeholder="Password" >
        ${getErrors(errors, "password")}
        <input name="passwordConfirmation" placeholder="Password Corfirmation" >
        ${getErrors(errors, "passwordConfirmation")}
        <button>Sign up</button>
      </form>
    </div>
    `,
  });
};
