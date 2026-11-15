import React, { useState, useContext, useEffect } from "react";
import "src/scss/main.css";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Link,
  FormHelperText,
  FormControl,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link as RouterComponent } from "react-router-dom";
import { Form, Formik } from "formik";
import * as yep from "yup";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { AuthContext } from "src/context/Auth";
import Page from "src/component/Page";
import { UserContext } from "src/context/User";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const useStyles = makeStyles((theme) => ({
  buttonbox: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    textAlign: "center !important",
    textTransform: "none !important",
    letterSpacing: "0.2px !important",
    color: "#fff !important",
    lineHeight: "16px !important",
    background: "#172624 !important",
    borderRadius: "6px !important",
    padding: "20px !important",
    textTransform: "uppercase !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "14px",
    // },
    // width: "100%",
    // maxWidth: "350px",
    // height: "50px",
  },
  LoginTextBox: {
    borderRadius: "10px",
    background: " #fff",
    fontSize: "16px",
    color: "black",
    marginTop: "6px",
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.50) !important",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "125%",
    },
    "& .MuiInputBase-input": {
      color: "black !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "16px",
      lineHeight: "125%",
      fontWeight: "400",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "18px 16px !important",
    },
  },
  wrongPassword: {
    borderRadius: "8px",
    border: "1px solid red",
    // background: theme.palette.background.taf,
    height: "55px",
  },

  TopText: {
    display: "grid",
    gap: "24px",
    alignItems: "center",
    "& .innerDiv": {
      display: "inline-grid",
      alignContent: "center",
      justifyItems: "center",
    },
    "& .googleButton": {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      textAlign: "center",
      justifyContent: "center",
      borderRadius: "10px",
      border: "1px solid #D8DADC",
      background: "#FFF",
      padding: "16px",
      width: "-webkit-fill-available",
    },
    "& .dividerCss": {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginBottom: "11px",
    },
    "& .border": {
      width: "100%",
      borderBottom: "1px solid #D8DADC",
      marginBottom: "10px",
    },
  },
  ORText: {
    color: "#000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "18px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "normal !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "15px",
    // },
  },
  linkText: {
    color: "#000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "16px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "16px !important",
    textDecoration: "none !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "14px",
    // },
  },
  SubmitBtnBox: {
    textAlign: "center",
    marginTop: "24px",
    marginBottom: "30px",
  },

  Logintextfiled: {
    color: "#fff !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    fontSize: "12px !important",
    lineHeight: "24px !important",
    borderRadius: "10px !important",
    background: "#fff !important",
  },

  Loginlabelall: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
    marginBottom: "10px !important",
  },

  dontacctypo: {
    color: "#000 !important",
    textAlign: "center !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  formControlBox: {
    display: "grid",
    gap: "22px",
    marginTop: "22px",
    "& .MuiFormControlLabel-root": {},
  },
  checkDiv: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    "& .MuiSvgIcon-root": {
      color: "#172624 !important",
    },
  },
  alreadyAccount: {
    color: "rgba(0, 0, 0, 0.70) !important",
    textAlign: "center !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  newbox: {
    color: "rgba(0, 0, 0)",
    fontWeight: "600",
    textDecoration: "underline",
    cursor: "pointer",
  },
  mainGoogleDiv: {
    // position: "relative",
    width: "-webkit-fill-available !important",
    cursor: "pointer",
  },
  loaderCss: {
    border: "8px solid #172624 ",
    borderTop: "8px solid transparent",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    animation: "$spin 1s linear infinite",
    margin: "auto",
    marginTop: "20px",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

function Signup(props) {
  const auth = useContext(AuthContext);
  const user = useContext(UserContext);
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [isloading, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [Ip, setIP] = useState("");
  const [deviceBrower, setDeviceBowser] = useState("");
  const [isRememberMe, setIsRememberMe] = useState(true);
  const [IsChecked, setIsChecked] = useState(false);
  const [wrongPass, setWrongPass] = useState(false);
  const navigate = useNavigate();

  const formInitialSchema = isRememberMe
    ? {
        email: "",
        password: "",
        check: false,
      }
    : {
        email: window.sessionStorage.getItem("email")
          ? window.sessionStorage.getItem("email")
          : "",
        password: window.localStorage.getItem("password")
          ? window.localStorage.getItem("password")
          : "",
        check: false,
      };
  const sendVerificationLink = async (values) => {
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.verification,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          user_email: values,
        }),
      });

      if (res.status === 200 || res.status === 201) {
        toast.success(
          "You are successfully signup and a verification link has been sent to your registered email address. Please verify it first"
        );
        setLoader(false);
        navigate("/");
      } else {
        toast.warn(res.message);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      if (error?.response?.data) {
        toast.error(error.response?.data);
      } else {
        toast.error("something went wrong please try again later");
      }
    }
  };
  const handleFormSubmit = async (values) => {
    setLoader(true);
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.signup,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      if (res.status === 200 || res.status === 201) {
        toast.success("You are successfully logged in.");
        const email = values?.email;
        const token = res.data.token;
        setLoader(false);
        // user.getViewMyProfile();

        navigate("/company-information", {
          state: { email, token },
        });
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
      // Check for the presence of the 'error' key in the response data
      if (error?.response?.data?.error) {
        const errorMessage = error.response.data.error;
        if (errorMessage === "User with this email already exists.") {
          toast.error(
            "An account with this email already exists. Please log in."
          );
          navigate("/login");
        } else {
          toast.error(errorMessage);
        }
      } else if (error?.response?.data?.errors) {
        // Handling other validation errors if present
        toast.error(error.response.data.errors);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
    //  catch (error) {
    //   console.log(error);
    //   setLoader(false);
    //   if (
    //     error?.response?.data?.email[0] ===
    //     "user with this email already exists."
    //   ) {
    //     toast.error(
    //       "An account with this email already exists. Please log in."
    //     );
    //     navigate("/login");
    //   } else if (error?.response?.data?.email[0]) {
    //     toast.error(error.response?.data?.email[0]);
    //   } else {
    //     toast.error("something went wrong please try again later");
    //   }
    // }
  };
  // useEffect(() => {
  //   const { detect } = require("detect-browser");
  //   const browser = detect();
  //   if (browser) {
  //     setDeviceBowser(browser?.name);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (
  //     window.localStorage.getItem("password") ||
  //     window.sessionStorage.getItem("email")
  //   ) {
  //     setIsRememberMe(true);
  //   } else {
  //     setIsRememberMe(false);
  //   }
  // }, [
  //   window.sessionStorage.getItem("email"),
  //   window.localStorage.getItem("password"),
  // ]);

  function emailOffers() {
    if (!isRememberMe) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }
  const loginWithGoogle = async (token, values) => {
    localStorage.setItem("email", values?.email)
    sessionStorage.setItem("email", values?.email);
    setLoader(true);
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.googlLogin,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          accessToken: token,
          is_login:false
        }),
      });

      if (res.status === 200 || res.status === 201) {
        console.log("signup response", res);
        if (res?.data?.message === "please fill the sign up information") {
          toast.error("please fill the sign up information");
          navigate("/company-information", {
            state: {
              email: values.email,
              token:res?.data?.token
            },
          });
          setLoader(false);
        } else if (res?.data?.message === "user email is not verified") {
          toast.error("user email is not verified");
          setLoader(false);
        } else if (
          res?.data?.message ==
          "Account with this email exists, try another login option."
        ) {
          toast.error(
            "Account with this email exists, try another login option."
          );
          setLoader(false);
        } else {
          toast.success("You are successfully logged in.");
          window.localStorage.setItem("email", values?.email);
          window.localStorage.setItem("token", res.data.token);
          auth.userLogIn(res.data.token, true);
          // user.getViewMyProfile();
          setLoader(false);
          navigate("/add-services");
          user.getViewMyProfile();
        }
      } else {
        toast.warn(res.message);
        setLoader(false);
      }
    } catch (error) {
      console.log(error.response);
      setLoader(false);
      if (
        error.response?.data?.error === "Please fill the sign up information"
      ) {
        toast.error(error.response?.data?.error);
        localStorage.setItem("email", values?.email);
        navigate("/company-information");
      } else if (error.response?.data?.message=== "Account with this email exists, try another login option.") {
        toast.error("Account with this email already exists, please login")
        // const errorMessage = await error.response.json().message; // Parse error response JSON
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Something went wrong please try again later."); // Handle unexpected errors
      }
    }
  };
  const getUserInfo = async (accessToken) => {
    try {
      const response = await Axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
      );
      if (response.status === 200) {
        console.log(response.data);
        loginWithGoogle(accessToken, response.data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  const loginSignup = useGoogleLogin({
    onSuccess: (codeResponse) => {
      getUserInfo(codeResponse.access_token);
      // const decoded = jwtDecode(token);
      // loginWithGoogle(decoded);
    },
    onError: (response) => {
      console.log(response);
    },
  });
  const responseGoogle = (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);
    loginWithGoogle(decoded);
  };
  return (
    <>
      <Page title="signUp">
        <Grid className="d-flex height100">
          <Box className="loginForm">
            <Box>
              <Grid container direction={"column"}>
                <Grid item className={classes.TopText}>
                  <div className="innerDiv">
                    <img
                      src="images/signUpBoard.svg"
                      alt=""
                      style={{
                        mixBlendMode: "multiply",
                        width: "100%",
                        maxWidth: "300px",
                      }}
                    />
                    <div
                      className={classes.mainGoogleDiv}
                      onClick={() => {
                        if (!isloading) {
                          loginSignup();
                        }
                      }}
                    >
                      <div className="googleButton" id="signInButton">
                        <FcGoogle style={{ fontSize: "20px" }} />{" "}
                        <Typography className={classes.ORText}>
                          Continue with Google
                        </Typography>
                      </div>{" "}
                      {isloading && <div className={classes.loaderCss}></div>}
                    </div>
                  </div>
                  <div className="dividerCss">
                    <div className="border"></div>
                    <div>
                      <Typography className={classes.ORText}>OR</Typography>
                    </div>
                    <div className="border"></div>
                  </div>
                </Grid>

                <Formik
                  onSubmit={(values) => handleFormSubmit(values)}
                  initialValues={formInitialSchema}
                  initialStatus={{
                    success: false,
                    successMsg: "",
                  }}
                  validationSchema={yep.object().shape({
                    email: yep
                      .string()
                      .email(
                        "You have entered an invalid email address. Please try again"
                      )
                      .required("Please enter your email address"),
                    password: yep
                      .string()
                      .max(20)
                      .min(8, "Password must be at least 8 characters")
                      .required("Please enter your password")
                      .matches(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
                        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
                      ),
                    check: yep
                      .bool()
                      .oneOf(
                        [true],
                        "Please agree to the terms of the Membership Agreement"
                      ),
                  })}
                >
                  {({
                    errors,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    touched,
                    values,
                    setFieldValue,
                  }) => (
                    <Form>
                      <Grid item style={{ marginTop: "13px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Email
                        </Typography>
                        <TextField
                          placeholder="Email"
                          type="email"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          disabled={isloading}
                          inputProps={{ maxLength: 256 }}
                          value={values.email}
                          name="email"
                          className={classes.LoginTextBox}
                          error={Boolean(touched.email && errors.email)}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                            margin: "0px",
                          }}
                        >
                          {touched.email && errors.email}
                        </FormHelperText>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <FormControl fullWidth>
                          <Box
                            style={{ width: "100%" }}
                            className={classes.loginForm1}
                          >
                            <Typography className={classes.Loginlabelall}>
                              Password
                            </Typography>
                            <TextField
                              placeholder="Password"
                              size="small"
                              variant="outlined"
                              fullWidth
                              id="inputID"
                              disabled={isloading}
                              type={showPassword ? "text" : "password"}
                              value={values.password}
                              inputProps={{ minLength: 8, maxLength: 20 }}
                              name="password"
                              error={Boolean(
                                touched.password && errors.password
                              )}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              onSubmit={handleSubmit}
                              // InputProps={{
                              //   className: classes.Logintextfiled,
                              // }}
                              InputProps={{
                                className:
                                  wrongPass === true
                                    ? classes.wrongPassword
                                    : classes.LoginTextBox,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      edge="end"
                                      size="large"
                                    >
                                      <Box className={classes.passsec}>
                                        {showPassword ? (
                                          <img
                                            src="/images/eye.png"
                                            style={{
                                              fontSize: "20px",
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                            }}
                                          />
                                        ) : (
                                          <img
                                            src="/images/Hide.svg"
                                            style={{
                                              fontSize: "20px",
                                              display: "flex",
                                              justifyContent: "center",
                                              // color: "#1069C2",
                                              alignItems: "center",
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <FormHelperText
                              error
                              style={{
                                fontSize: "12px",
                                fontFamily: "'Noto Sans', sans-serif",
                                margin: "0px",
                              }}
                            >
                              {touched.password && errors.password}
                            </FormHelperText>
                          </Box>
                        </FormControl>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          style={{ marginTop: "6px" }}
                        >
                          <Box pl={1} mt={-1}></Box>
                          <Typography variant="body2">
                            <Link
                              component={RouterComponent}
                              to="/forget-password"
                              className={classes.linkText}
                            >
                              Forgot Password?
                            </Link>
                          </Typography>
                        </Box>
                        <Box className={classes.formControlBox}>
                          <div className={classes.checkDiv}>
                            <Checkbox
                              type="checkbox"
                              name="checkOffer"
                              onChange={emailOffers}
                              value={IsChecked}
                              style={{ width: "20px", height: "20px" }}
                            />
                            <Typography className={classes.alreadyAccount}>
                              I’d like to receive special email offers and
                              discounts.
                            </Typography>
                          </div>
                          <div className={classes.checkDiv}>
                            <Checkbox
                              type="checkbox"
                              name="check"
                              onChange={handleChange}
                              value={values.check}
                              style={{ width: "20px", height: "20px" }}
                            />
                            <Typography className={classes.alreadyAccount}>
                              I agree to the terms of the{" "}
                              <span
                                className={classes.newbox}
                                onClick={() => {
                                  window.open(
                                    "/membership-agreement",
                                    "_blank"
                                  );
                                }}
                              >
                                Membership Agreement{" "}
                              </span>
                            </Typography>
                          </div>
                        </Box>{" "}
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                            margin: "0px",
                          }}
                        >
                          {touched.check && errors.check}
                        </FormHelperText>
                      </Grid>

                      <Grid>
                        <Box className={classes.SubmitBtnBox} mt={2}>
                          <Button
                            type="submit"
                            fullWidth
                            className={classes.buttonbox}
                            disabled={isloading}
                          >
                            Next
                            {isloading && <ButtonCircularProgress />}
                          </Button>
                        </Box>
                        <Box
                          style={{
                            display: "grid",
                            justifyContent: "center",
                          }}
                        >
                          <Typography className={classes.dontacctypo}>
                            Already have an account?{" "}
                            <span
                              onClick={() => {
                                navigate("/login");
                              }}
                              style={{
                                cursor: "pointer",
                                fontWeight: "700",
                                color: "#000",
                              }}
                            >
                              Sign In
                            </span>
                          </Typography>
                        </Box>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Page>
    </>
  );
}

export default Signup;
