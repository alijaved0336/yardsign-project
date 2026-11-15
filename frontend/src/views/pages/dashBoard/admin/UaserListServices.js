import {
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import { makeStyles } from "@mui/styles";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Form, Formik } from "formik";
import * as yep from "yup";
import { HiLocationMarker } from "react-icons/hi";
import { UserContext } from "src/context/User";
import { fromLonLat } from "ol/proj";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa6";
import ConfirmationDialog from "src/component/ConfirmationDialog";
import UserSectorData from "./UserSectorData";
import MyServicesMap from "../map/MyServicesMap";

const useStyles = makeStyles((theme) => ({
  headbox: {
    padding: "42px 80px 20px 80px",
    "@media (max-width: 920px)": {
      padding: "30px 40px 20px 40px",
    },
    "@media (max-width: 599px)": {
      padding: "20px 20px 20px 20px",
    },
    "& .MuiDialog-paperWidthSm": {},
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
    "& .handlemoScreen": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      "@media (max-width: 950px)": {
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      },
    },
    "& .manageCssResponsiveness":{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap:"5px",
      "@media (max-width: 750px)": {
        display: "grid",
        justifyContent: "center",
        gap:"10px",
      }
    },
    "& .buttoncss": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "15.2381px !important",
      lineHeight: "18px !important",
      minHeight: "56px !important",
      color: "#000 !important",
      cursor: "pointer !important",
      padding: "12px !important",
      border: "1px solid rgb(23, 38, 36, 0.7) !important",
      minWidth: "200px !important",
      background: "#fff !important",
      "@media (max-width: 970px)": {
        minWidth: "150px !important",
      },
      "&:hover": {
        color: "#000 !important",
        background: "#fff !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px !important",
        lineHeight: "13.5px !important",
      },
    },
    "& .buttonDownloadcss": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "15.2381px !important",
      lineHeight: "18px !important",
      minHeight: "56px !important",
      color: "#000 !important",
      cursor: "pointer !important",
      padding: "12px !important",
      border: "1px solid rgb(23, 38, 36, 0.7) !important",
      minWidth: "56px !important",
      background: "#fff !important",
      "@media (max-width: 970px)": {
        minWidth: "56px !important",
      },
      "&:hover": {
        color: "#000 !important",
        background: "#fff !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px !important",
        lineHeight: "13.5px !important",
      },
    },
    "& .flexBox": {
      display: "flex",
      justifyContent: "space-between",
      "@media (max-width: 1100px)": {
        display: "block",
        gap: "10px",
      },
    },
    "& .divFlex": {
      display: "flex",
      gap: "15px",
      "@media (max-width: 799px)": {
        display: "grid",
        gap: "10px",
      },
    },
    "& .backGroundCard": {
      background: "#F5F5F5",
      padding: "20px",
      marginTop: "20px",
      borderRadius: "20px",
      display: "grid",
      gap: "40px",
    },
    "& .labelTitle": {
      color: "#000 !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "20px !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      marginBottom: "8px !important",
      lineHeight: "125% !important",
      wordBreak: "break-all",
    },
    "& .backgroundDiv": {
      borderRadius: "24px",
      background: "#FFF",
      boxShadow: "0px 6px 30px 0px rgba(0, 0, 0, 0.10)",
      padding: "40px 10px ",
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
    },

    "& .visible": {
      display: "none",
      "@media (max-width: 799px)": {
        display: "block",
      },
    },
    "& .newButtoncss": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "15.2381px !important",
      lineHeight: "18px !important",
      minHeight: "48px !important",
      color: "#102D0C !important",
      cursor: "pointer !important",
      padding: "16px 40px !important",
      border: "1px solid #172624 !important",
      background: "#fff !important",

      "&:hover": {
        color: "#102D0C",
        background: "#fff",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px",
        lineHeight: "13.5px",
      },
    },
    "& .editButton": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "15.2381px !important",
      lineHeight: "18px !important",
      color: "#fff !important",
      cursor: "pointer !important",
      padding: "16px 20px !important",
      background: "#172624 !important",
      minHeight: "48px !important",
      minWidth: "207px !important",
      "&:hover": {
        color: "#fff !important",
        background: "#172624 !important",
      },
      "@media (max-width: 540px)": {
        width: "-webkit-fill-available !important",
        marginTop: "20px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px !important",
        lineHeight: "13.5px !important",
      },
    },
    "& .buttonGroup": {
      display: "grid",
      gap: "12px",
      marginTop: "27px",
    },
    "& .newColorButtoncss": {
      fontFamily: "'Noto Sans', sans-serif !important",
      borderRadius: "6px !important",
      fontStyle: "normal !important",
      fontWeight: "700 !important",
      fontSize: "15.2381px !important",
      lineHeight: "18px !important",
      minHeight: "48px !important",
      color: "#102D0C !important",
      cursor: "pointer !important",
      padding: "16px 40px !important",
      border: "1px solid #D19A1D !important",
      background: "#D19A1D !important",

      "&:hover": {
        color: "#102D0C !important",
        background: "#D19A1D !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px !important",
        lineHeight: "13.5px !important",
      },
    },
    "& .imgDiv": {
      borderRadius: "200px",
      maxWidth: "200px",
      maxHeight: "200px",
      boxShadow: "0px 10px 100px 0px rgba(0, 0, 0, 0.20)",
      position: "relative",
    },
    "& .imgMainDiv": {
      display: "flex",
      justifyContent: "center",
    },
    "& .editImg": {
      bottom: "0",
      position: "absolute",
      right: "0",
    },
    "& .editImgDrawer": {},
    "& .SideBarBox": {
      display: "flex",
      gap: "20px",
    },
    "& .firstBox": {
      width: " 100%",
      maxWidth: "333px",
      "@media (max-width: 799px)": {
        display: "none",
      },
    },
    "& .SecondBox": {
      width: " 100%",
    },
    "& .cardTitle": {
      color: "#172624 !important",
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontSize: "20px !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      lineHeight: "28px !important",
      textTransform: "uppercase !important",
      "@media (max-width: 920px)": {
        fontSize: "20px !important",
        lineHeight: "25px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "18px !important",
        lineHeight: "20px !important",
      },
    },
    "& .innerScrollDiv":{
      overflow: "auto",
      maxWidth: "280px",
      background: "#ECF3F2",
      padding: "10px",
      "@media (max-width: 750px)": {maxWidth: "413px",}
    },
    "& .CardText": {
      color: "#172624 !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "16px !important",
      fontStyle: "normal !important",
      fontWeight: "500 !important",
      lineHeight: "20px !important",
      textTransform: "uppercase !important",
      "@media (max-width: 380px)": {
        wordBreak: "break-all",
      },
    },
    "& .alignDiv": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
    },
    "& .fence": {
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "500",
      fontSize: "18px",
      lineHeight: "20px",
      color: "#5A5A5A",
    },
    "& .fenceTitle": {
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      fontSize: "20px !important",
      lineHeight: "120% !important",
      color: "#172624 !important",
      textTransform: "uppercase !important",

      "@media (max-width: 920px)": {
        fontSize: "28px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "26px",
      },
    },
    "& .imgvideoList": {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    "& .openBoxTag": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "16px",
      background: "#fff",
      borderRadius: "8px",
      width: "100%",
      maxWidth: "250px",
    },
    "& .buttonCss": {
      borderRadius: "8px",
      background: "#172624",
      padding: "12px",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      width: "100%",
      fontSize: "14px",
      lineHeight: "150%",
      color: "#fff",
      boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
    },
    "& .buttonCss2": {
      background: "#f0f0f0",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "13px",
      padding: "10px 10px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      margin: "4px 1px",
      cursor: "pointer",
    },
  },
  editBox: {
    position: "relative",
  },
  editInput: {
    position: "absolute",
    top: "0",
    zIndex: "1",
    width: "-webkit-fill-available",
    overflow: "hidden",
    height: "100%",
    opacity: "0",
  },
  mainBox: {
    display: "flex",

    gap: "20px",
    "@media (max-width: 920px)": {
      display: "grid",
    },
  },
  TextBoxFormControl: {
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "10px !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "18px 16px !important",
    },
  },
  imageBox: {
    gap: "20px",
    "@media (max-width: 920px)": {
      display: "grid",
      gap: "10px",
      marginTop: "0px",
    },
    "& .imageFlex": {
      display: "flex",
      gap: "14px",
      alignItems: "center",
      width: "-webkit-fill-available",
      marginTop: "10px",
      overflow: "auto",
      padding: "10px 0",
    },
    "& .imagesList": {
      width: "90px",
      height: "90px",
      borderRadius: "10px",
    },
    "& .iconImage": {
      position: "absolute",
      top: "-8px",
      right: "-12px",
    },
    "& .iconImageDiv": {
      position: "relative",
    },
  },
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    minHeight: "56px !important",
    color: "#172624 !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    border: "1px solid #102D0C !important",
    background: "#fff !important",
    minWidth: "207px !important",
    "&:hover": {
      color: "#172624 !important",
      background: "#fff !important",
    },
    "@media (max-width: 540px)": {
      width: "-webkit-fill-available !important",
    },
  },
  Explore: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    background: "#172624 !important",
    minHeight: "56px !important",
    minWidth: "207px !important",
    "&:hover": {
      color: "#fff !important",
      background: "#172624 !important",
    },
    "@media (max-width: 540px)": {
      width: "-webkit-fill-available !important",
      marginTop: "20px !important",
    },
  },
  Explore2: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "12.2381px !important",
    lineHeight: "14px !important",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 14px !important",
    background: "#172624 !important",
    minHeight: "46px !important",
    minWidth: "57px !important",
    "&:hover": {
      color: "#fff !important",
      background: "#172624 !important",
    },
    "@media (max-width: 240px)": {
      width: "-webkit-fill-available !important",
      marginTop: "20px !important",
    },
  },
  twobtnBox: {
    display: "flex",
    gap: "16px",
    justifyContent: "end",
    paddingTop: "35px",
    "@media (max-width: 959px)": {
      paddingTop: "23px",
    },

    "@media (max-width: 540px)": {
      display: "block",
    },
  },
  alreadyAccount: {
    color: "rgba(0, 0, 0, 0.70) !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  newbox: {
    color: "#738611",
    fontWeight: "700",
    textDecoration: "underline",
    cursor: "pointer",
  },
  subMain: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "24px",
    lineHeight: "26px",
    color: "#000",
    marginBottom:"20px",
  },
  checkDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
    gap: "10px",
    "& .MuiSvgIcon-root": {
      color: "#172624 !important",
    },
  },
  newFlex: {
    display: "flex",
    gap: "30px",
    "@media (max-width: 599px)": {
      display: "grid",
      gap: "15px",
    },
  },
  zoomIcon: {
    "@media (max-width: 599px)": { display: "none" },
  },
  zoomIcon1: {
    display: "none",
    "@media (max-width: 599px)": { display: "block" },
  },
  positionBox: {
    position: "relative",
    "& .flexDiv": {
      display: "flex",
      justifyContent: "space-between",
    },
    "& .upperDiv": {
      position: "absolute",
      // padding: "20px 24px 20px 60px",
      bottom: "8px",
      // width: "-webkit-fill-available",
    },
    "& .divGrid": {
      display: "grid",
      gap: "5px",
      width: "max-content",
      float: "inline-end",
      right: "0",
      "& img": {
        cursor: "pointer",
      },
      "@media (max-width: 1160px)": {
        padding: "30px 20px 0px 0px !important",
      },
    },
    "& .cssdiv": {
      borderRadius: "8px",
      background: "#FFF",
      boxShadow: "0px 2px 8px 0px rgba(60, 64, 67, 0.20)",
      display: "grid",
      gap: "3px",
      alignItems: "center",
      justifyContent: "center",
      width: "28px",
      // margin: "0 8px",
      padding: "5px 0",
      borderRadius: "10px",
    },
    "& .divider": {
      borderBottom: "1px solid #DADCE0",
      marginTop: "5px",
    },
  },
  mainEffect: {
    display: "flex",
    alignItems: "center",
    background: "#172624",
    borderRadius: "8px 8px 8px 8px",
    "& .openDiv": {
      display: "none",
    },
    "&:hover": {
      "& .openDiv": {
        display: "block",
        minWidth: "50px",
        transition: "all 0.3s ease-in-out",
      },
      "& .homeIconCss": {
        borderRadius: "8px 0px 0px 8px",
      },
    },
  },
  homeIconCss: {
    background: "#172624",
    height: "42px",
    width: "42px",
    borderRadius: "8px 8px 8px 8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      borderRadius: "8px 0px 0px 8px",
    },
  },
  modelBox: {
    padding: "20px",
    width: "400px",
    height: "-webkit-fill-available",
    "@media (max-width: 599px)": {
      width: "300px",
    },
    "@media (max-width: 360px)": {
      width: "270px",
    },
    "& .flexDivTag": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    "& .divider": {
      width: "-webkit-fill-available !important",
      margin: "20px 0",
      borderBottom: "1px solid #A5B0B8",
    },
    "& .textTitle": {
      color: "#172624 !important",
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontSize: "36px !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      lineHeight: "42px !important",
      textTransform: "uppercase !important",
    },
  },
  LoginlabelSub: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "18px !important",
    fontStyle: "normal !important",
    fontWeight: "500 !important",
    lineHeight: "150% !important",
    marginBottom: "10px !important",
  },
  Loginlabelall: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
    marginBottom: "10px !important",
  },
  LoginTextBox: {
    borderRadius: "10px",
    background: " #fff",
    fontSize: "16px",
    color: "black",
    marginTop: "6px",

    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.50) !important",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "125%",
    },
    "& .MuiInputBase-input": {
      color: "black !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "16px",
      lineHeight: "125%",
      fontWeight: "400",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "18px 16px !important",
    },
  },
  Logintextfiled: {
    color: "#fff !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "12px",
    lineHeight: "24px",
    borderRadius: "10px",
    background: "#fff",
  },
  absoluteDiv: {
    position: "absolute",
    top: "65px",
    background: "rgb(255, 255, 255)",
    borderRadius: "10px",
    padding: "12px",
    width: "100%",
    maxWidth: "367px",
    maxHeight: "125px",
    overflow: "auto",
    zIndex: "1",
  },
  locationDiv: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  deleteButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    minHeight: "56px !important",
    minWidth: "auto !important",
    width: "-webkit-fill-available !important",
    color: "#E94444 !important",
    border: "1px solid #E94444 !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    background: "#fff !important",

    "&:hover": {
      color: "#E94444 !important",
      background: "#fff !important",
    },
    "@media (max-width: 540px)": {
      width: "-webkit-fill-available !important",
    },
  },
  postButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    background: "#172624 !important",
    minHeight: "56px !important",
    minWidth: "auto !important",
    width: "-webkit-fill-available !important",
    "&:hover": {
      color: "#fff !important",
      background: "#172624 !important",
    },
    "@media (max-width: 540px)": {
      width: "-webkit-fill-available !important",
      marginTop: "20px !important",
    },
  },
  ImportMainDiv: {
    position: "relative",
  },
  importTag: {
    position: "absolute",
    top: "0",
    zIndex: "1",
    width: "-webkit-fill-available",
    overflow: "hidden",
    height: "100%",
    opacity: "0",
  },
  circularProgress: {
    color: "#172624 !important",
  },
  loaderCss: {
    border: "8px solid #D19A1D",
    borderTop: "8px solid transparent",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    animation: "$spin 1s linear infinite",
    margin: "auto",
    marginTop: "20px",
  },
  imgCustom: {
    width: "100%",
    maxHeight: "200px",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  handlespace:{
    display:"none",
    "@media (max-width: 1163px)": {
      display:"-webkit-inline-box",
    },
  }
}));

