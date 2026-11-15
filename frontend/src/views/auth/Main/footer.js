import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Grid,
  Box,
  Container,
  Typography,
  Button,
  ListItem,
  List,
  Link,
  IconButton,
  Dialog,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AiOutlineMail } from "react-icons/ai";
import { FaFacebookF, FaInstagram, FaMediumM } from "react-icons/fa";
import { FiSend, FiTwitter, FiYoutube } from "react-icons/fi";
import { AiOutlineReddit, AiFillYoutube } from "react-icons/ai";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  footerSection: {
    position: "relative",
    padding: "50px 0px 0",
    zIndex: "2",
    backgroundColor: "#142826",
    overflow: " hidden",
    gap: "32px",
    fontFamily: "Big Shoulders Display, sans-serif",

    "& .copy": {
      borderTop: "1px solid #D0D0D0",
      padding: "10px 0",
      textAlign: "center",
      fontWeight: 300,
      fontSize: "12px",
      color: "#fff",
      fontFamily: "'Noto Sans', sans-serif",
      marginTop: "30px",
    },
    "& .shape": {
      position: "absolute",
      right: "20px",
      top: "50px",
      // [theme.breakpoints.down('sm')]: {
      //   top: "50%",
      // },
    },
    "& .shape2": {
      position: "absolute",
      left: "80px",
      top: "55px",
    },
    "& .shape3": {
      position: "absolute",
      left: "40px",
      top: "75px",
    },
    "& .shape4": {
      position: "absolute",
      left: "200px",
      bottom: "50px",
    },
    "& ul": {
      paddingLeft: "0",
      // [theme.breakpoints.down('md')]: {
      //   marginBottom: "30px",
      // },
      // [theme.breakpoints.down('sm')]: {
      //   marginBottom: "0px",
      // },
      "& li": {
        paddingLeft: "0",
        alignItems: "center",
        color: " #ffffff",
        fontSize: "18px",
        "& svg": {
          marginRight: "10px",
          color: "#ffffff",
          fontSize: "15px",
        },
      },
    },
    "& svg": {
      color: "#ffffff",
      fontSize: "15px",
    },

    "& h6": {
      color: "#fff",
      // [theme.breakpoints.down('md')]: {
      //   marginTop: "30px",
      // },
      // [theme.breakpoints.down('sm')]: {
      //   marginTop: "20px",
      // },
    },
    "& a": {
      color: "#ffffff",
      fontWeight: 400,
      textDecoration: "none",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      letterSpacing: "1.5px",
      fontFamily: "'Noto Sans', sans-serif",
      "&:AIML": {
        color: "#35a5f5",
        textDecoration: "none",
      },
    },
  },

  footerHeading: {
    color: "#ffffff",
    fontWeight: 800,
    textDecoration: "none",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    letterSpacing: "1.5px",
    fontFamily: "'Noto Sans', sans-serif",
    "@media (max-width: 700px)": {
      fontSize: "18px !important",
    },
  },
  footerlogo: {
    Width: "160px",
    height: "40px",
  },
  logo: {
    maxWidth: "200px",
  },
  dialogProfileDiv: {
    display: "grid",
    justifyContent: "center",
  },
  dialogCard: {
    padding: "29px 40px 35px 40px",
    minWidth: "486px",
  },
  inputBox: {
    display: "flex",
    justifyContent: "end",
    paddingBottom: "10px",
  },
  inputBoxButton: {
    width: "53px",
    height: "20px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#FFFFFF",
    borderRadius: "2px",
  },
  inputlabelName: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "16px",
    lineHeight: "24px",
    color: "#ffffff",
  },
  inputlabelvalue: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "18px",
    lineHeight: "21px",
    color: "#1D1D1D",
  },
  nameBorderdiv: {
    border: "1px solid #B3B3B3",
    height: "39px",
    width: "100%",
    padding: "0px 8px 8px",
  },
  profileImg: {
    width: "80px",
    height: "80px",
    borderRadius: "100%",
  },
  dialogProfileDiv: {
    display: "grid",
    justifyContent: "center",
  },
  dialogCard: {
    padding: "29px 40px 35px 40px",
    minWidth: "486px",
  },
  inputlabelDiv: {
    paddingBottom: "18px",
  },
  largeText: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal",
    fontWeight: "700 !important",
    fontSize: "32px !important",
    lineHeight: "120% !important",
    color: "#F7F6F1 !important",
    textAlign: "start",
    textTransform: "uppercase !important",
    minWidth: "280px",
    "@media (max-width: 880px)": {
      minWidth: "auto",
    },
    "@media (max-width: 1400px)": {
      fontSize: "32px !important",
    },
    "@media (max-width: 1280px)": {
      fontSize: "30px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "28px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
    },
  },
  body1: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal",
    fontWeight: "700 !important",
    fontSize: "40px !important",
    lineHeight: "normal !important",
    color: "#D19A1D !important",
    margingTop: "20px",
    textAlign: "start",
    margingTop: "8px",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "28px !important",
    },
  },

  footerFlex: {
    display: "flex",
    justifyContent: "end",
    "@media (max-width: 880px)": {
      alignItems: "center",
      height: "100%",
    },
    "@media (max-width: 700px)": {
      marginTop: "20px",
      justifyContent: "center",
      flex: "1 !important",
    },
  },
  Explore: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    color: "#172624 !important",
    cursor: "pointer",
    padding: "16px !important",
    border: "2px solid #FDFAFE !important",
    background: "#fff !important",
    width: "100% !important",
    "&:hover": {
      color: "#172624 !important",
      background: "#fff !important",
    },
    "@media (max-width: 540px)": {
      maxWidth: "none !important",
    },
  },
  footerMobile: {
    display: "flex",
  },
  heading2: {
    fontFamily: "Big Shoulders Display",
    fontSize: "40px",
    fontWeight: 600,
    lineHeight: "60px",
    color: "#fff !important",
  },
  heading: {
    fontFamily: "Big Shoulders Display",
    fontSize: "48px",
    fontWeight: 600,
    lineHeight: "60px",
    color: "#fff !important",
  },
  footerText: {
    fontFamily: "Noto Sans",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "28.8px",
    textAlign: "left",
    color: "#fff",
  },
  handleChanges: {
    margin: "24px 0",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    "@media (max-width:  880px)": {
      display: "block",
      gap: "5px",
    },
  },
  footerContainer: {
    display: "flex",
    margin: "0 10%",
    "@media (max-width:  1200px)": {
      flexDirection: "column",
    },
  },
  logoText: {
    flex: 5,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
}));

