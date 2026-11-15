import React, { useEffect } from "react";
import PropTypes from "prop-types";
import makeStyles from "@mui/styles/makeStyles";
import TopBar from "./TopBar";
import AOS from "aos";
import { useLocation } from "react-router-dom";
import "aos/dist/aos.css";
import { ScrollProvider } from "src/context/ScrollContext";

AOS.init({ once: true });

const useStyles = makeStyles((theme) => ({
  root: {
    // display: "flex",
    height: "100%",
    // overflow: "hidden",
    width: "100%",
  },
  wrapper: {
    display: "flex",
    flex: "1 1 auto",
    overflow: "hidden",
    // backgroundImage:`url("/images/landing page.png")`,
    backgroundPosition: "unset",
    backgroundSize: "cover",
    // backgroundColor:"#0D2124"
    "@media(max-width:1200px)": {
      paddingTop:"0px !important",
    },
  },
  wrapperAuth: {
    flex: "1 1 auto",
    overflow: "hidden",
    // paddingTop:"63px",
    // backgroundImage:`url("/images/landing page.png")`,
    backgroundPosition: "unset",
    backgroundSize: "cover",
    // minHeight: "100vh",
  },
  contentContainer: {
    display: "flex",
    flex: "1 1 auto",
    overflow: "hidden",
    marginTop:"3%",

    "@media(max-width:2200px)": {
      marginTop: "4%",
    },
    "@media(max-width:1800px)": {
      marginTop: "5%",
    },
     "@media(max-width:1500px)": {
      marginTop: "6%",
    },
    "@media(max-width:1200px)": {
      marginTop: "2b%",
    },
  },
  content: {
    flex: "1 1 auto",
    height: "100%",
    overflow: "hidden",
  },
  contentLoginDiv: {
    margin: "auto",
    maxWidth: "686px",
    padding: "20px",
    marginTop: "5px",
    paddingBottom: "5px",
  },
  contentLogin: {
    minHeight: "fit-content",
    marginTop: "10%",
    maxWidth: "686px",
    overflowY: "auto",
    borderRadius: "10px",
    padding: "28px",
    color: "#1A1919",
    background: "#F5F5F5",
    boxShadow: "3px 4px 9px 0px rgba(0, 0, 0, 0.25)",
    marginBottom: "10px",
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-track": {
      margin: "40px 0 40px 0",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#172624",
      borderRadius: "20px !important",
    },
    "@media(max-width:600px)": {
      padding: "20px",
    },
    "@media(max-width:960px)": {
      margin: "20px",
    },
  },
  forgetAuth: {
    height: " -webkit-fill-available",
    alignItems: "center",
    display: "grid",
  },
  forgetWrapper: {
    height: "calc(100vh - 63px)",
    overflow: "auto",
  },
}));

const MainLayout = ({ children }) => {
  const classes = useStyles();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <ScrollProvider>
    <div className={classes.root}>
      <TopBar />

      {location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname === "/forget-password" ||
      location.pathname === "/verify-otp" ||
      location.pathname === "/company-information" ||
      location.pathname === "/reset-password" ? (
        <div
          className={`${classes.wrapperAuth} ${
            [
              "/forget-password",
              "/verify-otp",
              "/company-information",
              "/reset-password",
            ].includes(location.pathname)
              ? classes.forgetWrapper
              : ""
          }`}
        >
          <div
            className={`${classes.contentLoginDiv} ${
              ["/forget-password", "/verify-otp", "/reset-password"].includes(
                location.pathname
              )
                ? classes.forgetAuth
                : ""
            }`}
          >
            <div className={classes.contentLogin}>{children}</div>
          </div>
        </div>
      ) : (
        <div
          className={classes.wrapper}
          style={
            location.pathname == "/map" ||
            location.pathname.includes("/pricing-cards") ||
            location.pathname.includes("/verify")
              ? { minHeight: "auto" }
              : {}
          }
        >
          <div className={classes.contentContainer}>
            <div className={classes.content}>{children}</div>
          </div>{" "}
        </div>
      )}
    </div>
    </ScrollProvider>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
