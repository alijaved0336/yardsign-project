import React, { useState } from "react";
import Carousel from "react-material-ui-carousel";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FaArrowDownLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  headingText: {
    color: "#000 !important",
    textAlign: "start",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
  },
  paraText: {
    fontFamily: "Noto Sans",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
    textAlign: "left",
    color: "#000 !important",
  },
  box1: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  box2: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  body1: {
    fontFamily: "Noto Sans",
    fontStyle: "normal",
    fontWeight: "400 !important",
    fontSize: "17px !important",
    lineHeight: "200%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#7F7F7F !important",
    textAlign: "start",

    "@media (max-width: 1200px)": {
      fontSize: "15px !important",
      lineHeight: "18px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "20px !important",
      lineHeight: "25px !important",
      color: "#fff !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "16px !important",
      lineHeight: "20px !important",
      color: "#fff !important",
    },
  },
  carousalStyle: {
    padding: "30px 0 0 0",
    display: "grid",
    gap: "24px",
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
    textTransform: "uppercase !important",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
      lineHeight: "35px !important",
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
    "@media (max-width: 920px)": {
      maxWidth: "none !important",

      color: "#fff !important",
    },
    "@media (max-width: 540px)": {
      maxWidth: "none !important",

      color: "#fff !important",
    },
  },
  mainSection: {
    marginTop: "4%",
    marginBottom: "4%",
  },
  childSection: {
    display: "flex",
    gap: "28px",
    marginTop: "5%",

    "@media (max-width: 920px)": {
      flexDirection: "column-reverse",
      color: "#fff !important",
    },
    "@media (max-width: 540px)": {
      flexDirection: "column-reverse",
      color: "#fff !important",
    },
  },
  headingText: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    marginBottom: "1%",
    "@media (max-width: 920px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
      color: "#fff !important",

      // maxWidth: "none !important",
    },
    "@media (max-width: 540px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
      color: "#fff !important",

      // maxWidth: "none !important",
    },
  },
  headingText2: {
    color: "#172624 !important",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
      color: "#fff !important",

      // maxWidth: "none !important",
    },
    "@media (max-width: 540px)": {
      fontSize: "25px !important",
      lineHeight: "30px !important",
      color: "#fff !important",

      // maxWidth: "none !important",
    },
  },
  headingText1: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "48px !important",
    marginBottom: "4%",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "35px !important",
      lineHeight: "40px !important",
      color: "#fff !important",
    },
    "@media (max-width: 540px)": {
      fontSize: "35px !important",
      lineHeight: "40px !important",
      color: "#fff !important",
    },
  },
  starDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  newButtonDiv: {
    display: "flex",
    justifyContent: "start",
    marginTop: "4%",
    "@media (max-width:920px)": {
      justifyContent: "center",
      color: "#fff !important",
    },
    "@media (max-width:540px)": {
      justifyContent: "center",
      color: "#fff !important",
    },
  },
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    minHeight: "56px !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px",
    color: "#fff !important",
    cursor: "pointer",
    // padding: "12px 24px !important",
    maxWidth: "350px !important",
    background: "#D19A1D !important",
    width: "50% !important",
    "&:hover": {
      color: "#D19A1D !important",
      background: "#fff !important",
      border: "1px solid #D19A1D",
    },
    "@media (max-width: 920px)": {
      maxWidth: "290px !important",
    },
  },
}));

export default function CarouselComponent({ flag }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const isMediumScreen = useMediaQuery("(max-width:920px)");
  return (
    <Container className={classes.mainSection}>
      <Box>
        {flag ? (
          <Box>
            <Typography className={classes.headingText1}>
              Home Service Providers
            </Typography>
            <Typography className={classes.headingText}>
              Place a 'Digital' Yard Sign at every project
            </Typography>{" "}
            <Typography className={classes.headingText}>
              Replaces ineffective 'paper' yard signs
            </Typography>{" "}
            <Typography className={classes.headingText}>
              Post hundreds, even thousands of Yard Signs - in seconds
            </Typography>{" "}
            <Typography className={classes.headingText}>
              Get 'infinite' local Sales Leads to web site from every project 
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography className={classes.headingText1}>
              Home Service Providers and AEC Consultants{" "}
            </Typography>
            <Typography className={classes.headingText}>
              Get 'Infinite' Local Sales Leads to Web Site in minutes!
            </Typography>{" "}
            <Typography className={classes.headingText}>
              Post Digital Yard Signs at Hundreds of Locations
            </Typography>
          </Box>
        )}
        <Box
          className={classes.newButtonDiv}
          style={{ justifyContent: "center" }}
        >
          <Button
            className={classes.transButton}
            onClick={() => {
              navigate("/register");
            }}
          >
            <span>FREE 90 DAY TRIAL</span>
          </Button>
        </Box>
        <Box className={classes.childSection}>
          <Box className={classes.box1}>
            {isMediumScreen  ? (
              <Typography className={classes.headingText2}>
                {`Home Service Providers: Exterior - Interior ${!flag?'- AEC Consultants':''}`}
              </Typography>
            ) : (
              <Typography className={classes.headingText2}>
                Home Service Providers: Exterior -
                <br /> {`Interior ${!flag?'- AEC Consultants':''}`}
              </Typography>
            )}
            <Box className={classes.starDiv}>
              <Typography className={classes.body1}>
                <img src="images/Star.svg" />
                We Put Your Company on THE NEW SEARCH MAPP!!
              </Typography>
              <Typography className={classes.body1}>
                <img src="images/Star.svg" alt="" />
                Replace your OLD PAPER Yard Sign Advertising/Marketing with the
                New DIGITAL YARD SIGN Program
              </Typography>
              <Typography className={classes.body1}>
                <img src="images/Star.svg" alt="" />
                Create New Company Digital Yard Sign in Minutes
              </Typography>
              <Typography className={classes.body1}>
                <img src="images/Star.svg" alt="" />
                Creates 'Click' instant SALES LEAD link to Company web site!{" "}
              </Typography>

              <Box className={classes.newButtonDiv}>
                <Button
                  className={classes.transButton}
                  onClick={() => {
                    navigate("/register");
                  }}
                >
                  <span>Sign up today</span>
                </Button>
              </Box>
            </Box>
          </Box>
          <Box className={classes.box2}>
            <Box>
              <img
                src={"images/map_layout.png"}
                style={{
                  width: "100%",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
