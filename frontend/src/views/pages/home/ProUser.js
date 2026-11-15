import React, { useRef, useState,useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Footer from "src/views/auth/Main/footer";
import SixtyDayFreeTrial from "./SixtyDayFreeTrial";
import PricingCards from "../dashBoard/pricing/PricingCards";
import {
  Typography,
  Container,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';

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
    padding: "60px 0 0 0",
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
  mapExplor: {
    background: "#F5F5F5",
    // padding: "80px 0",
    // "@media (max-width: 920px)": {
    //   padding: "40px 0",
    // },
    // "@media (max-width: 599px)": {
    //   padding: "20px 0",
    // },
  },
  bannerImg: {
    backgroundSize: "cover",
    paddingBottom: "5px",
    paddingTop: '0px',
    width: "100%",
    marginBottom: "10px",
    boxSizing: "border-box",
   
  },

  imgClass :
  {
    width:"100%",
    height:"400px",
    "@media (max-width: 599px)": {
      height:"100% !important"
    },
  },
  videoSection: {
    backgroundColor: "#fff",
    // border: "1px solid #ddd",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom:'33px',
  },
  videoResponsive: {
    position: "relative",
    width: "100%",
    backgroundColor: "#fff !important"
  },
  iframe: {
    width: "100%",
    height: "550px",
    borderRadius:'20px',
    "@media (max-width: 750px)": {
      height: "70vw",
    },
  },
  VideoTitle: {
    margin: "10px ",
    textAlign: "center",
    padding: '10px',
    // marginTop: '15px',
    color: "#2FF3FF",
    color: "#172624 !important",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "42px",
    fontStyle: "normal !important",
    fontWeight: "800 !important",
    lineHeight: "51px",
    "@media (max-width: 920px)": {
      fontSize: "32px",
      lineHeight: "40px"
    },
    "@media (max-width: 599px)": {
      fontSize: "28px",
      lineHeight: "34px"
    },
  },
  video: {
    width: "100%",
    height: "550px",
    borderRadius:'20px',
    "@media (max-width: 750px)": {
      height: "70vw",
    },
  },
  fixedCircle: {
    position: "fixed",
    width: "75px",
    height: "75px",
    backgroundColor: "white",
    borderRadius: "50%",
    zIndex: 1000,
    top: "680px", 
    left: "255px",
    boxShadow: "0px 3.06px 3.06px 0px #00000040",
    border:"0.76px #B3B3B3" ,
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    padding:"18.35px 22.18px"

  },
  proNetworkText:{
    fontFamily: "Big Shoulders Display",
    fontSize: "18.35px",
    fontWeight: "700",
    lineHeight: "21.97px",
    textAlign: "center",
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '48px',
    color: 'white',
    cursor: 'pointer',
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: '10px 20px',
    zIndex: '2',
    transition: 'background 0.3s',
    "&:hover":{
      background: 'rgba(0, 0, 0, 0.8)',
    }
  },
  
}));

function ProUser() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const classes = useStyles();

  const handlePlayButton = () => {
    const videoElement = videoRef.current;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  const isSmallScreen = useMediaQuery("(max-width:599px)");
  const navigate  = useNavigate()
  return (
    <>
        {isSmallScreen?  (<div className={classes.fixedCircle} onClick={()=> navigate("/my-subscriptions")}>
            <Typography className={classes.proNetworkText}>Join our pro map network</Typography>
          </div>):""}

      <div className={classes.bannerImg}>
        <img src={`/images/${isSmallScreen?`MaskgroupBackground.png`:`MaskgroupBackground1.png`}`} alt="#" style={{ width: "100%", height: "100%" }} className={classes.imgClass}  />
      </div>
      <section className={classes.mapExplor} id="">
        <SixtyDayFreeTrial />
      </section>

      <section>
        <PricingCards />
      </section>
      <div>
        <Footer />
      </div>
    </>
  );
}

export default ProUser;
