import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GoogleMapReact from "google-map-react";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { IoCloseCircleOutline } from "react-icons/io5";

const useStyles = makeStyles((theme) => ({
  largeText: {
    color: "#172624 !important",
    // textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "32px !important",
    marginTop: "3%",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "45px !important",
    textTransform: "uppercase",
    "@media (max-width: 1200px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "24px !important",
    },
  },

  body1: {
    fontFamily: "Noto Sans",
    fontStyle: "normal",
    fontWeight: "400 !important",
    fontSize: "17px !important",
    lineHeight: "200%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#7F7F7F !important",
    textAlign: "start",

    "@media (max-width: 1200px)": {
      fontSize: "15px !important",
      lineHeight: "18px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "20px !important",
      lineHeight: "25px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "16px !important",
      lineHeight: "20px !important",
    },
  },
  typoSeparate: {
    marginTop: "24px",
    display: "grid",
    gap: "16px",
    marginBottom: "40px",
  },
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    minHeight: "56px !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    maxWidth: "350px !important",

    background: "#D19A1D !important",
    width: "100% !important",
    "&:hover": {
      color: "#D19A1D !important",
      border: "2px solid #D19A1D",
      background: "#fff !important",
    },
    "@media (max-width: 920px)": {
      maxWidth: "290px !important",
    },
  },

  newButtonDiv: {
    display: "flex",
    justifyContent: "start",
    marginTop: "4%",
    "@media (max-width: 700px)": {
      justifyContent: "center",
    },
  },
  manageCategory: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    overflow: "auto",
    position: "relative",
    "& .button": {
      borderRadius: "30px",
      border: "1px solid #c4c4c4",
      padding: "5px 20px",
      color: "#172624",
      minWidth: "200px",
      "@media (max-width: 920px)": {
        minWidth: "140px",
      },
    },
  },
  TextBoxFormControlOpen: {
    minWidth: "140px",
    "@media (max-width: 1125px)": {
      minWidth: "140px",
    },
    "&:focus-visible": {
      outline: "none !important",
    },
    "& .MuiSelect-icon": {
      right: "9px !important",
    },
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "24px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },
    "& .MuiInputBase-input": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "14px !important",
      lineHeight: "150% !important",
      color: "#172624 !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "11px 11px 11px 11px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },
  },
  headingText: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 450px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
  },
  headingText1: {
    color: "#172624 !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "48px !important",
    marginBottom: "4%",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "50px !important",
    textTransform: "uppercase",
    "@media (max-width: 450px)": {
      fontSize: "35px !important",
      lineHeight: "40px !important",
    },
  },
  mainSection: {
    marginTop: "4%",
    marginBottom: "4%",
  },
  childSection: {
    display: "flex",
    gap: "28px",
    marginTop: "5%",
    "@media (max-width:700px)": {
      flexDirection: "column-reverse",
    },
    "@media (max-width:450px)": {
      flexDirection: "column-reverse",
    },
  },
  starDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "4%",
    marginBottom: "4%",
  },
  box1: {
    flex: 1,
  },
  box2: {
    flex: 1,
  },
  modalTopbar: {
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    color: "#fff",
  },
  modalMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "60%",
    position: "relative",
    outline: "none",
  },
  TextBoxFormControl: {
    minWidth: "140px",
    position: "absolute",
    top: "0",
    "@media (max-width: 1125px)": {
      minWidth: "276px",
    },
    "&:focus-visible": {
      outline: "none !important",
    },
    "& .MuiSelect-icon": {
      right: "9px !important",
    },
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "24px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },

    "& .MuiInputBase-input": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "14px !important",
      lineHeight: "150% !important",
      color: "#172624 !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "11px 11px 11px 11px !important",
      "&:focus-visible": {
        outline: "none !important",
      },
    },
  },
}));
const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function MapExplor() {
  const classes = useStyles();
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const navigate = useNavigate();
  return (
    <Container className={classes.mainSection}>
      <Box>
        <Typography className={classes.headingText1}>
          Once Source for All Home Improvement Needs!!
        </Typography>{" "}
        <Typography className={classes.headingText}>
          Home Owners - Find Service Providers in Seconds
        </Typography>
      </Box>
      <Box className={classes.childSection}>
        <Box className={classes.box1}>
          <Typography className={classes.largeText}>
            Everything You Need for Any Home Improvement Project - With Just a
            Few Clicks on the Mapp{" "}
          </Typography>
          <Box className={classes.starDiv}>
            <Typography className={classes.body1}>
              <img src="images/Star.svg" />
              {"  "}
              Go to Home Address and Store
            </Typography>{" "}
            <Typography className={classes.body1}>
              <img
                src="images/Star.svg"
                // Aligns with the first line
              />{" "}
              Enter Home Service or AEC Providers required in Search Box
            </Typography>
            <Typography className={classes.body1}>
              <img src="images/Star.svg" alt="" /> 100's of Interior, Exterior
              and AEC for any project{" "}
            </Typography>
            <Typography className={classes.body1}>
              <img src="images/Star.svg" alt="" />
              100's of Digital Yard Signs Pop up in Neighborhood
            </Typography>{" "}
            <Typography className={classes.body1}>
              <img src="images/Star.svg" alt="" /> Click on a Yard Sign and go
              right to the company web site
            </Typography>
            <Typography className={classes.body1}>
              <img src="images/Star.svg" alt="" /> Get Complete Company and Free
              Quote in minutes
            </Typography>
          </Box>
          <div className={classes.newButtonDiv}>
            <Button
              className={classes.transButton}
              onClick={() => {
                setOpenModal(!openModal);
              }}
            >
              <span>What are Digital Yard Signs?</span>
            </Button>
          </div>
          <Box>
            <Modal
              open={openModal}
              onClose={handleClose}
              className={classes.modalMain}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Card className={classes.modalCard}>
                <Box className={classes.modalTopbar}>
                  <Typography variant="h6">
                    What is a Digital YardSign?
                  </Typography>
                  <IconButton
                    sx={{
                      color: "#fff",
                    }}
                    onClick={handleClose}
                  >
                    <IoCloseCircleOutline />
                  </IconButton>
                </Box>
                <CardMedia
                  component="video"
                  src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/videos/Connecting+Homeowners+with+Service+Providers+-+Video+generated+with+Synthesia.mp4"
                  controls
                />
              </Card>
            </Modal>
          </Box>
        </Box>
        <Box className={classes.box2}>
          <div>
            <img
              src="images/aboutus_first.png"
              alt=""
              style={{ width: "100%" }}
            />
            <div className={classes.newButtonDiv}></div>
          </div>
        </Box>
      </Box>
    </Container>
  );
}
