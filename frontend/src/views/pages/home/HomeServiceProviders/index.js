import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import CarouselComponent from "../Carousel";
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
  useMediaQuery,
} from "@mui/material";
import Services from "../HomeServices/Services";
import Banner2 from "../HomeServices/banner2";
import SectionTwo from "../SectionTwo";
import First from "./first";


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
    // backgroundImage: "url('/images/MaskgroupBackground.svg')",
    // backgroundSize: "cover",
    // paddingBottom: "5px",
    // paddingTop: '40px',
    // height:"200px",
    // width:"100%",
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
      minHeight:"135px"
    },
  },

}));

export default function HomeServiceProviders() {
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:900px)");

  return (
    <>
      <section className={classes.bannerBgStyle} id="home-bar">
        <Box className={classes.headerBar}>
          <Typography className={classes.largeText}>Digital Yard Signs! </Typography>
        </Box>
      </section>
      <section>
        {/* <SectionTwo flag={false}/> */}
        <First/>
      </section>
     
      <section
        className={isSmallScreen ? classes.mapExplor : classes.carousalStyle}
        id="scrolling-bar"
      >
        <CarouselComponent flag = {true}/>
      </section>
      <Divider/>
      <section>
        <Banner2/>
      </section>
      <Divider/>
      <section>
        <Container className={classes.regionMap}>
            <Services/>
        </Container>
      </section>
      <Box>
        <Footer />
      </Box>
    </>
  );
}

 
