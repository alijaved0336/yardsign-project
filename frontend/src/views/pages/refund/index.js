import React from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Page from "src/component/Page";
import Scenario from "./Scenario";
import RefundForm from "./RefundForm";
import Footer from "src/views/auth/Main/footer";

const useStyles = makeStyles((theme) => ({
  bannerBgStyle: {
    backgroundSize: "cover",
    background: "#172624",
    paddingBottom: "0px",
    display: "flex",
    flexDirection: "column",
  },
  headerBar: {
    minHeight: "250px",
    backgroundColor: "#033731",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "url('/images/pattern.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    justifyContent: "center",
    "@media (max-width: 599px)": {
      minHeight: "135px",
    },
  },
  scenario: {
    gap: "10px",
    borderRadius: "19px",
    marginTop: "3rem",
    backgroundColor: "#162A28",
    height: "250px",
  },
  largeText: {
    color: "#fff !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "40px !important",
      lineHeight: "35px !important",
    },
  },
  smallText: {
    color: "#fff !important",
    textAlign: "center",
    fontFamily: "Noto Sans",
    fontSize: "32px !important",
    fontStyle: "normal",
    letterSpacing: "0.15px",
    fontWeight: "400 !important",
    lineHeight: "45px !important",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "40px !important",
      lineHeight: "35px !important",
    },
  },
  noteSection: {
    fontFamily: "Big Shoulders Display",
    fontWeight: 800,
    fontSize: "48px",
    textTransform: "uppercase",
    lineHeight: "59px",
    letterSpacing: "0.45px",
    textAlign: "center",
  },
  formText: {
    fontFamily: "Noto Sans",
    fontWeight: 700,
    fontSize: "24px",
    lineHeight: "34px",
    letterSpacing: "0.41px",
    textAlign: "center",
    textTransform: "uppercase",
  },
}));
function Refund() {
  const classes = useStyles();
  const scenarios = [
    {
      scenario: "Scenario 1:",
      title: " No Yard Signs ",
      description: "Refund Amount: 75% of the actual purchase amount.",
    },
    {
      scenario: "Scenario 2:",
      title: " Some Yard Signs Utilized  ",
      description: "Refund Amount: 75% of the actual purchase amount ",
      additional: "- ( Price of One Yard Sign × Total Yard Signs Used ).",
    },
  ];
  return (
    <Page title="refund">
      <>
        <section className={classes.bannerBgStyle} id="home-bar">
          <Box className={classes.headerBar}>
            <Box style={{ marginTop: "2%" }}>
              <Typography className={classes.largeText}>
                Refund Policy
              </Typography>
              <Typography className={classes.smallText}>
                We offer refunds under specific conditions <br />
                based on yard sign utilization
              </Typography>
            </Box>
          </Box>
        </section>
        <section>
          <Scenario data={scenarios[0]} />
        </section>
        <section>
          <Scenario data={scenarios[1]} />
        </section>
        <section>
          <Container style={{ marginTop: "4rem" }}>
            <Typography className={classes.noteSection}>
              <span>Note:</span>
              <span
                style={{
                  color: " #D19A1D",
                }}
              >
                {" "}
                Refunds Are Not Possible If Yardsigns Worth 75% of actual
                purchase amount or more are used.
              </span>
            </Typography>
          </Container>
        </section>
        <section style={{ marginTop: "5rem" }}>
          <Typography className={classes.formText}>
            <span style={{ color: "black" }}>
              To initiate a refund or exchange, Fill The Form Below
            </span>
          </Typography>
          <RefundForm/>
        </section>
        <section>
          <Footer/>
        </section>
      </>
    </Page>
  );
}

export default Refund;
