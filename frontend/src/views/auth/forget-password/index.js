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
import { useNavigate, Link as RouterComponent } from "react-router-dom";
import { Form, Formik } from "formik";
import * as yep from "yup";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { AuthContext } from "src/context/Auth";
import Page from "src/component/Page";
import moment from "moment";

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
    padding: "20px 40px !important",
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
  label: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "24px",
    marginTop: "15px !important",
    marginBottom: "5px !important",
    color: "#D9D9D9",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "12px",
    // },
  },
  rememberMe: {
    "&.MuiTypography-body1": {
      color: "var(--secondary-color, #344054)",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "14px !important",
      fontStyle: "normal",
      fontWeight: "500 !important",
      lineHeight: "20px",
      // [theme.breakpoints.down('md')]: {
      //   fontSize: "13px",
      // },
    },
  },
  Logintextfiled: {
    color: "#fff !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "12px",
    lineHeight: "24px",
    borderRadius: "10px",
    background: "#fff",
  },
  LoginSubTitle: {
    color: "rgba(11, 20, 38, 0.5) !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "16px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "24px !important",
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
  checkedlogin: {
    "&.MuiCheckbox-colorSecondary.Mui-checked": {
      color: "#0B1426 !important",
    },
    "&.MuiCheckbox-root": {
      color: "#0B1426 !important",
    },
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
  Titleforget: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "800 !important",
    fontSize: "42px !important",
    lineHeight: "120% !important",
    color: "#172624 !important",
    textTransform: "uppercase !important",
    marginBottom: "8px !important",
    "@media (max-width: 920px)": {
      fontSize: "32px !important",
      marginBottom: "15px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px",
      marginBottom: "10px",
    },
  },
  SubTitleforget: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    lineHeight: "16px !important",
    color: "#000 !important",
    marginBottom: "12px !important",

    "@media (max-width: 599px)": {
      fontSize: "15px !important",
    },
  },
}));

function Forget(props) {
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const [isloading, setLoader] = useState(false);
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);

  const handleFormSubmit = async (values) => {
    setLoader(true);
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.forgotPassword,
        data: {
          email: values.email,
        },
      });

      if (res.status === 200) {
        if (res.data.message == "OTP sent successfully") {
          setLoader(false);
          setIsSubmit(true);
          auth.setEndtime(moment().add(3, "m").unix());
          toast.success(
            "OTP sent successfully to your registered email address."
          );
          navigate("/verify-otp", {
            state: { email: values.email, type: "Forget" },
          });
        } else {
          toast.error(res.data.message);
          setLoader(false);
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error?.response);
      if (error?.res) {
        toast.error("Emailnot Correct");
      } else {
        toast.error(error?.response?.data?.responseMessage);
      }
    }
  };

  return (
    <>
      <Page title="Forget Password">
        <Grid className="d-flex height100">
          <Box className="loginForm">
            <Box>
              <Grid container direction={"column"}>
                <Grid item className={classes.TopText}>
                  <Typography variant="h2" className={classes.Titleforget}>
                    Forgot Password?
                  </Typography>
                  <Typography variant="h4" className={classes.SubTitleforget}>
                    No worries! Please provide your registered email address.
                  </Typography>
                </Grid>

                <Formik
                  onSubmit={(values) => handleFormSubmit(values)}
                  initialValues={{
                    email: "",
                  }}
                  initialStatus={{
                    success: false,
                    successMsg: "",
                  }}
                  validationSchema={yep.object().shape({
                    email: yep
                      .string()
                      .email("Please enter a valid email.")
                      .required("Please enter your email address.")
                      .matches("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"),
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
                        <label className={classes.Loginlabelall}>Email</label>
                        <TextField
                          placeholder="Please enter an email address."
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          // value={values.email}
                          name="email"
                          className={classes.LoginTextBox}
                          error={Boolean(touched.email && errors.email)}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif !important",
                          }}
                        >
                          {touched.email && errors.email}
                        </FormHelperText>
                      </Grid>

                      <Grid>
                        <Box className={classes.SubmitBtnBox} mt={2}>
                          <Button
                            type="submit"
                            className={classes.buttonbox}
                            disabled={isloading}
                          >
                            Submit
                            {isloading && <ButtonCircularProgress />}
                          </Button>
                        </Box>
                        <Box
                          style={{
                            display: "grid",
                            justifyContent: "center",
                            marginTop: "13px",
                          }}
                        >
                          <Typography classname={classes.dontacctypo}>
                            Back to{" "}
                            <span
                              onClick={() => {
                                navigate("/login");
                              }}
                              style={{
                                cursor: "pointer",
                                fontWeight: "600",
                                color: "#0B1426",
                              }}
                            >
                              Login
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

export default Forget;
