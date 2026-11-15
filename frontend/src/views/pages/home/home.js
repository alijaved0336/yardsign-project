import React, { useContext, useRef } from "react";
import Banner from "./banner";
import makeStyles from "@mui/styles/makeStyles";
import MapExplor from "./MapExplor";
import Steps from "./Steps";
import Footer from "src/views/auth/Main/footer";
import VideoSection from "./VideoSection";
import Stats from "./Stats";
import { Button, Divider, useMediaQuery } from "@mui/material";
import { Box } from "react-feather";
import BannerSecond from "./HomeServices/banner2";
import SectionTwo from "./SectionTwo";
import { ScrollContext } from "src/context/ScrollContext";
import CarouselComponent from "./Carousel";

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
  largeText: {
    color: "#fff !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "65px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "51px !important",
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
  headerBar: {
    minHeight: "250px",
    backgroundColor: "#033731",
    display: "flex",
    alignItems: "center",
    background: "url('/images/pattern.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    justifyContent: "center",
  },
}));

function Home() {
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const classes = useStyles();
  const {carouselRef} = useContext(ScrollContext)
  return (
    <>
      <Banner flag={true}/>
      <Divider style={{ marginTop: "1%", marginBottom: "1%" }} />
      <SectionTwo flag= {true}/>
      <Divider style={{marginTop:"1rem"}}/>
      <section className={classes.carousalStyle} id="map-bar">
        <MapExplor />
      </section>
      {isSmallScreen ? <></> : <Divider />}

      <section
        ref={carouselRef}
        className={isSmallScreen ? classes.mapExplor : classes.carousalStyle}
        id="scrolling-bar"
      >
        <CarouselComponent/>
      </section>
      {isSmallScreen ? <></> : <Divider />}
      <BannerSecond />
      <Divider />
      <section className={classes.carousalStyle1} id="board-bar">
        <Steps />
      </section>
      <section className={classes.mapExplor} id="map-bar">
        <Stats />
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}

export default Home;
