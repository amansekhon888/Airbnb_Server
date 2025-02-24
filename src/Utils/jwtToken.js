// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  // Save token in session as well
  // req.session.token = token;
  console.log(token, "token");

  // options for cookie
  // const options = {
  //   expires: new Date(
  //     Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "None",
  // };
  // .cookie("token", token, options)
  res.status(statusCode).json({
    success: true,
    user,
    token,
  });
};

export default sendToken;
