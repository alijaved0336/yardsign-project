import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Grid,
  Typography,
  Box,
  Container,
  Button,
  TextField,
  Modal,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { GoPerson } from "react-icons/go";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { FiTag } from "react-icons/fi";
import { SlDirection } from "react-icons/sl";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { IoCloseCircleOutline } from "react-icons/io5";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    "@media (max-width: 1280px)": {
      "& .MuiContainer-maxWidthLg": {},
    },
  },
  outerGridText: {
    padding: "110px 36px 110px 36px !important",
    // backgroundImage: `url(${process.env.PUBLIC_URL}/images/backOneSide.png)`,

    backgroundImage: `url(/images/bgImage1.png)`,
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    flexDirection: "column",
    justifyContent: "center",
    gap: "3%",
    backgroundSize: "cover",
    height: "100vh",
    "@media (max-width: 960px)": {},
  },
  blur: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    height: "105vh",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(145deg, rgba(0,0,0,0.8), rgba(0,0,0,0.3))",
    zIndex: 1,
    opacity: 1,
    gap: "2%",
  },
  blur1: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    height: "100vh",
    position: "absolute",
    top: "326px",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(145deg, rgba(0,0,0,0.8), rgba(0,0,0,0.3))",
    zIndex: 1,
    opacity: 1,
    gap: "2%",

    "@media (max-width: 540px)": {
      top: "10rem !important",
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
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    minHeight: "56px !important",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px !important",
    border: "2px solid #FDFAFE !important",
    maxWidth: "200px !important",
    background: "transparent !important",
    width: "100% !important",
    "&:hover": {
      color: "#fff !important",
      background: "transparent !important",
    },
    "@media (max-width: 540px)": {
      maxWidth: "none !important",
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
    cursor: "pointer !important",
    padding: "12px 24px !important",
    border: "2px solid #FDFAFE !important",
    // maxWidth: "283px !important",
    background: "#fff !important",
    width: "-webkit-fill-available !important",
    minHeight: "56px !important",
    "&:hover": {
      color: "#172624 !important",
      background: "#fff !important",
    },
    "@media (max-width: 540px)": {
      maxWidth: "none !important",
    },
  },
  ExploreNew: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    lineHeight: "18px !important",
    color: "#f5f5f5 !important",
    cursor: "pointer !important",
    padding: "12px 80px !important",
    border: "2px solid #D19A1D !important",
    background: "#D19A1D !important",
    borderRadius: "16px !important",
    fontSize: "24.2381px !important",
    width: "400px ",
    height: "80px ",

    "@media (max-width: 2600px)": {
      height: "80px ",
      width: "450px ",
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
  ExploreNew1: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "16px !important",
    borderRadius: "16px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "24.2381px !important",
    lineHeight: "18px !important",
    color: "#f5f5f5 !important",
    cursor: "pointer !important",
    padding: "12px 24px !important",
    border: "2px solid #F5F5F5 !important",
    width: "300px ",
    height: "65px ",

    "@media (max-width: 2600px)": {
      width: "400px",
      height: "80px",
    },
    "@media (max-width: 1440px)": {
      width: "300px",
      height: "65px",
    },
    "@media (max-width: 600px)": {
      width: "180px",
      height: "55px",
      fontSize: "16.2381px !important",

      padding: "0px !imporatant",
    },
    "@media (max-width: 450px)": {
      width: "160px",
      height: "50px",
      fontSize: "14.2381px !important",

      padding: "0px !imporatant",
    },

    "&:hover": {
      color: "#ffffff !important",
      backgroundColor: "#000 !important",
    },
  },

  largeText: {
    fontFamily: "Big Shoulders Display, sans-serif ",
    fontStyle: "normal",
    fontWeight: "800 ",
    fontSize: "75px ",
    color: "#FDFAFE ",
    "@media (max-width: 2600px)": {
      fontSize: "95px ",
      lineHeight: "100px",
    },
    "@media (max-width: 1440px)": {
      fontSize: "75px ",
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
      fontSize: "30px ",
      lineHeight: "35px",
    },
    "@media (max-width: 450px)": {
      fontSize: "25px ",
      lineHeight: "25px",
    },
  },
  largeTextHeading: {
    fontFamily: "Big Shoulders Display, sans-serif ",
    fontStyle: "normal",
    fontWeight: "800 ",
    fontSize: "75px ",
    color: "#FDFAFE ",
    "@media (max-width: 2600px)": {
      fontSize: "95px ",
      lineHeight: "100px",
    },
    "@media (max-width: 1440px)": {
      fontSize: "75px ",
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
  smallText: {
    fontFamily: "Big Shoulders Display, sans-serif ",
    fontStyle: "normal",
    fontWeight: "800 ",
    fontSize: "45px ",
    lineHeight: "60px",
    color: "#FDFAFE ",
    "@media (max-width: 1400px)": {
      fontSize: "35px ",
    },
    "@media (max-width: 1280px)": {
      fontSize: "35px ",
    },
    "@media (max-width: 920px)": {
      fontSize: "35px ",
    },
    "@media (max-width: 599px)": {
      fontSize: "35px ",
    },
  },
  body1: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "20px !important",
    lineHeight: "150%",
    color: "#F0F0F0 !important",
    margingTop: "20px",
    display: "block",
    gap: "12px",
    alignItems: "center",
    "@media (max-width: 920px)": {
      fontSize: "18px !important",
      lineHeight: "20px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "17px !important",
      lineHeight: "20px !important",
    },
  },
  para1: {
    fontFamily: "Big Shoulders Display",
    fontSize: "42.76px",
    fontWeight: 800,
    color: "white",
    lineHeight: "41.61px",
    textAlign: "center",
  },
  imgGrid: {
    display: "block",

    justifyContent: "center",
    "@media (max-width: 960px)": {
      display: "block",
    },
    "& img": {
      maxHeight: "900px",
      minHeight: "700px",
      minHeight: "700px",
      "@media (max-width: 960px)": {
        maxHeight: "none",
      },
    },
    "& .newBox": {
      "@media (max-width: 960px)": {
        float: "none",
      },
    },
  },
  rightGap: {
    // paddingLeft: "200px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    flexDirection: "column",
    gap: "45px",
    padding: "45px",
    gap: "45px",
    padding: "45px",
    gap: "45px",
    padding: "45px",
    // width:"80%",
    // "@media (max-width: 920px)": {
    //   padding: "30px 24px",
    // },
    // "@media (max-width: 599px)": {
    //   padding: "20px 20px",
    // },
  },
  multicoloredText: {
    background: 'linear-gradient(45deg, red, blue, green, yellow, purple)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block', // necessary for transform animations
    animation: '$zoomSpinIn 1s ease-out',
    fontSize:"70px",
    fontWeight:"bold",
    "@media (max-width: 800px)": {
      fontSize:"50px"
    },
    "@media (max-width: 540px)": {
      fontSize:"40px"
    },
    "@media (max-width: 450px)": {
      fontSize:"30px"
    },
  },
  // Define keyframes
  '@keyframes zoomSpinIn': {
    '0%': {
      transform: 'scale(0) rotate(-360deg)',
      opacity: 0,
    },
    '100%': {
      transform: 'scale(1) rotate(0deg)',
      opacity: 1,
    },
  },
  

  gridDiv: {
    display: "grid",
    gap: "20px",
    marginTop: "20px",
    "@media (max-width: 1165px)": {
      gap: "10px",
    },
    "@media (max-width: 959px)": {
      gap: "20px",
    },
  },
}));
function Banner({ flag }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  return (
    <Grid item xs={12} sm={12} md={12} lg={7} className={classes.outerGridText}>
      <Box className={flag ? classes.blur : classes.blur1}>
      {flag && <Typography
        className={classes.multicoloredText }
        style={{ textTransform: "uppercase", color:"#D19A1D" }}
      >
        <span>Digital Yard Signs </span>
      </Typography>}
        <Typography
          className={classes.largeTextHeading}
          style={{ textTransform: "uppercase" }}
        >
          <span>Home Owners </span>
        </Typography>
        <Typography className={classes.largeText}>
          <span>Start Your Home Improvement Project Here:</span>
        </Typography>

        <Button
          className={classes.ExploreNew}
          onClick={() => {
            navigate("/map");
          }}
        >
          GO TO MAPP
        </Button>
        <Typography className={classes.largeTextHeading}>
          Here is how it works!
        </Typography>

        <Button
          className={classes.ExploreNew1}
          onClick={() => {
            setOpenModal(!openModal);
          }}
        >
          Watch Video
        </Button>

        <Box>
          <Modal
            open={openModal}
            onClose={handleClose}
            className={classes.modalMain}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card className={classes.modalCard}>
              <Box className={classes.modalTopbar}>
                <Typography variant="h6">
                  What are Digital Yard Signs?
                </Typography>
                <IconButton
                  sx={{
                    color: "#fff",
                  }}
                  onClick={handleClose}
                >
                  <IoCloseCircleOutline />
                </IconButton>
              </Box>
              <CardMedia
                component="video"
                src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/videos/YardSignPro.mp4"
                controls
              />
            </Card>
          </Modal>
        </Box>
      </Box>
    </Grid>
  );
}

export default Banner;
