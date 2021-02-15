const layout = require("../layout");

const getErrors = (errors, prop) => {
  try {
    return errors.mapped()[prop].msg;
  } catch (err) {
    return "";
  }
};
module.exports = ({ errors }) => {
  return layout({
    contenido: `
      <div>
        <form method=POST>
          <input name="email" placeholder="Email" >
          ${getErrors(errors, "email")}
          <input name="password" placeholder="Password" >
          ${getErrors(errors, "password")}
          <button>Sign in</button>
        </form>
      </div>
      `,
  });
};
