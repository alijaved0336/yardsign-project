import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";

const useStyles = makeStyles((theme) => ({
  categoryHeading: {
    fontFamily: "Big Shoulders Display",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "30px",
    textAlign: "left",
  },
  serviceName: {
    color: "#005F99",
    fontFamily: "Noto Sans",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "36.8px",
    textAlign: "left",
  },
}));

function ListSection(data) {
  const classes = useStyles();
  return (
    <>
      <Box>
        <Typography className={classes.categoryHeading}>
          {data.heading}
        </Typography>
        <Box className={classes.listDiv}>
          {data.data.map((sector) => (
            <Typography className={classes.serviceName}>{sector.sector_name}</Typography>
          ))}
        </Box>
      </Box>
    </>
  );
}

export default ListSection;
