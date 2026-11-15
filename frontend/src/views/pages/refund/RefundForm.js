import {
  Box,
  Button,
  Container,
  FormHelperText,
  FormControl,
  Grid,
  TextField,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import * as yep from "yup";
import PhoneInput from "react-phone-input-2";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";

const useStyles = makeStyles((theme) => ({
  mainSection: {
    marginTop: "2rem",
    padding: "24px",
    borderRadius: "12px",
    background: "#F5F5F5",
  },
  childSection: {
    display: "flex",
    gap: "28px",
    "@media (max-width:700px)": {
      flexDirection: "column-reverse",
    },
    "@media (max-width:450px)": {
      flexDirection: "column-reverse",
    },
  },

  box1: {
    flex: 1,
  },
  box2: {
    flex: 1,
  },

  TextTitle: {
    fontFamily: "Noto Sans",
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
  contactgrid: {
    marginTop: "44px !important",
    "@media (max-width: 920px)": {
      marginTop: "40px !important",
    },
    "@media (max-width: 599px)": {
      marginTop: "30px !important",
    },
  },
  topGapGrid: {
    marginBottom: "1rem !important",
  },
  SubmitBtnBox: {
    textAlign: "center",
    marginTop: "1rem",
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
    fontSize: "14px",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
    marginBottom: "7px !important",
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
      fontSize: "16px !importantx",
      lineHeight: "125% !important",
      fontWeight: "400 !important",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "18px 16px !important",
    },
  },
  TextBoxFormControl: {
    marginTop: "6px",
    border: "1px solid rgb(184, 185, 186, 0.3)",
    borderRadius: "11px",
    "& .MuiOutlinedInput-root": {
      background: "#fff",
      borderRadius: "10px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "18px 16px",
    },
    "& .MuiInputBase-root.Mui-disabled": {
      color: "#000",
    },
  },
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
  textarea1: {
    background: "#fff",
    border: "1px solid #b8b9ba",
    // boxShadow: "0px 3.55482px 3.55482px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    padding: "18px 16px",
    width: "-webkit-fill-available",
    resize: "none",
    color: "#000",
    fontSize: "16px",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    marginTop: "6px",
    "&:focus": {
      outline: "none",
    },
  },
}));
export default function RefundForm() {
  const handleFormSubmit = async (values, resetForm) => {
    setLoader(true);

    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.refundRequest,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          companyEmail: values.companyEmail,
          refundReason: values.refundReason,
          companyName: values.companyName,
          phone: values.phoneNumber.toString(),
        }),
      });

      if (res.status === 200 || res.status === 201) {
        toast.success(
          "Your request has been sent successfully. We will get back to you soon."
        );
        resetForm({ values: "" });
        setLoader(false);
      }
    } catch (error) {
      console.log("ERROR", error);
      setLoader(false);
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Something went wrong please try again later");
      }
    }
  };

  const formInitialSchema = {
    companyName: "",
    companyEmail: "",
    phoneNumber: "",
    refundReason: "",
  };
  const [countryCode, setCountryCode] = useState("");
  const [isloading, setLoader] = useState(false);
  const classes = useStyles();
  return (
    <Container className={classes.mainSection}>
      <Box className={classes.childSection}>
        <Box className={classes.box1}>
          <Formik
            onSubmit={(values, { resetForm }) => {
              handleFormSubmit(values, resetForm);
            }}
            // onSubmit={(values) => handleFormSubmit(values)}
            initialValues={formInitialSchema}
            initialStatus={{
              success: false,
              successMsg: "",
            }}
            validationSchema={yep.object().shape({
              companyName: yep
                .string()
                .required("Please enter your company's name"),
              companyEmail: yep
                .string()
                .required("Please enter your company's email"),
              phoneNumber: yep
                .string()
                .required("Please enter your company's phone number"),
              refundReason: yep
                .string()
                .required("Please enter your refund reason"),
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
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    className={`${classes.firstGrid} ${classes.topGapGrid}`}
                  >
                    <Typography className={classes.Loginlabelall}>
                      Company Name
                    </Typography>
                    <TextField
                      placeholder="Enter Username"
                      type="text"
                      variant="outlined"
                      fullWidth
                      id="inputID"
                      size="small"
                      inputProps={{ maxLength: 256 }}
                      value={values.firstName}
                      name="companyName"
                      className={classes.LoginTextBox}
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
                      }}
                    >
                      {touched.companyName && errors.companyName}
                    </FormHelperText>
                  </Grid>

                  <Grid item xs={12} sm={12} className={classes.topGapGrid}>
                    <Typography className={classes.Loginlabelall}>
                      Phone Number
                    </Typography>

                    <PhoneInput
                      country={"us"}
                      inputStyle={{
                        background: "#fff",
                        width: "-webkit-fill-available",
                        color: "#000",
                        border: "1px solid rgb(184, 185, 186)",
                        padding: "18px 16px",
                        marginTop: "5px",
                        borderRadius: "10px",
                      }}
                      value={values.phoneNumber}
                      error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                      onBlur={handleBlur}
                      onChange={(mobile, e) => {
                        setCountryCode(e.dialCode);
                        setFieldValue("phoneNumber", mobile);
                      }}
                      className={`textFeilds textHeight ${classes.selectedFlag}`}
                      InputProps={{
                        className: classes.TextBox,
                      }}
                    />
                    <FormHelperText
                      error
                      style={{
                        fontSize: "12px",
                        fontFamily: "'Noto Sans', sans-serif",
                      }}
                    >
                      {touched.phoneNumber && errors.phoneNumber}
                    </FormHelperText>
                  </Grid>
                  <Grid item xs={12} sm={12} className={classes.topGapGrid}>
                    <Typography className={classes.Loginlabelall}>
                      Company Email
                    </Typography>
                    <TextField
                      placeholder="Enter Email"
                      type="email"
                      variant="outlined"
                      fullWidth
                      id="inputID"
                      size="small"
                      inputProps={{ maxLength: 256 }}
                      value={values.email}
                      name="companyEmail"
                      className={classes.LoginTextBox}
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
                      }}
                    >
                      {touched.companyEmail && errors.companyEmail}
                    </FormHelperText>
                  </Grid>

                  <Grid item xs={12} className={classes.topGapGrid}>
                    <Typography className={classes.Loginlabelall}>
                      Refund Reason
                    </Typography>
                    <textarea
                      className={classes.textarea1}
                      placeholder="Please Enter Refund Reason"
                      rows={6}
                      cols={50}
                      value={values.refundReason}
                      name="refundReason"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <FormHelperText
                      error
                      style={{
                        fontSize: "12px",
                        fontFamily: "'Noto Sans', sans-serif",
                      }}
                    >
                      {touched.refundReason && errors.refundReason}
                    </FormHelperText>
                    <div>
                      <Typography
                        style={{ float: "right" }}
                        className={classes.Loginlabelall}
                      ></Typography>
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <Box className={classes.SubmitBtnBox} mt={2}>
                      <Button
                        type="submit"
                        fullWidth
                        className={classes.buttonbox}
                        disabled={isloading}
                      >
                        Submit
                        {isloading && <ButtonCircularProgress />}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
        <Box className={classes.box2}>
          <div>
            <img
              src="images/aboutus_first.png"
              alt=""
              style={{ width: "100%" }}
            />
            <div className={classes.newButtonDiv}></div>
          </div>
        </Box>
      </Box>
    </Container>
  );
}