export default function UaserListServices() {
  const classes = useStyles();
  const [Icon, setIcon] = useState("images/icons/defaultIconLogo.svg");
  const [open, setOpen] = useState(false);
  const [uploadData, setUploadData] = useState([]);
  const [userSProfileData, setUserSProfileData] = useState({});
  const [elementIndex, setElementIndex] = useState("");
  const [listData, setListData] = useState([]);
  const [csvLoader, setCsvLoader] = useState(false);
  const [newDataToUpload, setNewDataToUpload] = useState([]);
  const user = useContext(UserContext);
  const location = useLocation();
  const [submit, setSubmit] = useState(false);

  const childRef = useRef();
  useEffect(() => {
    setIcon(`${ApiConfig.imagGet}${userSProfileData?.logo}`);
  }, [userSProfileData?.logo]);

  useEffect(() => {
    getUserProfileData();
  }, []);


  const getUserProfileData = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.useryardprofile,
        headers: { Authorization: `Token  ${token}` },
        data: {
          user_id: location.state.userId,
        },
      });
      if (res.status === 200 || res.status === 201) {
        setIcon(`${ApiConfig.imagGet}${res.data?.logo}`);
        setUserSProfileData(res.data);
        // let picProfile = res.data?.image ?  `${ApiConfig.imagGet}${res.data?.image}` :""
        // setProfilePic(picProfile)
        setYardSignPostLimit(res.data?.feature_count);
      } else {
      }
    } catch (error) {
      if (
        error?.response?.data?.detail ==
        "No uploaded files found for this user."
      ) {
        // setSubmit(false);
      } else {
      }
    }
  };

  useEffect(() => {
    getUploadFile();
  }, []);
  const getUploadFile = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.useryards,
        headers: { Authorization: `Token  ${token}` },
        data: {
          user_id: location.state.userId,
        },
      });

      if (res.status === 200 || res.status === 201) {
        // setSubmit(true);

        setUploadData(res.data);
      } else {
      }
    } catch (error) {
      if (
        error?.response?.data?.detail ==
        "No uploaded files found for this user."
      ) {
        // setSubmit(false);
      } else {
      }
    }
  };

  useEffect(() => {
    // setListData(JSON.parse(localStorage.getItem("LocationData")) || []);
    setListData(uploadData);
  }, [uploadData]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPostYardSign, setOpenPostYardSign] = useState(false);
  const [openPostYardSignEdit, setOpenPostYardSignEdit] = useState(false);
  const [editData, setEditData] = useState([]);
  const [CsvFileData, setCsvFileData] = useState([]);
  const [CsvFileDataWithLatLog, setCsvFileDataWithLatLog] = useState([]);
  const [checked, setChecked] = useState(false);
  const [selectPosition, setSelectPosition] = useState("");
  const [geoCodeCompanyAdress, setGeoCodeCompanyAdress] = useState("");
  const [geoCodeCompanyAdressEdit, setGeoCodeCompanyAdressEdit] = useState("");
  const [uploadedFileName, setuploadedFileName] = useState("");
  const [isloading, setLoader] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [listItemsSearch, setListItemsSearch] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("Massachusetts");
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [screenLat, setsetScreenLat] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectError, setselectError] = useState(false);
  const [addressError, setaddressError] = useState(false);
  const [errorEditCompany, seterrorEditCompany] = useState(false);
  const [yardSignPostLimit, setYardSignPostLimit] = useState(0);
  const [profilePic, setProfilePic] = useState("");
  const [ImageVideo, setImageVideo] = useState([]);

    useEffect(() => {
      setProfilePic(
        userSProfileData?.image
          ? `${ApiConfig.imagGet}${userSProfileData?.image}`
          : ""
      );
    }, [userSProfileData?.image]);

  const handlesetLat = (values) => {
    setsetScreenLat(values);
  };
  const handlesetLatMap = (values) => {
    setsetScreenLat(values);
    const getAddressFromCoordinates = (latitude, longitude) => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Extract address from response
          const address = data.display_name;
          setGeoCodeCompanyAdress(address);
          setaddressError(false);
          // Do something with the address, such as updating state
          // setAddress(address);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

    // Call getAddressFromCoordinates with the provided values
    handleLatAndLog(values[0]?.latitude, values[0]?.longitude);
    getAddressFromCoordinates(values[0]?.latitude, values[0]?.longitude);
  };
  const handlesetLatMapEdit = (values) => {
    setsetScreenLat(values);
    const getAddressFromCoordinates = (latitude, longitude) => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Extract address from response
          const address = data.display_name;
          setGeoCodeCompanyAdressEdit(address);
          seterrorEditCompany(false);
          // Do something with the address, such as updating state
          // setAddress(address);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

    // Call getAddressFromCoordinates with the provided values
    handleLatAndLog(values[0]?.latitude, values[0]?.longitude);
    getAddressFromCoordinates(values[0]?.latitude, values[0]?.longitude);
  };
  const handleListLocation = async (values) => {
    try {
      const response = await fetch(
        `${
          ApiConfig.mapboxUrl
        }${values}.json?access_token=${"pk.eyJ1IjoiZ2VvZGFrYSIsImEiOiJjbHRoNnE2YWgwMXAxMmxwaG1wcnppZWphIn0.3YoeVGWEQ4Ux2ApJ_O23sQ"}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setListItemsSearch(result.features);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLatAndLog = (lat, long) => {
    if (!isNaN(lat) && !isNaN(long)) {
      setLongitude(long);
      setLatitude(lat);
      setselectError(false);
    } else {
      // toast.error(
      //   "Oops! Something went wrong. Please try again or select a different location."
      // );
      setselectError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const statesResponse = await Axios.get("/static/json/states.json");
      const statesData = statesResponse.data.states;

      if (selectedCountry) {
        const countryFromCode = countries.find(
          (data) => data.name == selectedCountry
        );

        if (true) {
          let CountryValue = "231";
          const statesOfSelectedCountry = statesData.filter(
            (state) => state.country_id === CountryValue
          );
          // setSelectedState("");
          setStates(statesOfSelectedCountry);
        }
      }
    };

    fetchData();
  }, [selectedCountry]);
  useEffect(() => {
    const fetchData = async () => {
      const statesResponse = await Axios.get("/static/json/cities.json");
      const cityData = statesResponse.data.cities;

      if (selectedState) {
        const stateFromCode = states.find((data) => data.name == selectedState);

        if (true) {
          let CountryValue =
            stateFromCode !== undefined ? stateFromCode.id : "3943";

          const cityOfSelectedState = cityData.filter(
            (city) => city.state_id === CountryValue
          );

          setSelectedCity("");
          setCities(
            cityOfSelectedState?.length !== 0
              ? cityOfSelectedState
              : [{ id: "00", name: selectedState, state_id: stateFromCode.id }]
          );
        }
      }
    };

    fetchData();
  }, [selectedState]);

  const navigate = useNavigate();

  const handleFormData = (values) => {
    if (geoCodeCompanyAdress === "") {
      setaddressError(true);
    } else {
      setaddressError(false);
      if (selectError) {
        toast.error(
          "Oops! Something went wrong. Please select a different Point."
        );
      } else {
        // setListData([
        //   ...listData,
        //   {
        //     address: values.companyAddress,
        //     city: user?.profile?.user_info?.city,
        //     latitude: latitude,
        //     longitude: longitude,
        //     sector: user?.profile?.profile?.sector_id,
        //     state: user?.profile?.user_info?.state,
        //     zipcode: user?.profile?.user_info?.zipcode,
        //   },
        // ]);
        // setNewDataToUpload([
        //   ...newDataToUpload,
        //   {
        //     address: values.companyAddress,
        //     city: user?.profile?.user_info?.city,
        //     latitude: screenLat[0].latitude,
        //     longitude: screenLat[0].longitude,
        //     sector: user?.profile?.profile?.sector_id,
        //     state: user?.profile?.user_info?.state,
        //     zipcode: user?.profile?.user_info?.zipcode,
        //   },
        // // ]);
        // setTimeout(() => {
        handleFormSubmit([
          {
            address: geoCodeCompanyAdress,
            // city: user?.profile?.user_info?.city,
            latitude: screenLat[0]?.latitude,
            longitude: screenLat[0]?.longitude,
            sector: user?.profile?.profile?.sector_id,
            // state: user?.profile?.user_info?.state,
            // zipcode: user?.profile?.user_info?.zipcode,
          },
        ]);
        // }, 100);
      }
    }
  };
  const handleEditFormData = (values) => {
    if (editData[0]?.id) {
      if (geoCodeCompanyAdressEdit === "") {
        seterrorEditCompany(true);
      } else {
        seterrorEditCompany(false);
        if (selectError) {
          toast.error(
            "Oops! Something went wrong. Please select a different Point."
          );
        } else {
          handleEditApi({
            id: editData[0]?.id,
            sector: editData[0]?.sector,
            latitude: screenLat[0].latitude,
            longitude: screenLat[0].longitude,
            address: geoCodeCompanyAdressEdit,
            company_name: editData[0].company_name,
            category_name: editData[0].category_name,
            user: editData[0].user,
          });
        }
      }
    } else {
      // setListData(newData);
      const newUploadData = newDataToUpload.map((data) => {
        if (data.address.trim() == editData[0]?.address.trim()) {
          return {
            ...data,
            address: values.companyAddress,
            latitude: screenLat[0].latitude,
            longitude: screenLat[0].longitude,
          };
        } else {
          return data;
        }
      });
      setNewDataToUpload(newUploadData);
      listData[editData[1]?.index].address = values.companyAddress;
      listData[editData[1]?.index].latitude = screenLat[0].latitude;
      listData[editData[1]?.index].longitude = screenLat[0].longitude;
      setOpenPostYardSignEdit(false);
    }
  };
  const handleFormSubmit = async (values) => {
    if (geoCodeCompanyAdress === "") {
      setaddressError(true);
    } else {
      setaddressError(false);
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("sector", user?.profile?.profile?.sector_name);
        formData.append("user_email", localStorage.getItem("email"));
        const res = await Axios.post(ApiConfig.useryardadd, values, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          params: { user_id: location.state.userId },
        });

        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          setLoader(false);
          getUploadFile();
          setChecked(false);
          setNewDataToUpload([]);
          setOpenPostYardSign(false);
        }
      } catch (error) {
        console.error(
          "ERROR",
          error.response ? error.response?.data?.error : error.message
        );
        setLoader(false);
        if (error.response && error.response?.data?.error) {
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later.");
        }
      }
    }
  };
  const handleDeleteApi = async (values) => {
    setLoader(true);
    setNewDataToUpload([]);
    const raw = JSON.stringify({
      id: values,
    });
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        `Token ${localStorage.getItem("token")}`
      );
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(ApiConfig.useryardremove, requestOptions);

      if (response.ok) {
        setLoader(false);
        setOpen(false);
        getUploadFile();
        toast.success("Location deleted successfully!");
        setOpenPostYardSignEdit(false);
      } else {
        setLoader(false);
        throw new Error("Failed to delete location");
      }
    } catch (error) {
      console.error("ERROR", error.message);
      setLoader(false);
      toast.error(
        error.message || "Something went wrong please try again later."
      );
    }
  };
  const handleEditApi = async (values) => {
    setLoader(true);
    // Assuming you have the values for the PUT request in the 'values' object
    const raw = JSON.stringify(values);
    setNewDataToUpload([]);
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        `Token ${localStorage.getItem("token")}`
      );
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(ApiConfig.useryardedit, requestOptions);

      if (response.ok) {
        setLoader(false);
        setOpenPostYardSignEdit(false);
        getUploadFile();
        setEditData([]);
        setGeoCodeCompanyAdressEdit("");
        setsetScreenLat([]);
        toast.success("Location edited successfully!");
      } else {
        setLoader(false);
        throw new Error("Failed to edit location");
      }
    } catch (error) {
      console.error("ERROR", error.message);
      setLoader(false);
      toast.error(
        error.message || "Something went wrong please try again later."
      );
    }
  };
  const formInitialSchema = {
    Zipcode: "",
    companyAddress: geoCodeCompanyAdress,
    // companyAddressContinued: "",
    // state: selectedState,
    // city: "",
  };

  const handleListLocationLatLog = async (address) => {
    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${address}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      // console.error("Error:", error);
      return [];
    }
  };
  //CSV DATA
  const handleFormSubmitCSV = async (values) => {
    setaddressError(false);
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("sector", user?.profile?.profile?.sector_name);
      formData.append("user_email", localStorage.getItem("email"));
      const res = await Axios.post(ApiConfig.useryardadd, values, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        params: { user_id: location.state.userId },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("You have successfully uploaded Post Yard Sign");
        setLoader(false);
        getUploadFile();
        setChecked(false);
        setNewDataToUpload([]);
        setOpenPostYardSign(false);
      }
    } catch (error) {
      console.error(
        "ERROR",
        error.response ? error.response?.data?.error : error.message
      );
      setLoader(false);
      if (error.response && error.response?.data?.error) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Something went wrong please try again later.");
      }
    }
  };
  const fetchLatLongForAddresses = async (formattedData) => {
    try {
      const updatedData = [];
      const latLog = [];

      let count = 0 + (listData?.length - 1 || 0); // Initialize a counter variable

      for (const data of formattedData) {
        setCsvLoader(true);
        if (count >= 12) {
          // If more than 12 data, break out of the loop
          break;
        }
        if (data?.Address) {
          const result = await handleListLocationLatLog(
            data.Address + " " + data.City + " " + data.State
          );

          const updatedDataItem = {
            ...data,
            lat: result?.features[0]?.geometry?.coordinates[1]
              ? result?.features[0]?.geometry?.coordinates[1]
              : "",
            lon: result?.features[0]?.geometry?.coordinates[0]
              ? result?.features[0]?.geometry?.coordinates[0]
              : "",
          };
          updatedData.push(updatedDataItem);
          latLog.push({
            lat: result?.features[0]?.geometry?.coordinates[1]
              ? result?.features[0]?.geometry?.coordinates[1]
              : "",
            lon: result?.features[0]?.geometry?.coordinates[0]
              ? result?.features[0]?.geometry?.coordinates[0]
              : "",
          });
          count++; // Increment the counter
        } else {
          toast.error("Address key not found in CSV file data.");
        }
      }
      setCsvFileDataWithLatLog(updatedData);
      setCsvLoader(false);
      let newData = updatedData.map((item) => ({
        sector: user?.profile?.profile?.sector_id || "--",
        latitude: item["lat"],
        longitude: item["lon"],
        zipcode: item["Zip Code"],
        state: item["State"],
        city: item["City"],
        address: item["Address"] + ", " + item["City"] + ", " + item["State"],
      }));
      const concatCount = Math.min(newData.length, 12 - (listData.length - 1));
      setNewDataToUpload(newData.slice(0, concatCount));
      handleFormSubmitCSV(newData.slice(0, concatCount));
      // let combinedArray = listData.concat(newData);
      // if (combinedArray.length > 12) {
      // setListData(combinedArray.slice(0, 12));
      // } else {
      // setListData(combinedArray);
      // }
    } catch (error) {
      // console.error("Error fetching latitudes and longitudes:", error);
      setCsvLoader(false);
    }
  };

  useEffect(() => {
    if (CsvFileData?.length > 0) {
      fetchLatLongForAddresses(CsvFileData);
      setCsvFileData([]);
    } else {
      setuploadedFileName("");
    }
  }, [CsvFileData]);

  const handleImportChange = (files) => {
    setuploadedFileName(files?.name || "");
    Papa.parse(files, {
      delimiter: "",
      chunkSize: 3,
      header: false,
      complete: function (responses) {
        const [headers, ...dataRows] = responses.data;
        const formattedData = dataRows.map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || "";
          });
          return rowData;
        });
        setCsvFileData(formattedData);
      },
    });
  };
  const confirmationHandler = () => {
    const newData = listData.filter((_, i) => i !== elementIndex);
    handleDeleteApi(elementIndex);
  };
  function downloadFile() {
    // CSV content
    const csvContent = `Address,City,State,Zip Code
     7 Towne Rd,Boxford,MA,1921
     607 Dutton St,Lowell,MA,1854
     175 Portland St 6,Boston,MA,2114
     138 Flint Locke Dr,Duxbury,MA,2332
     108 County Rd,Plympton,MA,2367
     31 Canal St,Medford,MA,2155`;

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    // Set the filename for the downloaded CSV file
    link.download = "example.csv";

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the body after the download
    document.body.removeChild(link);
  }
  useEffect(() => {
    
    getUploadData();
  }, []);

  const getUploadData = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "GET",
        url: `${ApiConfig.updateUserInfo}?user_id=${location.state.userId}`,
        headers: { Authorization: `Token  ${token}` },
      });
      if (res.status === 200 || res.status === 201) {
        setImageVideo(res.data);
      }
    } catch (error) {
      if (
        error?.response?.data?.detail ==
        "No uploaded files found for this user."
      ) {
        setSubmit(false);
      } else {
      }
    }
  };
  useEffect(() => {
    if (uploadData[0]?.latitude && uploadData[0]?.longitude) {
      localStorage.setItem("latitudeInnerMap", uploadData[0]?.latitude);
      localStorage.setItem("longitudeInnerMap", uploadData[0]?.longitude);
      localStorage.setItem("latitude", uploadData[0]?.latitude);
      localStorage.setItem("longitude", uploadData[0]?.longitude);
      // childRef.current.flyTo(
      //   fromLonLat([
      //     parseFloat(uploadData[0]?.longitude),
      //     parseFloat(uploadData[0]?.latitude),
      //   ]),
      //   () => {}
      // );
    }
  }, [uploadData[0]?.longitude, submit]);

  return (
    <Box className={classes.headbox}>
      {submit ? <UserSectorData ImageVideo={ImageVideo} 
      classes={classes}
      getUserProfileData={getUserProfileData} userSProfileData={userSProfileData}
      getUploadData={getUploadData} uploadData={uploadData} setSubmit={setSubmit} getUploadFile={getUploadFile}/> : 
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="SideBarBox">
            <Box className="firstBox">
              <div className="backgroundDiv">
                <div style={{ display: "grid", gap: "20px" }}>
                  <div className="imgMainDiv">
                    <div className="imgDiv">
                      <img
                        src={
                          profilePic
                            ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                              profilePic == `${ApiConfig.imagGet}/media/None`
                              ? "images/defaultPic.png"
                              : profilePic
                            : "images/defaultPic.png"
                        }
                        alt=""
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                        }}
                      />
                      {/* <img
                        src="images/editPen.svg"
                        alt=""
                        className="editImg"
                        onClick={() => {
                          navigate("/edit-profile", {
                            state: {
                              profileData: user?.profile,
                            },
                          });
                        }}
                      /> */}
                    </div>
                  </div>
                  <div>
                    <Typography
                      style={{ wordBreak: "break-all" }}
                      className="cardTitle"
                    >
                      {userSProfileData?.user_company_name || "--"}
                    </Typography>
                    <Typography
                      className="labelTitle"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        window.open(
                          `${userSProfileData?.user_company_website}`,
                          "_blank"
                        );
                      }}
                    >
                      {userSProfileData?.user_company_website || "--"}
                    </Typography>
                  </div>
                  {/* <Button
                    onClick={() => {
                      navigate("/edit-profile", {
                        state: {
                          profileData: user?.profile,
                        },
                      });
                    }}
                    className="editButton"
                  >
                    Edit Profile
                  </Button> */}
                </div>
              </div>

              <div className="buttonGroup">
                {/* <Button
                className="newButtoncss"
                onClick={() => {
                  setSubmit(false);
                }}
              >
                create my company yard sign
              </Button> */}
                <Button
                  className="newButtoncss"
                  onClick={() => {
                    setSubmit(true);
                  }}
                >
                  Edit/Revise My Company Yard Sign
                </Button>
                <Button
                  onClick={() => {
                    navigate("/user-details");
                  }}
                  className="newButtoncss"
                >
                  Back To Users Details
                </Button>

                {/* <Button
                  onClick={() => {
                    navigate("/my-subscriptions");
                  }}
                  className="newColorButtoncss"
                >
                  My Subscriptions
                </Button> */}
              </div>
            </Box>
            <Box className="SecondBox">
              <Box
                className="flexBox"
                style={{ marginBottom: "20px", gap: "8px" }}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginBottom: "10px" }}
                >
                  <div className="visible">
                    <img
                      src="images/editPen.svg"
                      alt=""
                      class="editImgDrawer"
                      onClick={() => {
                        setOpenDrawer(true);
                      }}
                    />
                  </div>
                  <div>
                    <Typography className="CardText">
                      You are viewing {location.state.userName}'s screen.
                    </Typography>
                    <br />
                    <Typography className="title">
                      Digital Yard Sign Dashboard
                    </Typography>
                    <Typography className="CardText">
                      Design - Revise - Place Your Yard Signs Here
                    </Typography>
                    <Typography className="CardText">
                      Current Use - {listData?.length - 1}/
                      {yardSignPostLimit || 0} Yard Signs Placed
                    </Typography>
                    {/* <Tooltip title="Coming Soon"> */}
                    {/* <IconButton> */}
                    {/* <Button
                      onClick={() => {
                        navigate("/my-subscriptions");
                      }}
                      className={"newColorButtoncss"}
                      style={{ minWidth: "auto", marginTop: "15px" }}
                    >
                      Buy More Now!{" "}
                    </Button> */}
                    {/* </IconButton> */}
                    {/* </Tooltip> */}
                  </div>
                </div>
                <div className="divFlex" style={{ alignItems: "center" }}>
                  {/* <Button
                  className="buttoncss"
                  disabled={(listData?.length - 1) > 11}
                  onClick={() => setOpenPostYardSign(true)}
                  style={{ minWidth: "auto" }}
                >
                  ADD MANUAL
                </Button> */}
                  <div className={classes.ImportMainDiv}>
                    <input
                      type="file"
                      onClick={() => {
                        setCsvFileData([]);
                        setCsvFileDataWithLatLog([]);
                        document.getElementById("fileInput").value = null;
                      }}
                      onChange={(event) => {
                        handleImportChange(event.target.files[0]);
                      }}
                      className={classes.importTag}
                      id="fileInput"
                    />
                    <Button
                      className="buttoncss"
                      style={{ width: "-webkit-fill-available" }}
                    >
                      {csvLoader ? (
                        <ButtonCircularProgress classes={classes} />
                      ) : (
                        `${
                          uploadedFileName
                            ? uploadedFileName?.length > 8
                              ? uploadedFileName?.slice(0, 8) + "..."
                              : uploadedFileName
                            : "Upload Excel Address File"
                        }`
                      )}
                    </Button>
                  </div>
                  <Button
                    className="buttonDownloadcss"
                    onClick={() => downloadFile()}
                  >
                    Download Example&nbsp;
                    <FaDownload />
                  </Button>
                </div>
              </Box>

              <Box>
                <Box className={classes.positionBox}>
                  {!openPostYardSign && !openPostYardSignEdit && (
                    <div style={{ height: "226px" }}>
                      <MyServicesMap
                        type="ViewServices"
                        ref={childRef}
                        listItems={listItems}
                        imgIcon={Icon}
                        listData={listData}
                        selectItem={"nnn"}
                        handleLatAndLog={handleLatAndLog}
                        CsvFileDataWithLatLog={CsvFileDataWithLatLog}
                        submit={submit}
                      />
                    </div>
                  )}
                  <div>
                    <div className="flexDiv">
                      <div
                        className="upperDiv gapBox"
                        style={{ padding: "25px 0px 0 40px" }}
                      ></div>
                      <div
                        className="divGrid upperDiv"
                        style={{ padding: "20px 23px 0px 0" }}
                      >
                        <img
                          src="images/yourLocationMini.svg"
                          alt="#"
                          onClick={() => {
                            childRef.current.getCurrentLocation();
                          }}
                        />

                        <div className="cssdiv">
                          <FaPlus
                            style={{
                              color: "#000000",
                              fontSize: "16px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              childRef.current.handleZoomIn();
                            }}
                          />
                          <div className="divider"></div>
                          <FaMinus
                            style={{
                              color: "#000000",
                              fontSize: "16px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              childRef.current.handleZoomOut();
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
                <div
                  style={{
                    width: "-webkit-fill-available",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                  className="backGroundCard"
                >
                  {/* <img
                  src={"images/defaultOrganization.jpg"}
                  alt=""
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "10px",
                  }}
                /> */}
                  <div>
                    <Typography className="cardTitle">
                      {userSProfileData?.user_company_name || "--"}
                    </Typography>
                    <Typography className="CardText">
                      {userSProfileData?.sector_name || "--"}
                    </Typography>
                  </div>
                </div>
                {listData && listData?.length !== 0
                  ? listData?.map((values, index) => {
                      return (
                        <Box className="backGroundCard">
                          <div className="alignDiv">
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <img src="images/markerLocation.svg" alt="" />
                              <Typography
                                className="CardText"
                                style={{ fontSize: "14px" }}
                              >
                                {`${values.address}`}
                              </Typography>
                            </div>
                            <div className={classes.newFlex}>
                              <img
                                src={
                                  values.latitude && values.longitude
                                    ? userSProfileData?.feature_count === 0
                                      ? "images/zoomToMapRed.svg"
                                      : userSProfileData?.feature_count >= index
                                      ? "images/zoomToMap.svg"
                                      : "images/zoomToMapRed.svg"
                                    : "images/zoomToMapRed.svg"
                                }
                                alt=""
                                className={classes.zoomIcon}
                                onClick={() => {
                                  if (values.latitude && values.longitude) {
                                    childRef.current.flyTo(
                                      fromLonLat([
                                        parseFloat(values.longitude),
                                        parseFloat(values.latitude),
                                      ]),
                                      () => {}
                                    );
                                  }
                                }}
                              />
                              <img
                                src="images/zoomIcon.svg"
                                alt=""
                                className={classes.zoomIcon1}
                              />
                              <img
                                src="images/PencilSimple.svg"
                                alt=""
                                onClick={() => {
                                  setOpenPostYardSignEdit(true);
                                  setElementIndex(values.id);
                                  setCsvFileDataWithLatLog([]);
                                  document.getElementById("fileInput").value =
                                    null;
                                  setEditData([values, { index: index }]);
                                  setGeoCodeCompanyAdressEdit(values.address);
                                  setTimeout(() => {
                                    handlesetLat([
                                      {
                                        longitude: parseFloat(values.longitude),
                                        latitude: parseFloat(values.latitude),
                                      },
                                    ]);
                                  }, 100);
                                }}
                              />
                              {index === 0 && (
                                <div
                                  style={{ width: "32px", height: "38px" }}
                                ></div>
                              )}
                              {index !== 0 && (
                                <img
                                  src="images/TrashSimple.svg"
                                  alt=""
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    if (values?.id) {
                                      setElementIndex(values.id);
                                      setOpen(true);
                                    } else {
                                      const newData = listData.filter(
                                        (_, i) => i !== index
                                      );
                                      setListData(newData);
                                      const newUploadData =
                                        newDataToUpload.filter(
                                          (data, i) =>
                                            data.address != values.address
                                        );
                                      setNewDataToUpload(newUploadData);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </Box>
                      );
                    })
                  : ""}
              </Box>
              <Box style={{ marginTop: "25px" }}>
                {/* <div className={classes.checkDiv}>
                <Checkbox
                  type="checkbox"
                  name="check"
                  onChange={() => {
                    setChecked((prevState) => !prevState);
                  }}
                  value={checked}
                  checked={checked}
                  style={{ width: "20px", height: "20px" }}
                />
                <Typography className={classes.alreadyAccount}>
                  By clicking you agree to the{" "}
                  <span
                    onClick={() => {
                      window.open("/terms&condition", "_blank");
                    }}
                    className={classes.newbox}
                  >
                    Terms & Condition
                  </span>{" "}
                  and{" "}
                  <span
                    onClick={() => {
                      window.open("/posting-rules", "_blank");
                    }}
                    className={classes.newbox}
                  >
                    Posting Rules.
                  </span>
                </Typography>
              </div> */}
                <Box className={classes.twobtnBox}>
                  <Button
                    disabled={listData?.length - 1 > 11}
                    onClick={() => setOpenPostYardSign(true)}
                    className={classes.transButton}
                  >
                    Add Another
                  </Button>
                  {/* <Button
                  className={classes.Explore}
                  disabled={isloading}
                  onClick={handleFormSubmit}
                >
                  Submit {isloading && <ButtonCircularProgress />}
                </Button> */}
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
        {openDrawer && (
          <Drawer
            anchor={"left"}
            open={openDrawer}
            onClose={() => {
              setOpenDrawer(false);
            }}
            classes={{
              paper: classes.headbox, // Apply your makeStyles class to the paper prop
            }}
            style={{ paddingTop: "0px" }}
          >
            <Box style={{ maxWidth: "300px" }}>
              <div className="backgroundDiv">
                <div style={{ display: "grid", gap: "20px" }}>
                  <div className="imgMainDiv">
                    <div className="imgDiv">
                      <img
                        src={
                          profilePic
                            ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                              profilePic == `${ApiConfig.imagGet}/media/None`
                              ? "images/defaultPic.png"
                              : profilePic
                            : "images/defaultPic.png"
                        }
                        alt=""
                        style={{
                          width: "200px",
                          height: "200px",
                          borderRadius: "50%",
                        }}
                      />
                      {/* <img
                        src="images/editPen.svg"
                        alt=""
                        className="editImg"
                        onClick={() => {
                          navigate("/edit-profile", {
                            state: {
                              profileData: user?.profile,
                            },
                          });
                        }}
                      /> */}
                    </div>
                  </div>
                  <div>
                    <Typography>
                      {userSProfileData?.user_company_name || "--"}
                    </Typography>
                    <Typography
                      className="labelTitle"
                      style={{ cursor: "pointer", color: "" }}
                      onClick={() => {
                        window.open(
                          `${userSProfileData?.user_company_website}`,
                          "_blank"
                        );
                      }}
                    >
                      {userSProfileData?.user_company_website
                        ? userSProfileData?.user_company_website
                        : "--"}
                    </Typography>
                  </div>
                  {/* <Button
                    onClick={() => {
                      navigate("/edit-profile", {
                        state: {
                          profileData: user?.profile,
                        },
                      });
                    }}
                    className="editButton"
                  >
                    Edit Profile
                  </Button> */}
                </div>
              </div>

              <div className="buttonGroup">
                {/* <Button className="newButtoncss">
                create my company yard sign
              </Button> */}
                <Button
                  onClick={() => {
                    setSubmit(true);
                  }}
                  className="newButtoncss"
                >
                  Edit/Revise My Company Yard Sign
                </Button>
                <Button
                  onClick={() => {
                    navigate("/user-details");
                  }}
                  className="newButtoncss"
                >
                  Back To Users Details
                </Button>
                {/* <Button className="newButtoncss">
                <span>
                  Post company yard sign <br />{" "}
                  <span style={{ color: "#D19A1D" }}>
                    {" "}
                    “60 days free trail”
                  </span>
                </span>
              </Button> */}
                {/* <Tooltip title="Coming Soon">
                  <Button
                    className="newColorButtoncss"
                    style={{ marginBottom: "30px" }}
                    onClick={() => {
                      navigate("/my-subscriptions");
                    }}
                  >
                    My Subscriptions
                  </Button>
                </Tooltip> */}
              </div>
            </Box>
          </Drawer>
        )}

        {openPostYardSign && (
          <Drawer
            anchor={"right"}
            open={openPostYardSign}
            // onClose={() => {
            //   setOpenPostYardSign(false);
            // }}
            classes={{
              paper: classes.modelBox, // Apply your makeStyles class to the paper prop
            }}
            style={{ padding: "20px" }}
          >
            <Box style={{ minWidth: "300px" }}>
              <div className="flexDivTag">
                <Typography className="textTitle">Post Yard Sign</Typography>
                <img
                  src="images/XCircleCross.svg"
                  alt="X"
                  onClick={() => {
                    // setGeoCodeCompanyAdress("");
                    // childRef.current.removeAllIcons();
                    // setsetScreenLat([]);
                    setOpenPostYardSign(false);
                    setaddressError(false);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div className="divider"></div>
              <Box className={classes.positionBox}>
                <div style={{ height: "280px" }}>
                  <MyServicesMap
                    type="UploadServices"
                    ref={childRef}
                    listItems={listItems}
                    imgIcon={Icon}
                    screenLat={screenLat}
                    selectError={selectError}
                    handleLatAndLog={handleLatAndLog}
                    handlesetLatMap={handlesetLatMap}
                  />
                </div>
                <div>
                  <div className="flexDiv">
                    <div
                      className="upperDiv gapBox"
                      style={{ padding: "25px 0px 0 40px" }}
                    ></div>
                    <div
                      className="divGrid upperDiv"
                      style={{ padding: "20px 23px 0px 0" }}
                    >
                      <img
                        src="images/yourLocationMini.svg"
                        alt="#"
                        onClick={() => {
                          childRef.current.getCurrentLocation();
                        }}
                      />

                      <div className="cssdiv">
                        <FaPlus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomIn();
                          }}
                        />
                        <div className="divider"></div>
                        <FaMinus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomOut();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
              <Formik
                onSubmit={(values) => handleFormData(values)}
                initialValues={formInitialSchema}
                initialStatus={{
                  success: false,
                  successMsg: "",
                }}
                validationSchema={yep.object().shape({
                  // Zipcode: yep.string().required("Please enter zip code"),
                  // companyAddress: yep
                  //   .string()
                  // .required("Please enter your company's address"),
                  // companyAddressContinued: yep.string(),
                  // state: yep.object().nullable(),
                  // // .required("Select a state"),
                  // city: yep.string().required("Please enter your city"),
                })}
              >
                {({
                  errors,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  touched,
                  values,
                  setFieldValue,
                }) => (
                  <Form>
                    <Box item style={{ marginTop: "22px" }}>
                      <Typography className={classes.Loginlabelall}>
                        Yard Sign Address
                        <span style={{ color: "#FE3B3B" }}>*</span>
                      </Typography>
                      <div style={{ position: "relative" }}>
                        <TextField
                          placeholder="Enter Full Address"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={geoCodeCompanyAdress}
                          name="companyAddress"
                          className={classes.LoginTextBox}
                          error={Boolean(addressError)}
                          onBlur={handleBlur}
                          onChange={(e) => {
                            handleListLocation(e.target.value);
                            // setFieldValue("companyAddress", e.target.value);
                            setGeoCodeCompanyAdress(e.target.value);
                          }}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        {listItemsSearch?.length > 0 && (
                          <div className={classes.absoluteDiv}>
                            {listItemsSearch?.map((item) => {
                              return (
                                <div
                                  key={item?.osm_id}
                                  style={{ background: "#fff" }}
                                >
                                  <div
                                    className={classes.locationDiv}
                                    onClick={() => {
                                      setSelectPosition(item);
                                      handlesetLat([
                                        {
                                          longitude:
                                            item?.geometry?.coordinates[0],
                                          latitude:
                                            item?.geometry?.coordinates[1],
                                        },
                                      ]);
                                      setGeoCodeCompanyAdress(item?.place_name);
                                      setListItems([item]);
                                      // setFieldValue(
                                      //   "companyAddress",
                                      //   item?.place_name
                                      // );
                                      setListItemsSearch([]);
                                      setaddressError(false);
                                    }}
                                  >
                                    <div>
                                      <HiLocationMarker
                                        style={{ fontSize: "18px" }}
                                      />
                                    </div>
                                    <Typography>{item?.place_name}</Typography>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {addressError && (
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {"Please enter your company's address"}
                        </FormHelperText>
                      )}
                    </Box>

                    <Box className={classes.twobtnBox}>
                      <Button
                        onClick={() => {
                          setOpenPostYardSign(false);
                          // toast.success("Location deleted successfully!");
                        }}
                        className={classes.deleteButton}
                      >
                        Delete
                      </Button>
                      <Button
                        className={classes.postButton}
                        disabled={isloading}
                        type="submit"
                      >
                        Post {isloading && <ButtonCircularProgress />}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </Drawer>
        )}

        {openPostYardSignEdit && (
          <Drawer
            anchor={"right"}
            open={openPostYardSignEdit}
            // onClose={() => {
            //   setOpenPostYardSignEdit(false);
            // }}
            classes={{
              paper: classes.modelBox, // Apply your makeStyles class to the paper prop
            }}
            style={{ padding: "20px" }}
          >
            <Box style={{ minWidth: "300px" }}>
              <div className="flexDivTag">
                <Typography className="textTitle">Post Yard Sign</Typography>
                <img
                  src="images/XCircleCross.svg"
                  alt="X"
                  onClick={() => {
                    // setGeoCodeCompanyAdressEdit("");
                    // childRef.current.removeAllIcons();
                    // setsetScreenLat([]);
                    // seterrorEditCompany(false);
                    setOpenPostYardSignEdit(false);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div className="divider"></div>
              <Box className={classes.positionBox}>
                <div style={{ height: "280px" }}>
                  <MyServicesMap
                    type="UploadServices"
                    ref={childRef}
                    listItems={listItems}
                    imgIcon={Icon}
                    screenLat={screenLat}
                    selectError={selectError}
                    handleLatAndLog={handleLatAndLog}
                    handlesetLatMap={handlesetLatMapEdit}
                  />
                </div>
                <div>
                  <div className="flexDiv">
                    <div
                      className="upperDiv gapBox"
                      style={{ padding: "25px 0px 0 40px" }}
                    ></div>
                    <div
                      className="divGrid upperDiv"
                      style={{ padding: "20px 23px 0px 0" }}
                    >
                      <img
                        src="images/yourLocationMini.svg"
                        alt="#"
                        onClick={() => {
                          childRef.current.getCurrentLocation();
                        }}
                      />

                      <div className="cssdiv">
                        <FaPlus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomIn();
                          }}
                        />
                        <div className="divider"></div>
                        <FaMinus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomOut();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
              <Formik
                onSubmit={(values) => handleEditFormData(values)}
                initialValues={{
                  // Zipcode: editData[0]?.zipcode || "",
                  companyAddress: editData[0]?.address || "",
                  companyAddressContinued: "",
                  // state: editData[0]?.state || "",
                  // city: editData[0]?.city || "",
                }}
                initialStatus={{
                  success: false,
                  successMsg: "",
                }}
                validationSchema={yep.object().shape({
                  // Zipcode: yep.string(),
                  // companyAddress: yep.string(),
                  // .required("Please enter your company's address"),
                  // companyAddressContinued: yep.string(),
                  // state: yep.object().nullable(),
                  // // .required("Select a state"),
                  // city: yep.string(),
                })}
              >
                {({
                  errors,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  touched,
                  values,
                  setFieldValue,
                }) => (
                  <Form>
                    <Box item style={{ marginTop: "22px" }}>
                      <Typography className={classes.Loginlabelall}>
                        Yard Sign Address
                        <span style={{ color: "#FE3B3B" }}>*</span>
                      </Typography>
                      <div style={{ position: "relative" }}>
                        <TextField
                          placeholder="Enter Full Address"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={geoCodeCompanyAdressEdit}
                          name="companyAddress"
                          className={classes.LoginTextBox}
                          error={Boolean(errorEditCompany)}
                          onBlur={handleBlur}
                          onChange={(e) => {
                            handleListLocation(e.target.value);
                            setGeoCodeCompanyAdressEdit(e.target.value);
                          }}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        {listItemsSearch?.length > 0 && (
                          <div className={classes.absoluteDiv}>
                            {listItemsSearch?.map((item) => {
                              return (
                                <div
                                  key={item?.osm_id}
                                  style={{ background: "#fff" }}
                                >
                                  <div
                                    className={classes.locationDiv}
                                    onClick={() => {
                                      setSelectPosition(item);

                                      handlesetLat([
                                        {
                                          longitude:
                                            item?.geometry?.coordinates[0],
                                          latitude:
                                            item?.geometry?.coordinates[1],
                                        },
                                      ]);
                                      // setFieldValue(
                                      //   "companyAddress",
                                      //   item?.place_name
                                      // );
                                      setGeoCodeCompanyAdressEdit(
                                        item?.place_name
                                      );
                                      setListItems([item]);
                                      setListItemsSearch([]);
                                    }}
                                  >
                                    <div>
                                      <HiLocationMarker
                                        style={{ fontSize: "18px" }}
                                      />
                                    </div>
                                    <Typography>{item?.place_name}</Typography>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {errorEditCompany && (
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          Please enter your company's address
                        </FormHelperText>
                      )}
                    </Box>

                    <Box className={classes.twobtnBox}>
                      <Button
                        disabled={isloading}
                        onClick={() => {
                          //   handleDeleteApi(elementIndex);
                        }}
                        className={classes.deleteButton}
                      >
                        Delete{isloading && <ButtonCircularProgress />}
                      </Button>
                      <Button
                        className={classes.postButton}
                        disabled={isloading}
                        type="submit"
                      >
                        Post {isloading && <ButtonCircularProgress />}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </Drawer>
        )}
        {open && (
          <ConfirmationDialog
            open={open}
            handleClose={() => setOpen(false)}
            title={"Delete"}
            desc={"Do you want to delete this location ?"}
            confirmationHandler={confirmationHandler}
            isloading={isloading}
          />
        )}
      </Grid>}
    </Box>
  );
}
