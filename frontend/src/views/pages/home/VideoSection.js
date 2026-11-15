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
    mainSection:
  {
    display:"flex",
    gap:"48px",
    marginTop:"2%",
    marginBottom:"2%",
    flexDirection:"column"
  },
  headingText:
  {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",

  }
  }));
  const AnyReactComponent = ({ text }) => <div>{text}</div>;
  export default function VideoSection() {
    const classes = useStyles();
    const navigate= useNavigate()
    return (
      <Container className={classes.mainSection} >
           <Typography className={classes.headingText}>Your Message, Elevated Through Cutting-Edge 
            <br/>Digital Displays.</Typography>
           <img src={"images/video_thumbnail.png"}/>
      </Container>
    );
  }
  