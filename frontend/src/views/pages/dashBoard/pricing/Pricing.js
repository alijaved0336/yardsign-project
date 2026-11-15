import { Box, Button, Container, Grid, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import { UserContext } from "src/context/User";
import { useNavigate } from "react-router-dom";
import Page from "src/component/Page";
import Footer from "@/views/auth/Main/footer";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    marginTop: "80px",
    "@media (max-width: 1280px)": {
      "& .MuiContainer-maxWidthLg": {},
    },
    "@media (max-width: 1280px)": {
      marginTop: "60px",
    },
    "@media (max-width: 920px)": {
      marginTop: "40px",
    },
    "@media (max-width: 599px)": {
      marginTop: "30px",
    },
  },
  headbox: {
    "& .title": {
      color: "#172624 !important",
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontSize: "42px !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      lineHeight: "51px !important",
      textTransform: "uppercase !important",
      "@media (max-width: 920px)": {
        fontSize: "38px !important",
        lineHeight: "44px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "26px !important",
        lineHeight: "35px !important",
        marginBottom: "10px !important",
      },
    },
    "& .subTitle": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "600 !important",
      fontSize: "16px !important",
      lineHeight: "16px !important",
      color: "#000 !important",
      margin: "20px 0 30px 0px !important",
      textTransform: "uppercase !important",
      "@media (max-width: 599px)": {
        fontSize: "15px !important",
      },
    },
    "& .innerTitle": {
      color: "#172624 !important",
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontSize: "32px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      lineHeight: "42px !important",
      "@media (max-width: 920px)": {
        fontSize: "30px !important",
        lineHeight: "40px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "24px !important",
        lineHeight: "30px !important",
      },
    },
    "& .ExploreButton": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "18px !important",
      lineHeight: "18px !important",
      color: "#172624 !important",
      cursor: "pointer",
      padding: "12px 24px !important",
      background: "#D19A1D !important",
      minHeight: "56px !important",
      minWidth: "200px !important",
      marginTop: "30px",
      marginBottom: "20px",
      "&:hover": {
        color: "#172624 !important",
        background: "#D19A1D !important",
      },
      "@media (max-width: 540px)": {
        width: "-webkit-fill-available !important",
        marginTop: "20px !important",
        marginBottom: "15px",
      },
    },
    "& .bodyText": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "500 !important",
      fontSize: "20px !important",
      lineHeight: "26px !important",
      color: "#000 !important",
      margin: "10px 0px !important",
      "@media (max-width: 599px)": {
        fontSize: "18px !important",
        lineHeight: "24px !important",
      },
    },
    "& .imgBox": {
      height: "100%",
      alignItems: "center",
      display: "flex",
    },
  },
}));

export default function Pricing() {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const classes = useStyles();
  const pricingData = [
    {
      boldText: "60-Day Free Trial:",
      normalText: "No Credit Card Required!",
    },
    {
      boldText: "Custom Digital Yard Signs:",
      normalText:
        "Craft or enhance with ease. Add your logo, company web URL, captivating 'Slider Images,' and dynamic video posts.",
    },
    {
      boldText: "Direct Neighborhood Connections:",
      normalText:
        "Generate pop-up links to your website in the neighborhood, maximizing visibility and engagement.",
    },
    {
      boldText: "Special Offer:",
      normalText:
        "Post 25 Free Yard Signs in the Best Neighborhoods to kickstart your campaign effectively.",
    },
    {
      boldText: "Incredible Value:",
      normalText:
        " Small, Business, Corporate Packages less than $1 per yard sign!",
    },
  ];
  return (
    <Page title="pricing">
      <Grid container className={classes.mainContainer}>
        <Container maxWidth="lg">
          <Box className={classes.headbox}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography className="title">
                    Digital Yard Sign Pricing - For as Low as $0.025 Per Yard
                    Sign!{" "}
                  </Typography>
                  <Typography className="subTitle">
                    Get Your Company and Services on the NEW Mapp! Instant
                    Access to thousands of Customers looking for your exact
                    service!
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography className="innerTitle">
                    {/* Replace 'Old' Paper Yard Sign Marketing Campaign  */}
                    Start New
                    Digital Yard Sign Marketing Campaign
                  </Typography>
                  <Button
                    // onClick={() => {
                    //   navigate("/pricing-cards");
                    // }}
                    className="ExploreButton"
                  >
                    Start Now
                  </Button>
                  {pricingData.map((values) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                        }}
                      >
                        <div style={{ paddingTop: "15px" }}>
                          <img
                            src="images/Star.svg"
                            style={{ marginRight: "12px" }}
                            alt=""
                          />
                        </div>
                        <Typography className="bodyText">
                          <span style={{ fontWeight: "700" }}>
                            {values.boldText}
                          </span>{" "}
                          {values.normalText}
                        </Typography>
                      </div>
                    );
                  })}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box className="imgBox">
                    <img
                      src="images/YARDSIGNPROSHOP.svg"
                      alt=""
                      style={{ width: "100%" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Grid>
    </Page>
  );
}
