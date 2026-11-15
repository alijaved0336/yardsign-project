import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GoogleMapReact from "google-map-react";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";

const useStyles = makeStyles((theme) => ({
  mainSection: {
    display: "flex",
    gap: "48px",
    marginTop: "2%",
    marginBottom: "2%",
    "@media (max-width:900px)": {
      flexDirection: "column-reverse",
    },
  },
  headingText: {
    color: "#fff !important",
    textAlign: "start",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 900px)": {
      fontSize: "35px !important",
      lineHeight: "40px !important",
    },
  },
  paraText: {
    fontFamily: "Noto Sans",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
    textAlign: "left",
    color: "#fff !important",
    "@media (max-width: 900px)": {
      fontSize: "16px !important",
      lineHeight: "24px !important",
    },
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
    flexDirection: "row",
    justifyContent: "space-around",

    "@media (max-width:900px)": {
      gap: "32px",
    },
    "@media (max-width:700px)": {
      gap: "32px",
      flexDirection:"column !important"
    },
  },
  body1: {
    fontFamily: "Noto Sans",
    fontStyle: "normal",
    fontWeight: "400 !important",
    fontSize: "15px !important",
    lineHeight: "200%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#fff !important",
    textAlign: "start",

    "@media (max-width: 1200px)": {
      fontSize: "15px !important",
      lineHeight: "18px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "13px !important",
      lineHeight: "15px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "16px !important",
      lineHeight: "24px !important",
    },
  },
  starDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  statsBox: {
    gap: "13px",
    borderRadius: "32px",
    border: "1px solid white",
    minHeight: "205px",
    minWidth:"300px",
    backgroundColor: "rgba(255, 255, 255, 0.1)", // White with 50% opacity
    backdropFilter: "blur(10px)", // Blur effect
    WebkitBackdropFilter: "blur(10px)", // Safari support
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  statsNumber: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    color: "#fff",
    fontSize: "60px",
    fontWeight: 700,
    lineHeight: "60px",
    textAlign: "center",
  },
  statsText: {
    fontFamily: "Noto Sans",
    color: "#fff",
    fontSize: "24px",
    fontWeight: 500,
    lineHeight: "60px",
    textAlign: "center",
  },
}));
const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function Stats() {
  const classes = useStyles();
  const navigate = useNavigate();
  return (
    <Container className={classes.mainSection}>
      {/* <Box className={classes.box1}>
        <Typography className={classes.headingText}>
          New Geospatial Home Improvement - AI 'Agency' Service.
        </Typography>
        <Typography className={classes.paraText}>
          Our Building Agent can make any Home Improvement Project Easy!
          Consulting, Zoning, Permitting, Contracting, and Project Completion
          all handled from one easy to use source. Save thousands of Dollars,
          Cut Project Completion Time and many hours of effort on any project.
        </Typography>
        <Typography className={classes.headingText}>
          Geo AI Building Agent - Marketing & Sales leads!
        </Typography>
        <Typography className={classes.paraText}>
          Home Service Providers and AEC Consultants can post hundreds of
          'smart' Digital Yard Signs at every project. Home Owners AI Search
          instanly connects closest matching service providers for direct web
          site link. Hundreds of great Click Leads at each digital smart sign
          post!
        </Typography>
        <Box className={classes.starDiv}>
          <Typography className={classes.body1}>
            <img src="images/Star.svg" />
            HomeOwners - Smart Search - instant link to any required service
            provider and AEC consultant for any project.
          </Typography>
          <Typography className={classes.body1}>
            <img src="images/Star.svg" alt="" />
            Home Service Providers - Smart Post - Complete service area coverage
            in minutes
          </Typography>
          <Typography className={classes.body1}>
            <img src="images/Star.svg" alt="" />
            AEC Consultants - Smart Post - Complete service area coverage in
            minutes{" "}
          </Typography>
        </Box>
      </Box> */}
      <Box className={classes.box2}>
        <Box className={classes.statsBox}>
          <Typography className={classes.statsNumber}>90+</Typography>
          <Typography className={classes.statsText}>Home Services Sectors</Typography>
        </Box> 
         <Box className={classes.statsBox}>
          <Typography className={classes.statsNumber}>9+</Typography>
          <Typography className={classes.statsText}>AEC Consultant Sectors</Typography>
        </Box>
        <Box className={classes.statsBox}>
          <Typography className={classes.statsNumber}>50K+</Typography>
          <Typography className={classes.statsText}>
            Yard Signs Published
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
