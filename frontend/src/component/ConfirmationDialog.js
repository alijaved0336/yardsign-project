import React from "react";
import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 350,
    height: 215,
    background: "#F5F5F5",
    borderRadius: "24px",
    "& .MuiDialogContent-root": {
      flex: "none !important",
    },
    "& .MuiDialogActions-root": {
      marginRight: "0px !important",
    },
  },
  Titlemain: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "23.989px",
    lineHeight: "36px",
    color: "#2A2A2B",
    marginTop: "16px",
  },
  subMain: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "16px",
    lineHeight: "24px",
    color: "#2A2A2B",
  },
  yesNoButton: {
    width: "82px",
    height: "37px",
    background: "#172624",
    borderRadius: "10px",
    color: "#fff",
    "&:hover": {
      background: "#fff",
      color: "#000",
      border: "1px solid #172624",
    },
  },
}));
export default function AlertDialog({
  open,
  handleClose,
  title,
  desc,
  confirmationHandler,
  isloading,
}) {
  const classes = useStyles();
  return (
    <div>
      <Dialog
        open={open}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
        PaperProps={{
          classes: {
            root: classes.root,
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" style={{ textAlign: "center" }}>
          <Typography className={classes.Titlemain}> {title}</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              textAlign: "center",
              fontSize: "17px",
            }}
          >
            <Typography
              style={{ fontSize: "18px" }}
              className={classes.subMain}
            >
              {" "}
              {desc}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{ display: "flex", justifyContent: "space-around" }}
        >
          <Button
            className={classes.yesNoButton}
            onClick={handleClose}
            autoFocus
            disabled={isloading}
          >
            No
          </Button>
          <Button
            className={classes.yesNoButton}
            disabled={isloading}
            onClick={() => {
              confirmationHandler();
            }}
          >
            Yes{isloading && <ButtonCircularProgress classes={classes} />}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
