import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GoogleMapReact from "google-map-react";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { IoCloseCircleOutline } from "react-icons/io5";

const useStyles = makeStyles((theme) => ({
  largeText: {
    color: "#172624 !important",
    // textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "32px !important",
    marginTop: "3%",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "45px !important",
    textTransform: "uppercase",
    "@media (max-width: 1200px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "24px !important",
    },
  },
  largeTextHeading: {
    fontFamily: "Big Shoulders Display, sans-serif ",
    fontStyle: "normal",
    fontWeight: "800 ",
    fontSize: "20px ",
    color: "#000 ",
    "@media (max-width: 2600px)": {
      fontSize: "20px ",
      lineHeight: "100px",
    },
    "@media (max-width: 1440px)": {
      fontSize: "20px ",
      lineHeight: "80px",
    },
    "@media (max-width: 1280px)": {
      fontSize: "60px ",
      lineHeight: "65px",
    },
    "@media (max-width: 950px)": {
      fontSize: "50px ",
      lineHeight: "55px",
    },
    "@media (max-width: 800px)": {
      fontSize: "40px ",
      lineHeight: "45px",
    },
    "@media (max-width: 599px)": {
      fontSize: "40px ",
      lineHeight: "45px",
    },
    "@media (max-width: 450px)": {
      fontSize: "45px ",
      lineHeight: "50px",
    },
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
    },
    "@media (max-width: 599px)": {
      fontSize: "16px !important",
      lineHeight: "20px !important",
    },
  },
  typoSeparate: {
    marginTop: "24px",
    display: "grid",
    gap: "16px",
    marginBottom: "40px",
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
    padding: "12px 24px !important",
    maxWidth: "350px !important",

    background: "#D19A1D !important",
    width: "100% !important",
    "&:hover": {
      color: "#D19A1D !important",
      border: "2px solid #D19A1D",
      background: "#fff !important",
    },
    "@media (max-width: 920px)": {
      maxWidth: "290px !important",
    },
  },

  newButtonDiv: {
    display: "flex",
    justifyContent: "start",
    marginTop: "4%",
    "@media (max-width: 700px)": {
      justifyContent: "center",
    },
  },
  manageCategory: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    overflow: "auto",
    position: "relative",
    "& .button": {
      borderRadius: "30px",
      border: "1px solid #c4c4c4",
      padding: "5px 20px",
      color: "#172624",
      minWidth: "200px",
      "@media (max-width: 920px)": {
        minWidth: "140px",
      },
    },
  },
  TextBoxFormControlOpen: {
    minWidth: "140px",
    "@media (max-width: 1125px)": {
      minWidth: "140px",
    },
    "&:focus-visible": {
      outline: "none !important",
    },
    "& .MuiSelect-icon": {
      right: "9px !important",
    },
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "24px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },
    "& .MuiInputBase-input": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "14px !important",
      lineHeight: "150% !important",
      color: "#172624 !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "11px 11px 11px 11px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
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
    textTransform: "uppercase",
    "@media (max-width: 450px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
  },
  headingText1: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "48px ",
    marginBottom: "2rem",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px ",
    textTransform: "uppercase",
    "@media (max-width: 450px)": {
      fontSize: "35px !important",
      lineHeight: "40px !important",
    },
  },
  mainSection: {
    marginTop: "4%",
    marginBottom: "4%",
  },
  childSection: {
    display: "flex",
    gap: "28px",
    marginTop: "3rem",
    marginBottom: "5rem",
    "@media (max-width:900px)": {
      flexDirection: "column",
    },
    "@media (max-width:450px)": {
      flexDirection: "column",
    },
  },
  starDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "4%",
    marginBottom: "4%",
  },
  box1: {
    flex: 4,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    gap: "1rem",
  },
  box2: {
    flex: 6,
  },
  image: {
    width: "calc(55% - 1rem)",
    height: "auto", 
    objectFit: "contain",
   
    "@media (max-width: 1380px)": {
      width: "calc(45% - 1rem)", 
    },
    "@media (max-width: 900px)": {
      width: "100%", 
    },
    
  },
   image2: {
    width: "calc(60% - 1rem)",
    height: "auto", 
    objectFit: "contain",
   
    "@media (max-width: 1380px)": {
      width: "calc(50% - 1rem)", 
    },
    "@media (max-width: 900px)": {
      width: "100%", 
    },
    
  },
  child: {
    display: "flex",
    flexDirection: "row",
    gap: "4rem",
    "@media (max-width: 900px)": {
      flexDirection:"column" ,
    },
  },
  ExploreNew: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    lineHeight: "18px !important",
    color: "#f5f5f5 !important",
    cursor: "pointer !important",
    padding: "12px 10px !important",
    border: "2px solid #D19A1D !important",
    background: "#D19A1D !important",
    borderRadius: "16px !important",
    fontSize: "24.2381px !important",
    width: "300px ",
    height: "50px ",

    "@media (max-width: 2600px)": {
      height: "60px ",
      width: "300px ",
    },
    "@media (max-width: 1440px)": {
      height: "70px ",
      width: "400px ",
    },
    "@media (max-width: 800px)": {
      height: "65px ",
      width: "350px ",
    },
    "@media (max-width: 600px)": {
      width: "200px ",
      height: "60px ",
      padding: "0px !important",

      fontSize: "16px !important",
    },
    "@media (max-width: 450px)": {
      width: "200px ",
      height: "50px ",
      padding: "0px !important",

      fontSize: "15px !important",
    },

    "&:hover": {
      color: "#D19A1D !important",
      backgroundColor: "#000 !important",
    },
  },
  modalTopbar: {
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    color: "#fff",
  },
  modalMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "60%",
    position: "relative",
    outline: "none",
  },
  TextBoxFormControl: {
    minWidth: "140px",
    position: "absolute",
    top: "0",
    "@media (max-width: 1125px)": {
      minWidth: "276px",
    },
    "&:focus-visible": {
      outline: "none !important",
    },
    "& .MuiSelect-icon": {
      right: "9px !important",
    },
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "24px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },

    "& .MuiInputBase-input": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "14px !important",
      lineHeight: "150% !important",
      color: "#172624 !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "11px 11px 11px 11px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },
  },
}));
const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function First() {
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const navigate = useNavigate();
  return (
    <Container className={classes.mainSection}>
      <Box className={classes.childSection}>
        <Box className={classes.box1}>
          <Typography className={classes.headingText}>
            <span>Home Service Providers</span>
          </Typography>

          <Button
            className={classes.ExploreNew}
            onClick={() => {
              navigate("/register");
            }}
          >
            Free 90 Day Trial{" "}
          </Button>
          <Typography className={classes.headingText}>
            Post 100 Free 'Digital' Yard Signs Today!{" "}
          </Typography>
        </Box>
        <Box className={classes.box2}>
          <Box className={classes.child}>
            <img src="images/simg.png" alt="" className={classes.image} />
            <img src="images/simg1.png" alt="" className={classes.image2} />
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box className={classes.childSection}>
        <Box className={classes.box1}>
          <Typography
            className={classes.headingText1}
            style={{ fontSize: "70px " }}
          >
            <span>Go 'Digital'</span>
          </Typography>

          <Typography className={classes.headingText}>
            <span>
              Replace old Paper Yard sign advertising with our New Digital
              Program
            </span>
          </Typography>
        </Box>
        <Box className={classes.box2}>
          <Box className={classes.child}>
            <img src="images/simg2.png" alt="" className={classes.image} />
            <img src="images/simg3.png" alt="" className={classes.image} />
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box className={classes.childSection}>
        <Box className={classes.box1}>
          <Typography
            className={classes.headingText1}
            style={{ fontSize: "60px ", lineHeight: "70px" }}
          >
            <span>Instantly place a Yard Sign @ every project address </span>
          </Typography>
        </Box>
        <Box className={classes.box2}>
          <Box className={classes.child}>
            <img src="images/simg4.png" alt="" className={classes.image2}/>
            <img src="images/simg5.png" alt="" className={classes.image} />
          </Box>
        </Box>
      </Box>
      <Divider />
    </Container>
  );
}
