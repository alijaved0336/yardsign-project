import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Form, Formik } from "formik";
import React, { useState, useContext } from "react";
import * as yep from "yup";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { AuthContext } from "src/context/Auth";
import { UserContext } from "src/context/User";

export default function ChangeEmail({ classes }) {
  const [isloading, setLoader] = useState(false);
  const auth = useContext(AuthContext);
  const user = useContext(UserContext);
  const [showPasswordEmail, setShowPasswordEmail] = useState(false);
  const handleFormSubmit = async (values, resetForm) => {
    setLoader(true);
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_email: values.email,
          current_password: values.password,
          new_email: values.newEmail,
        }),
      };

      const response = await fetch(ApiConfig.changeemail, requestOptions);
      const result = await response.json();
      if (response.status === 200 || response.status === 201) {
        toast.success("Email address changed successfully");
        resetForm({ values: "" });
        setLoader(false);
      } else {
        setLoader(false);
        if (result.message) {
          toast.error(result.message)
        } else {
          toast.error("Something went wrong. Please try again later.");
        }


      }
    } catch (error) {
      console.error("ERROR", error);
      setLoader(false);
      toast.error("Something went wrong. Please try again later.");
    }
  };
  return (
    <Box className="cardCss">
      <Typography className="cardTitle">Change Email ID</Typography>
      <Formik
        onSubmit={(values, { resetForm }) => {
          handleFormSubmit(values, resetForm);
        }}
        initialValues={{
          email: "",
          password: "",
          newEmail: "",
        }}
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
            .required("Please enter your email address.")
            .matches("^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"),
          password: yep.string().required("Please enter your password"),
          newEmail: yep
            .string()
            .email(
              "You have entered an invalid email address. Please try again"
            )
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
          <Form style={{ paddingTop: "16px" }}>
            <Grid container spacing={2} className={classes.formikGridContainer}>
              <Grid item xs={12} className={classes.firstGrid}>
                <Typography className={classes.Loginlabelall}>
                  Current Email Address
                </Typography>
                <TextField
                  placeholder="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  id="inputID"
                  size="small"
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
                  }}
                >
                  {touched.email && errors.email}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} className={classes.firstGrid}>
                <Typography className={classes.Loginlabelall}>
                  New Email Address
                </Typography>
                <TextField
                  placeholder="New Email Address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  id="inputID"
                  size="small"
                  inputProps={{ maxLength: 256 }}
                  value={values.newEmail}
                  name="newEmail"
                  className={classes.LoginTextBox}
                  error={Boolean(touched.newEmail && errors.newEmail)}
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
                  {touched.newEmail && errors.newEmail}
                </FormHelperText>
              </Grid>
              <Grid item xs={12} className={classes.firstGrid}>
                <Typography className={classes.Loginlabelall}>
                  Password
                </Typography>
                <TextField
                  placeholder="Password"
                  size="small"
                  variant="outlined"
                  fullWidth
                  id="inputID"
                  type={showPasswordEmail ? "text" : "password"}
                  value={values.password}
                  inputProps={{ minLength: 8, maxLength: 20 }}
                  name="password"
                  error={Boolean(touched.password && errors.password)}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  // InputProps={{
                  //   className: classes.Logintextfiled,
                  // }}
                  InputProps={{
                    className: classes.LoginTextBox,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPasswordEmail(!showPasswordEmail)
                          }
                          edge="end"
                          size="large"
                        >
                          <Box className={classes.passsec}>
                            {showPasswordEmail ? (
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
                  }}
                >
                  {touched.password && errors.password}
                </FormHelperText>
              </Grid>

              <Grid item xs={12}>
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
  );
}
