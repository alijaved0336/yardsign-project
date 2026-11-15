// import React from 'react';
// import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa6";
import { AuthContext } from "src/context/Auth";
import React, { useContext, useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
  body1: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    fontWeight: "400 !important",
    display:"flex",
    fontSize: "20px !important",
    lineHeight: "150% !important",
    color: "#172624 !important",
    textAlign: "start",
    "@media (max-width: 920px)": {
      fontSize: "18px !important",
      lineHeight: "20px !important",
      fontWeight: "600 !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "14px !important",
      lineHeight: "19.6px !important",
      fontWeight:"400 !important"

    },
  },
  carousalStyle: {
    padding: "10px 0 0 0",
    display: "grid",
    gap: "15px",
    "@media (max-width: 920px)": {
      padding: "30px 0 0 0",
    },
    "@media (max-width: 599px)": {
      padding: "20px 0 0 0",
    },
  },

  textcss: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "42px !important",
    fontStyle: "normal !important",
    fontWeight: "800 !important",
    lineHeight: "51px !important",
    textTransform: " !important",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "24px !important",
      lineHeight: "28.73px !important",
      textAlign:"center",
      fontWeight:"700 !important"
      
    },
  },
  buttonDiv: {
    textAlign: "center",
    // padding: "40px 0",
    "@media (max-width: 540px)": {
      // padding: "20px 0",
    },
  },
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    minHeight: "56px !important",
    lineHeight: "16px !important",
    color: "#fff !important",
    marginTop: "10px",
    cursor: "pointer !important",
    padding: "12px 24px !important",
    maxWidth: "365px !important",
    background: "#172624 !important",
    width: "100% !important",
    marginBottom: "40px",
    "&:hover": {
      color: "#fff !important",
      background: "#172624 !important",
    },
    "@media (max-width: 540px)": {
      maxWidth: "none !important",
      marginBottom: "20px",
    },
  },
  card: {
    background: "#181C1F",
    borderRadius: "20px",
    width: "100%",
    // minHeight: '580px',
    boxSizing: "border-box",
    Stroke: "Linear Gradient #FFFFFF 0% rgba(255, 255, 255, 0) 100% ",
  },
  cardContentBox: {
    display: "grid",
    gap: "15px",
    padding: "25px 21px 13px 21px!important",
  },
  buybtn: {
    width: "100%",
    padding: "10px 20px",
    color: "#172624",
    cursor: "pointer",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "15.5938px",
    lineHeight: "19px",
    alignItems: "center",
    textAlign: "center",
    background: "#D19A1D",
    borderRadius: "6.66227px",
    "&:hover": {
      background: "#D19A1D",
      boxShadow:
        "inset -2.22076px -2.22076px 2.22076px rgba(0, 0, 0, 0.1), inset 2.22076px 2.22076px 2.22076px rgba(255, 255, 255, 0.1)",
      borderRadius: "6.66227px",
    },
  },
  list: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "150%",
  },
  list2: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "19px",
    lineHeight: "150%",
  },
  listBox: {
    display: "flex",
    gap: "10px",
    minHeight: "62px",
  },
  data: {
    justifyContent: "center",
    display: "flex",
    background: "#D19A1D",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "24px",
    lineHeight: "30px",
    marginTop: "9.38px",
  },
  data1: {
    justifyContent: "center",
    display: "flex",
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "28px",
    lineHeight: "31px",
  },
}));

export default function SixtyDayFreeTrial(values) {
  const classes = useStyles();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className={classes.carousalStyle}>
            <Typography className={classes.textcss}>
              Start Your Free 90 Day Free Trial Today!
            </Typography>
            <Typography
              className={classes.body1}
              style={{ textAlign: "center" , justifyContent:"center"}}
            >
              (no credit card required)
            </Typography>

            <Grid container justifyContent="center">
              <Box>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContentBox}>
                    <div>
                      <Typography className={classes.data}>
                        {/* {value.planname} */}
                        90 Day Free Trial
                      </Typography>
                      <br />
                      <Divider
                        style={{
                          background: "rgba(255, 255, 255, 0.4)",
                          opacity: "0.5",
                        }}
                      />
                      <br />
                      <div>
                        <Typography className={classes.data1}>
                          {/* {value.price == "Free" ? value.price : "$" + value.price} */}
                        </Typography>
                      </div>
                    </div>

                    <div>
                      <List>
                        <ListItem>
                          <ListItemText>
                            <Box className={classes.listBox}>
                              <FaCheck
                                style={{
                                  color: "#00C64F",
                                }}
                              />

                              <Typography className={classes.list2}>
                                {/* {value?.features}{" "} */}
                                100 Digital Yard Sign Address <br /> Locations
                                on the Mapp
                                {/* <p>{value?.features == 12 ? "No Credit Card Required*" : ""}</p> */}
                              </Typography>
                            </Box>
                          </ListItemText>
                        </ListItem>
                      </List>
                    </div>
                    <Divider
                      style={{
                        background:
                          "linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 48.96%, rgba(255, 255, 255, 0) 100%)",
                        opacity: "0.5",
                      }}
                    />
                    <div>
                      <Button
                        className={classes.buybtn}
                        onClick={() => {
                          if (
                            auth.userLoggedIn &&
                            localStorage.getItem("token")
                          ) {
                            navigate("/my-subscriptions");
                          } else {
                            navigate("/register");
                          }
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

            <Typography className={classes.textcss}>
              Sign Up/In today and we can take care of rest!{" "}
            </Typography>
            <div style={{ display: "grid", gap: "12px" }}>
              <Typography className={classes.body1}>
                <img
                  src="images/Star.svg"
                  style={{ marginRight: "12px" }}
                  alt=""
                />{" "}
                Customer Service will contact by email once account is open with
                exact details on how to post signs.
              </Typography>
              <Typography className={classes.body1}>
                <img
                  src="images/Star.svg"
                  style={{ marginRight: "12px" }}
                  alt=""
                />{" "}
                Utilize current customer project list from Quickbooks,
                Accounting, or Excel Data Base.{" "}
              </Typography>
              <Typography className={classes.body1}>
                <img
                  src="images/Star.svg"
                  style={{ marginRight: "12px" }}
                  alt=""
                />{" "}
                Each sign is posted by - Street Address, Town/City, State and
                Zip Code of your favorite completed projects.
              </Typography>
              <Typography className={classes.body1}>
                <img
                  src="images/Star.svg"
                  style={{ marginRight: "12px" }}
                  alt=""
                />{" "}
                Easy Multiple Address Upload on dashboard from CSV file .
              </Typography>
              <Typography className={classes.body1}>
                <img
                  src="images/Star.svg"
                  style={{ marginRight: "12px" }}
                  alt=""
                />{" "}
                Contact Customer Service and we can post signs for you.{" "}
              </Typography>
            </div>
            <Box className={classes.buttonDiv}>
              <Button
                onClick={() => {
                  navigate("/register");
                }}
                className={classes.transButton}
              >
                Sign Up Today
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
