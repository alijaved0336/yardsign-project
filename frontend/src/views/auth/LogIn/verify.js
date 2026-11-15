import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Button, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "calc(100vh - 65px)",
    justifyContent: "center",
    display: "grid",
    alignItems: "center",
    overflow: "auto",
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
  ButtonTextCss: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    textAlign: "center !important",
    textTransform: "none !important",
    letterSpacing: "0.2px !important",
    color: "#D19A1D !important",
    lineHeight: "16px !important",
    marginTop: "20px",
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

export default function Verify() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loader, setLoader] = useState(false);
  // Extracting the token from searchParams
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    setToken(searchParams.get("token"));
    setUserId(searchParams.get("uidb64"));
  }, [searchParams.get("token")]);
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (token) {
      setTimeout(() => {
        handleFormSubmit();
      }, 500);
    }
  }, [token]);
  const handleFormSubmit = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      uidb64: userId,
      token: token,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(ApiConfig.verificationConfirm, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (JSON.parse(result).status == true) {
          toast.success(JSON.parse(result).message);
          setActive(true);
          navigate("/company-information", {
            state: {
              email: JSON.parse(result)?.email,
            },
          });
        } else {
          toast.error(JSON.parse(result).message);
          setActive(false);
        }
      })
      .catch((error) => {console.error(error); 
        toast.error("Something went wrong")
        setActive(false);});
  };
  const handleResendLink = async () => {
    if (userId) {
      setLoader(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        uidb64: userId,
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(ApiConfig.resend_verification, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          if (JSON.parse(result).status == true) {
            toast.success(JSON.parse(result).message);
            setLoader(false);
          } else {
            toast.error(JSON.parse(result).message);
            setLoader(false);
          }
        })
        .catch((error) => {
          console.error(error);
          setLoader(false);
        });
    }
  };
  return (
    <div className={classes.root}>
      {active === true && (
        <div className={classes.mainDiv}>
          <img
            src="images/verify.svg"
            alt=""
            style={{ width: "100%", margin: "auto" }}
          />{" "}
          <div>
            <Typography className={classes.textCss}>
              your account has been verified
            </Typography>
            <Button
              className={classes.ButtonCss}
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
      {active === false && (
        <div className={classes.mainDiv}>
          <img
            src="images/opps.svg"
            alt=""
            style={{ width: "100%", margin: "auto" }}
          />{" "}
          <div>
            <Typography className={classes.textCss}>
              Oops! Something went wrong
            </Typography>

            <Button
              className={classes.ButtonCss}
              onClick={() => handleResendLink()}
              disabled={loader}
            >
              Resend verification link {loader && <><ButtonCircularProgress /></>}
            </Button>

            <Typography
              className={classes.ButtonTextCss}
              onClick={() => navigate("/")}
            >
              Back to home !
            </Typography>
          </div>
        </div>
      )}
      {active === null && <div className={classes.loaderCss}></div>}
    </div>
  );
}