export default function Footer() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [anchorEl3, setAnchorEl3] = React.useState(null);
  const address = localStorage.getItem("walletAddress");
  const isSmallScreen = useMediaQuery("(max-width:1200px)");
  return (
    <>
      <Box className={classes.footerSection}>
        <Box className={classes.footerContainer}>
          <Box className={classes.logoText}>
            <Typography className={classes.heading}>
              Geodaka GeoAI Geospatial Services{" "}
            </Typography>
            <Typography className={classes.heading}>
              YardSignProShop.com
            </Typography>
            {/* <Typography className={classes.heading2}>
            {/* <Typography className={classes.heading2}>
              YardSignProShop.com 'Smart Digital Yard Sign' Services
            </Typography>
            <Typography className={classes.footerText}>
              Geodaka Geospatial AI Agency Services Introduces our Smart Digital
              Yard Mapplication. Home Owners can instantly connect with 'every'
              service provider or AEC Consultant - right on the Mapp. Home
              Service Providers and AEC Consultants can instanly post thousands
              of smart digital yard signs potentially generating 100's of sales
              leads with each sign posted in their service area. Geodaka AI
              agents facilitate every project thru digital smart E-Commerce
              connection.
            </Typography> */}
          </Box>
          {isSmallScreen ? (
            <></>
          ) : (
            <div className={classes.footerFlex} style={{ flex: 2 }}>
              <List>
                <ListItem

                >
                  <Typography className={classes.footerHeading}>
                    {" "}
                    Useful Links
                  </Typography>
                </ListItem>
                <ListItem
                  onClick={() => {
                    window.open(
                      "https://massgis.maps.arcgis.com/apps/OnePane/basicviewer/index.html?appid=47689963e7bb4007961676ad9fc56ae9",
                      "_blank"
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Link target="_blank">MassGIS Viewer</Link>
                </ListItem>
                <ListItem
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate("/contact-us");
                  }}
                >
                  <Link style={{ color: "#fff" }}>Contact Us</Link>
                </ListItem>
           
                <ListItem
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate("/home-services");
                  }}
                >
                  <Link target="_blank">Home Services</Link>
                </ListItem>

                <ListItem
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    window.open("/privacy&policy", "_blank");
                  }}
                >
                  <Link target="_blank">Privacy Policy</Link>
                </ListItem>
                <ListItem
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    window.open("/terms&condition", "_blank");
                  }}
                >
                  <Link target="_blank">Terms & Conditions</Link>
                </ListItem>
              </List>
            </div>
          )}
          {isSmallScreen ? (
            <></>
          ) : (
            <div className={classes.footerFlex} style={{ flex: 2 }}>
              <List>
                <ListItem>
                  <Typography className={classes.footerHeading}>
                    {" "}
                    Contact Information
                  </Typography>
                </ListItem>
                <ListItem>
                  <Link>contact@yardsignproshop.com</Link>
                </ListItem>
              </List>
            </div>
          )}

          {isSmallScreen ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap", // Ensure wrapping on smaller screens
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: "300px", // Minimum width for smaller screens
                }}
              >
                <List>
                  <ListItem>
                    <Typography className={classes.footerHeading}>
                      {" "}
                      Useful Links
                    </Typography>
                  </ListItem>
                  <ListItem
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate("/contact-us");
                    }}
                  >
                    <Link style={{ color: "#fff" }}>Contact Us</Link>
                  </ListItem>
                  <ListItem
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate("/home-services");
                    }}
                  >
                    <Link target="_blank">Home Services</Link>
                  </ListItem>

                  <ListItem
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open("/privacy&policy", "_blank");
                    }}
                  >
                    <Link target="_blank">Privacy Policy</Link>
                  </ListItem>
                  <ListItem
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open("/terms&condition", "_blank");
                    }}
                  >
                    <Link target="_blank">Terms & Conditions</Link>
                  </ListItem>
                </List>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: "300px",
                }}
              >
                <List>
                  <ListItem>
                    <Typography className={classes.footerHeading}>
                      {" "}
                      Contact Information
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Link>Info@YardSignProShop.com</Link>
                  </ListItem>
                  <ListItem>
                    <Link>508-425-4559</Link>
                  </ListItem>
                </List>
              </Box>
            </Box>
          ) : (
            <></>
          )}
        </Box>
        <Box className="copy" mt={1}>
          All rights reserved © YardSign Pro
        </Box>
      </Box>
    </>
  );
}
