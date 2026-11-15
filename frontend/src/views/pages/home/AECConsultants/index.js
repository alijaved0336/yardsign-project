import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Footer from "src/views/auth/Main/footer";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Services from "../HomeServices/Services";

const useStyles = makeStyles((theme) => ({
  bannerBgStyle: {
    // backgroundImage: "url('/images/BannerBg.svg')",
    backgroundSize: "cover",
    background: "#172624",
    paddingBottom: "0px",
    // paddingTop: '40px'
  },
  carousalStyle: {
    background: "#fff",
    "@media (max-width: 920px)": {
      padding: "30px 0 0 0",
    },
    "@media (max-width: 599px)": {
      padding: "20px 0 0 0",
    },
  },
  carousalStyle1: {
    background: "#FFF",
    padding: "80px 0",
    "@media (max-width: 920px)": {
      padding: "40px 0",
    },
    "@media (max-width: 599px)": {
      padding: "30px 0",
    },
  },
  videoSection: {
    background: "#F5F5F5",
    padding: "20px 0",
    "@media (max-width: 920px)": {
      padding: "40px 0",
    },
    "@media (max-width: 599px)": {
      padding: "20px 0",
    },
  },
  mapExplor: {
    background: "url('/images/pattern.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    backgroundColor: "#142826",
    padding: "20px 0",
    "@media (max-width: 920px)": {
      padding: "40px 0",
    },
    "@media (max-width: 599px)": {
      padding: "20px 0",
    },
  },
  bannerImg: {
    marginBottom: "-5px",
  },
  regionMap: {
    display: "flex",
    justifyContent: "left",
    marginTop: "2%",
    marginBottom: "2%",
  },
  largeText: {
    color: "#fff !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "65px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "51px !important",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
      lineHeight: "35px !important",
    },
  },
  box1: {
    flex: 4,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    gap: "1rem",
    "@media (max-width: 1024px)": {
      flex: 3,
    },
  },
  box2: {
    marginTop: "5rem",
    flex: 6,
  },
  child: {
    display: "flex",
    flexDirection: "row",
    gap: "4rem",
    "@media (max-width: 900px)": {
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem",
    },
    "@media (max-width: 700px)": {
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem",
    },
    "@media (max-width: 540px)": {
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem",
    },
  },
  smallText: {
    color: "#000 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    marginBottom: "2rem",
    fontWeight: "800 !important",
    lineHeight: "65px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
      lineHeight: "35px !important",
    },
  },
  smallText2: {
    color: "#000 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display !important",
    fontSize: "30px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "40px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
      lineHeight: "35px !important",
    },
  },
  mainSection: {
    display: "flex",
    gap: "4rem",
    marginTop: "4rem",
    marginBottom: "5rem",
    "@media (max-width: 900px)": {
      flexDirection: "column",
    },

    "@media (max-width: 599px)": {
      flexDirection: "column",
    },
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
  headerBar: {
    minHeight: "250px",
    backgroundColor: "#033731",
    display: "flex",
    alignItems: "center",
    background: "url('/images/pattern.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    justifyContent: "center",
    "@media (max-width: 599px)": {
      minHeight: "135px",
    },
  },
}));

export default function AECConsultants() {
  const classes = useStyles();
  return (
    <>
      <section className={classes.bannerBgStyle} id="home-bar">
        <Box className={classes.headerBar}>
          <Typography className={classes.largeText}>
            Digital Yard Signs!{" "}
          </Typography>
        </Box>
      </section>
      <section>
        <Container className={classes.mainSection}>
          <Box className={classes.box1}>
            <Typography className={classes.smallText}>
              AEC Pro's and Consultants
            </Typography>
            <Typography className={classes.smallText2}>
              Instantly Advertise at every job site Each Digital Yard sign ONE
              CLICK to your awesome web site
            </Typography>{" "}
            <Typography className={classes.smallText2}>
              Get 'infinite' local sales leads in all the best neighborhoods
            </Typography>
          </Box>
          <Box className={classes.box2}>
            <Box className={classes.child}>
              <img src="images/simg7.png" alt="" className={classes.image} />
              <img src="images/simg8.png" alt="" className={classes.image} />
            </Box>
          </Box>
        </Container>
      </section>
      <Divider />
      <section>
        <Container className={classes.regionMap}>
          <Services />
        </Container>
      </section>
      <Box>
        <Footer />
      </Box>
    </>
  );
}
