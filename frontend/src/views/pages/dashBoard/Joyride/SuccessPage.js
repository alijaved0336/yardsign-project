import React, { useContext, useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Button, Typography } from "@mui/material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import { UserContext } from "src/context/User";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 65px)",
    justifyContent: "center",
    display: "grid",
    alignItems: "center",
    overflow: "auto",
    textAlign: "center",
  },
  loaderCss: {
    border: "11px solid #D19A1D",
    borderTop: "11px solid transparent",
    borderRadius: "50%",
    width: "100px",
    height: "100px",
    animation: "$spin 1s linear infinite",
    margin: "auto",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  mainDiv: {
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  ButtonCss: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    textAlign: "center !important",
    textTransform: "none !important",
    letterSpacing: "0.2px !important",
    color: "#fff !important",
    lineHeight: "16px !important",
    background: "#172624 !important",
    borderRadius: "6px !important",
    padding: "20px !important",
    textTransform: "uppercase !important",
  },
  textCss: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "800 !important",
    fontSize: "42px !important",
    lineHeight: "120% !important",
    color: "#172624 !important",
    textTransform: "uppercase !important",
    marginBottom: "8px !important",
    marginTop: "10px",
    "@media (max-width: 920px)": {
      fontSize: "32px !important",
      marginBottom: "15px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px",
      marginBottom: "10px",
    },
  },
}));

export default function Success() {
  const classes = useStyles();
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    
           user.getViewMyProfile();
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        setLoader(false);
        toast.success(
          "Your subscription plan has been successfully activated."
        );
        setTimeout(() => {
          navigate("/my-subscriptions");
        }, 1000);
      }
    }, 800);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={classes.root}>
      {loader === false && (
        <div>
          <img
            src="images/verify.svg"
            alt=""
            style={{ width: "100%", margin: "auto", maxHeight: "150px" }}
          />
          <div>
            <Typography className={classes.textCss}>
              Subscription Plan Purchased!
            </Typography>
          </div>
        </div>
      )}

      {loader === true && <div className={classes.loaderCss}></div>}
    </div>
  );
}
