import React from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  scenario: {
    gap: "10px",
    borderRadius: "19px",
    marginTop: "3rem",
    backgroundColor: "#162A28",
    // minHeight: "300px",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
  description: {
    gap: "10px",
    borderRadius: "16px",
    border: "1px solid #ffffff",
    padding: "24px",
  },
  mainDiv: {
    width: "60rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
}));
function Scenario({ data }) {
  const classes = useStyles();
  return (
    <Container className={classes.scenario}>
      <Box className={classes.mainDiv}>
        <Typography className={classes.largeText}>
          <span>{data.scenario}</span>
          <span style={{ color: " #D19A1D" }}>{data.title}</span>
        </Typography>
        <Box className={classes.description}>
          <Typography className={classes.smallText}>
            {data.description}
          </Typography>
          {data.additional && (
            <Typography className={classes.smallText}>
              {data.additional}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Scenario;
