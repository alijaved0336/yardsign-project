import React from "react";
import { Box, LinearProgress } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SettingsContext from "src/context/SettingsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: "center",
    // backgroundColor: theme.palette.background.dark,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    left: 0,
    // padding: theme.spacing(3),
    position: "fixed",
    top: 0,
    width: "100%",
    // zIndex: 2000,
    // backgroundColor: "#fff",
  },
  loader1: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    maxWidth: "500px",
    padding: "0px 30px",
  },
  loaderCss: {
    border: "11px solid #D19A1D",
    borderTop: "11px solid transparent",
    borderRadius: "50%",
    width: "67px",
    height: "67px",
    animation: "$spin 1s linear infinite",
    margin: "auto",
    marginTop: "25px", // Adjust as needed
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

export default function PageLoadingWithLoader() {
  const classes = useStyles();
  const themeSeeting = React.useContext(SettingsContext);

  return (
    <div className={classes.root}>
      <Box className={classes.loader1}>
        <Box className={classes.loader}>
          {/* <LinearProgress /> */}
          {themeSeeting.settings.theme === "DARK" ? (
            <>
              <img
                src="images/LogoLoading.png"
                alt="loader"
                style={{ width: "100%" }}
              />
              <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                <div class="three-body">
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
              </div></Box>
            </>
          ) : (
            <>
              <img
                src="/images/LogoLoading.png"
                alt="loader"
                style={{ maxWidth: "200px" }}
              />
              <div class="three-body">
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
              </div>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
