import {
  Box,
  Button,
  FormControl,
  Grid,
  Autocomplete,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { FaFilter } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { makeStyles } from "@mui/styles";
import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { fromLonLat } from "ol/proj";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdArrowDropdown } from "react-icons/io";
import Axios from "axios";
import { IoIosArrowForward } from "react-icons/io";
import { toast } from "react-toastify";
import ApiConfig from "../config/ApiConfig";
import MapLayer from "./MapLayer";

const useStyles = makeStyles((theme) => ({
  headbox: {
    "& .openBoxTag": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "24px",
      background: "#fff",
      borderRadius: "8px",
      maxWidth: "50%",
    },

    "& .buttonCss": {
      borderRadius: "8px",
      background: "#172624",
      padding: "12px",
      minWidth: "100px",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "150%",
      color: "#fff",
      boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
    },
    "& .buttonCssDisagree": {
      borderRadius: "8px",
      padding: "12px",
      border: "1px solid #858D9D",
      color: "#858D9D",
      minWidth: "100px",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "150%",
      boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
    },
    "& .MuiDialog-paperWidthSm": {
      maxWidth: "504px",
      borderRadius: "9px",
    },
    "& .mainBox": {
      position: "relative",
    },
    "& .upperDiv": {
      position: "absolute",
      // padding: "20px 24px 20px 60px",
      top: "0",
      // width: "-webkit-fill-available",
    },
    "& .flexDiv": {
      display: "flex",
      justifyContent: "space-between",
    },
    "& .body": {
      fontFamily: "Big Shoulders Display",
      fontSize: "27px",
      fontWeight: 900,
      lineHeight: "38px",
    },
    "& .mainDiv": {
      display: "flex",
      gap: "32px",
    },
    "& .body1": {
      fontSize: "20px",
      fontWeight: 500,
      color: "#00000080",
      lineHeight: "25px",
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
      padding: "30px 20px 0px 0px !important",
      "@media (max-width: 1160px)": {
        padding: "18px 20px 0px 0px !important",
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
      width: "32px",
      padding: "5px",
    },
    "& .divider": {
      borderBottom: "1px solid #DADCE0",
      marginTop: "5px",
    },
    "& .gapBox": {
      display: "flex",
      gap: "20px",
      "@media (max-width: 1160px)": {
        padding: "10px 0px 0px 20px !important",
      },
      "@media (max-width: 1125px)": {
        display: "block",
      },
      "@media (max-width: 860px)": {
        padding: "17px 0px 0px 20px !important",
      },
    },
  },
  handleWidth: {
    // maxHeight: "calc(100vh - 137px)",
    overflow: "auto",
    "@media (max-width: 1083px)": {
      // maxHeight: "calc(100vh - 207px)",
    },
  },
  manageCategoryIcon: {
    display: "none",
    "@media (max-width: 860px)": {
      display: "block",
    },
  },
  categoryButon: {
    color: " #102D0C !important",
    border: "1px solid #D19A1D !important",
    cursor: "pointer !important",
    padding: "6px 16px !important",
    fontSize: "12.2381px !important",
    background: "#D19A1D !important",
    fontStyle: "normal !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontWeight: "700 !important",
    lineWeight: " 18px !important",
    borderRadius: "6px !important",
    width: "-webkit-fill-available",
  },
  manageCategory: {
    display: "flex",
    gap: "12px",
    alignItems: "self-start",
    overflow: "auto",
    width: "max-content",
    "@media (max-width: 1083px)": {
      display: "grid",
      gap: "8px",
    },
    "@media (max-width: 860px)": {
      display: "none",
    },
    "& .button": {
      borderRadius: "24px",
      background: "#fff",
      padding: "12px",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "150%",
      color: "#172624",
      boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
      "@media (max-width: 1125px)": {
        display: "none",
      },
    },
    "& .Activebutton": {
      borderRadius: "24px",
      background: "#172624",
      padding: "12px",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "150%",
      color: "#fff",
      boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
      "@media (max-width: 1125px)": {
        display: "none",
      },
    },
  },
  LoginTextBox: {
    borderRadius: "24px",
    background: " #fff",
    fontSize: "16px",
    color: "black",
    // marginTop: "19px",
    width: "-webkit-fill-available",
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
      padding: "12px 24px !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "12px 24px !important",
    },
  },
  TextBoxFormControlOpen: {
    minWidth: "150px",
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
      // minWidth: "216px !important",
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
  TextBoxFormControl: {
    minWidth: "135px",
    maxHeight: "250px",
    "@media (max-width: 340px)": {
      minWidth: "118px",
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
      // minWidth: "216px !important",
      marginTop: "8px",
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
  absoluteDiv: {
    position: "absolute",
    top: "50px",
    background: "rgb(255, 255, 255)",
    borderRadius: "10px",
    padding: "12px",
    width: "100%",
    maxWidth: "252px",
    maxHeight: "125px",
    overflow: "auto",
    zIndex: "1",
    "@media (max-width: 860px)": {
      top: "215px",
    },
  },
  locationDiv: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  SwipeableDrawer: {
    width: "475px",
    "@media (max-width: 520px)": {
      width: "300px",
    },
    // boxShadow: "0px 10px 30px 0px rgba(0, 0, 0, 0.10)",
    background: "#fff",
    marginTop: "50px",
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
      fontSize: "30px !important",
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
      overflow: "auto",
      marginTop: "10px",
    },
    "& .dividerin": {
      borderBottom: "1px solid #BFD9D5",
      margin: "25px 0",
    },
    "& .newCard": {
      width: "-webkit-fill-available",
      background: "#ECF3F2",
      borderRadius: "8px",
      display: "grid",
      justifyContent: "center",
      gap: "8px",
      padding: "10px",
      marginTop: "30px",
      marginRight: "24px",
    },
  },
  buttonCss1: {
    borderRadius: "8px",
    background: "#5572FF",
    padding: "12px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    width: "100%",
    fontSize: "14px",
    lineHeight: "150%",
    color: "#fff",
    boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
    "&:hover": {
      background: "#5572FF",
      color: "#fff",
    },
  },
  Activebutton: {
    borderRadius: "8px",
    background: "#172624",
    padding: "12px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14px",
    lineHeight: "150%",
    color: "#fff",
    textTransform: "uppercase",
    boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
    "&:hover": {
      background: "#172624",
      color: "#fff",
    },
  },
  cta: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    border: "none",
    borderRadius: "0 8px 8px 0",
    background: "rgb(23, 38, 36)",
    width: "30px",
    height: "42px",
    transition: "all 0.3s ease-in-out",
    padding: "13px 0",
    overflow: "hidden",
    "& .listDiv": {
      display: "none",
    },
    "&:hover": {
      width: "160px",
      "& .listDiv": {
        display: "grid",
      },
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  },
  homeIconCss: {},

  mainEffect: {
    display: "flex",
    alignItems: "center",
    background: "#172624",
    borderRadius: "8px 8px 8px 8px",
    transition: "all 0.3s ease-in-out",
    width: "43px",
    "& .openDiv": {
      display: "none",
    },
    "&:hover": {
      width: "160px",
      "& .listDiv": {
        display: "grid",
      },
      "& .openDiv": {
        display: "block",
        minWidth: "50px",
        transition: "all 0.3s ease-in-out",
      },
    },
    "& .homeIconCss": {
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
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    "& .cta": {
      display: "flex",
      gap: "5px",
      alignItems: "center",
      border: "none",
      borderRadius: "0 8px 8px 0",
      background: "rgb(23, 38, 36)",
      width: "fit-content",
      height: "42px",
      transition: "all 0.3s ease-in-out",
      padding: "13px 10px 13px 0px",
      overflow: "hidden",
      "& .listDiv": {
        display: "none",
      },
      "&:hover": {
        // width: "160px",
        "& .listDiv": {
          display: "grid",
        },
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    imgCustom: {
      width: "100%",
      maxHeight: "300px",
    },
  },
  mainEffectNew1: {
    display: "block",
    alignItems: "start",
    background: "#fff",
    borderRadius: "8px 8px 8px 8px",
    transition: "all 0.3s ease-in-out",
    height: "217px",
    width: "305px",
    "@media (max-width: 410px)": {
      width: "270px",
    },
    "@media (max-width: 360px)": {
      width: "220px",
    },
    "& .openDiv": {
      display: "block",
      marginTop: "10px",
      minWidth: "50px",
      transition: "all 0.3s ease-in-out",
    },
    "& .listDiv": {
      display: "grid",
    },
    "&:hover": {},
    "& .homeIconCss": {
      background: "#fff",
      borderRadius: "8px 8px 8px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      "&:hover": {
        borderRadius: "8px 0px 0px 8px",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    "& .cta": {
      display: "flex",
      gap: "5px",
      alignItems: "center",
      border: "none",
      borderRadius: "0 8px 8px 0",
      background: "rgb(23, 38, 36)",
      width: "fit-content",
      height: "42px",
      transition: "all 0.3s ease-in-out",
      padding: "13px 10px 13px 0px",
      overflow: "hidden",
      "& .listDiv": {
        display: "grid",
      },
      "&:hover": {
        // width: "160px",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },

    imgCustom: {
      width: "100%",
      maxHeight: "300px",
    },
  },
  dialogDiv: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    marginTop: "16px",
    height: "40px",
  },
  mainDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  headingDiv: {
    display: "flex",
    justifyContent: "space-between",
  },
  mainEffectNew: {
    display: "grid",
    alignItems: "start",
    background: "#fff",
    borderRadius: "8px 8px 8px 8px",
    transition: "all 0.3s ease-in-out",
    height: "36px",
    width: "36px",
    "& .openDiv": {
      display: "none",
    },
    "& .homeIconCss": {
      background: "#fff",
      borderRadius: "8px 8px 8px 8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      "&:hover": {
        borderRadius: "8px 0px 0px 8px",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    "& .cta": {
      display: "flex",
      gap: "5px",
      alignItems: "center",
      border: "none",
      borderRadius: "0 8px 8px 0",
      background: "rgb(23, 38, 36)",
      width: "fit-content",
      height: "42px",
      transition: "all 0.3s ease-in-out",
      padding: "13px 10px 13px 0px",
      overflow: "hidden",
      "& .listDiv": {
        display: "none",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    imgCustom: {
      width: "100%",
      maxHeight: "300px",
    },
  },
  loaderCss: {
    width: "-webkit-fill-available",
    height: "270px",
    backgroundColor: "rgb(255,255,255,0.3)",
    marginBottom: "-300px",
    animation: "$flowAnimation 2s infinite linear",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  "@keyframes flowAnimation": {
    "0%": {
      transform: "translateX(-100%)",
    },
    "100%": {
      transform: "translateX(100%)",
    },
  },
  skeletonLoaderDiv: {
    zIndex: "2000",
    position: "relative",
    backgroundColor: "#ECF3F2",
    width: "-webkit-fill-available",
  },
  TextBox: {
    maxHeight: "250px",
  },
  textBox: {
    fontSize: "12px",
    "& .MuiOutlinedInput-input": {
      padding: "10px 16px !important",
    },
  },
  dropdownPaper: {},
  dropdownPaperOpen: {
    width: "auto",
    "@media (max-width: 430px)": {
      width: "220px",
    },
  },
  textBoxFormControl: {
    position: "relative",
  },
  input: {
    width: "210px",
  },
  extendedInput: {
    width: "275px",
  },
  seachBoxPosition: {
    position: "relative",
    marginTop: "-83px",
    marginRight: "150px",
    "@media (max-width: 860px)": {
      display: "none",
    },
  },
  seachBoxPositionNew: {
    display: "none",
    "@media (max-width: 860px)": {
      display: "block",
    },
  },
  extendedInput1: {
    width: "100%",
  },
  drawerRight: {
    "& .MuiDrawer-paperAnchorRight": {
      background: "#172624",
      padding: "30px 20px",
      height: "-webkit-fill-available",
    },
  },
  newBorder: {
    padding: "5px 2px",
    border: "1px solid rgb(0, 0, 0, 0.3)",
    borderRadius: "15px",
    display: "flex",
    gap: "3px",
    marginTop: "5px",
    alignItems: "center",
    minWidth: "84.4px",
    justifyContent: "space-around",
  },
  largeText: {
    color: "#fff !important",
    textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "32px !important",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "51px !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "38px !important",
      lineHeight: "44px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "26px !important",
      lineHeight: "35px !important",
    },
  },
  headerBar: {
    minHeight: "60px",
    backgroundColor: "#033731",
    display: "flex",
    alignItems: "center",
    backgroundRepeat: "repeat",
    backgroundSize: "auto",
    justifyContent: "center",
  },
  logoutButton: {
    gap: "10px",
    cursor: "pointer",
    display: "flex",
    padding: "14px 18px !important",
    position: "relative",
    background: "#D19A1D",
    alignItems: "center",
    borderRadius: "6px",
    justifyContent: "center",
    color: "white",
    marginRight: "0.5%",
  },
}));

export default function MapDashboard() {
  const classes = useStyles();
  const childRef = useRef();
  const [resetCall, setresetCall] = useState(false);
  const [sectorId, setSectorId] = useState();

  const location = useLocation();
  const [openDrawerContent, setOpenDrawerContent] = useState(false);
  const [openBox, setopenBox] = useState(false);
  const [showNewMap, setShowNewMap] = useState(false);
  const [updateCheck, setUpdateCheck] = useState(false);
  const [companyDetails, setCompanyDetails] = useState("");
  const [sectorList, setSectorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [consumerInfoData, setConsumerInfoData] = useState({
    file: [],
    user_info: [],
  });
  const [searchInput, setSearchInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCustomDrop, setOpenCustomDrop] = useState(false);
  const filteredSectors = sectorList.filter((data) =>
    data.sector_name.toLowerCase().includes(searchInput.toLowerCase())
  );
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setMenuOpen(true);
  };

  const handleSelectChange = (cateId, sectorId) => {
    childRef.current.handleClick(cateId, sectorId);
  };
  const handleDrawerClose = () => {
    setOpenDrawerContent(false);
  };
  const [companyAllDetails, setCompanyAllDetails] = useState({
    country: "--",
    x: "--",
    y: "--",
    user_organ: "--",
    user_websi: "--",
    user_first: "--",
    user_last_: "--",
    user_email: "--",
    user_title: "--",
    user_addre: "--",
    user_city: "--",
    user_count: "--",
    user_state: "--",
    user_zip_c: "--",
    user_phone: "--",
    user_emplo: "--",
    user_sic_c: "--",
    user_indus: "--",
  });
  useEffect(() => {
    const locationClickElement = document.getElementById("locationClick");
    if (location?.state?.mapView == "house") {
      setTimeout(() => {
        locationClickElement.click();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (companyDetails) {
      const fields = companyDetails?.split("<br/>");
      const separatedData = {};
      fields.forEach((field) => {
        // Extract key and value using regex
        const match = field.match(/([^:]+):\s(.+)/);
        if (match && match.length === 3) {
          const key = match[1].trim();
          const value = match[2].trim();
          separatedData[key] = value;
        }
      });
      setCompanyAllDetails(separatedData);
      if (separatedData?.user_id) {
        getGonsumerinfo(separatedData);
      } else if (separatedData?.industry) {
        getGonsumerinfoForStaticLayer(separatedData);
      }
    }
  }, [companyDetails]);

  const [latLon, setLatLon] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [search, setSearch] = useState("");
  const [zoomLocation, setZoomLocation] = useState({
    latitude: 42.3601,
    longitude: -71.0589,
    zoomValue: 9,
  });
  const [selectItem, setSelectItem] = useState("");
  const [bannerData, setBannerData] = useState([
    "images/picView.svg",
    "images/picView.svg",
    "images/picView.svg",
  ]);
  const [listItems, setListItems] = useState([]);

  const navigate = useNavigate();
  const [isloading, setLoader] = useState(false);
  const [category, setCategory] = useState([
    "Landscapers",
    "Home Builders",
    "Architectural Services",
    "Fence Sales & Installation",
    "General Contractors",
    "Engineering Services",
    "Fence Contractors",
    "Deck Builder",
    "Remodelers",
    "Tree Service",
  ]);
  const handleListLocation = async (values) => {
    try {
      const response1 = await fetch(
        `${ApiConfig.mapboxUrl}${values}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}&country=us`
      );

      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${
          ApiConfig.LOCATIONIQ_ACCESS_TOKEN
        }&q=${encodeURIComponent(values)}&format=json&country=us`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      const result1 = await response1.json();
      console.log("result", result, result1.features);
      setListItems(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handlesetLat = (values) => {
    setLatLon(values);
  };
  // profilePic
  // ? profilePic == `${ApiConfig.imagGet}/media/null`
  //   ? "images/defaultPic.png"
  //   : profilePic
  // : "images/defaultPic.png"
  function Item(props) {
    if (props.item != null) {
      return (
        // <Paper style={{
        //   // height: "190px"
        //   }}>
        <img
          className={classes.imgCustom}
          src={`${ApiConfig.imagGet}${props.item}`}
          alt="DashImage"
          style={{ height: "300px" }}
        />
        //  </Paper>
      );
    } else {
      return null;
    }
  }

  const handleDefaultMap = (value) => {
    setZoomLocation({
      latitude: value.latitude,
      longitude: value.longitude,
      zoomValue: value.zoomValue,
    });
  };

  const getGonsumerinfo = async (values) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      uid: values?.user_id,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(ApiConfig.consumerinfo, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (
          JSON.parse(result)?.detail ==
            "User with provided email does not exist." ||
          JSON.parse(result)?.detail ==
            "No uploaded files found for this user." ||
          JSON.parse(result)?.detail == "No user data found for this user."
        ) {
          setopenBox(false);
          setConsumerInfoData({ file: [], user_info: [] });
          toast.error(JSON.parse(result)?.detail);
        } else {
          setConsumerInfoData(
            JSON.parse(result) || { file: [], user_info: [] }
          );
          handleButtonClick((JSON.parse(result)?.user_info[0]).company_website);
        }
      })
      .catch((error) => {
        console.error(error.response);
        setopenBox(false);
        setConsumerInfoData({ file: [], user_info: [] });
      });
  };
  const getGonsumerinfoForStaticLayer = async (values) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      sector: values?.industry,
      // sector: "Architectural Services",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(ApiConfig.consumerinfowms, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        if (
          JSON.parse(result)?.detail == "No uploaded files found for this user."
        ) {
          setopenBox(false);
          setConsumerInfoData({ file: [], user_info: [] });
          toast.error(JSON.parse(result)?.detail);
        } else {
          console.log("res2", JSON.parse(result));

          setConsumerInfoData({
            file: JSON.parse(result).file,
            user_info: [
              {
                company_name: values?.organization_name,
                company_website: values?.website,
                sector: values?.industry,
                image: "",
              },
            ],
          });
        }
      })
      .catch((error) => {
        console.error(error.response);
        setopenBox(false);
        setConsumerInfoData({ file: [], user_info: [] });
      });
  };
  const handleButtonClick = (values) => {
    if (values) {
      let url;
      if (values.includes("http://") || values.includes("https://")) {
        url = values;
      } else {
        url = `http://${encodeURIComponent(values)}`;
      }
      window.open(url, "_blank");
    }
  };

  const handleDragFeature = () => {};
  const [loadingCarousel, setLoadingCarousel] = useState(true); // State variable to track loading state of Carousel

  const handleCarouselLoad = () => {
    // Callback function to handle the load event of the Carousel
    setLoadingCarousel(false); // Set loading state to false once Carousel is loaded
  };

  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    getSectorData();
  }, []);
  const getCategoryData = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "GET",
        url: ApiConfig.categorylist,
      });
      if (res.status === 200 || res.status === 201) {
        setCategoryList(res.data);
        // setSelectedCategory(res?.data[0]?.category_name);
        // getSectorData(res?.data[0]?.id);
      }
    } catch (error) {}
  };
  const getSectorData = async (values) => {
    // const raw = JSON.stringify({
    //   category_id: values,
    // });
    try {
      const res = await Axios.get(ApiConfig.sectorlist, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200 || res.status === 201) {
        setSectorList(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogout = async () => {
    try {
      const response = await fetch("/logout/", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <Box className={classes.headbox}>
      <Box
        className={classes.headerBar}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          className={classes.largeText}
          style={{ flex: 1, textAlign: "center" }}
        >
          Admin Map Dashboard
        </Typography>
        <Button className={classes.logoutButton} onClick={handleLogout}>
          Logout
        </Button>
        <Button
        onClick={() => setShowNewMap(!showNewMap)}
        style={{
          position: "absolute",
          top: "4px",
          right: "120px",
          zIndex: 2000,
          background: "#cd9d24ff",
          color: "#fff",
          borderRadius: "6px",
          padding: "14px 14px",
        }}
      >
        {showNewMap ? "Old Map" : "New Map"}
      </Button>

      </Box>
      <Box>
        <Grid container>
          <Grid item xs={12}>
            <Box className="mainBox">
              {/* <img src="images/mapBg.svg" style={{ width: "100%" }} /> */}
              <div
                style={{ height: "calc(110vh - 67px)" }}
                onClick={(e) => {
                  // Only close dropdown if clicking outside the iframe
                  if (!showNewMap) {
                    setOpenCustomDrop(false);
                  }
                }}
              >
                {showNewMap ? (
                  <iframe
                    src="https://massgis.maps.arcgis.com/apps/OnePane/basicviewer/index.html?appid=47689963e7bb4007961676ad9fc56ae9"
                    title="MassGIS Map"
                    style={{
                      width: "100%",
                      height: "calc(110vh - 67px)",
                      border: "none",
                      pointerEvents: "auto",
                    }}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                    allow="geolocation"
                  />
                ) : (
                  <MapLayer
                    ref={childRef}
                    latLon={latLon}
                    setopenBox={(value) => {
                      setopenBox(value);
                      setLoadingCarousel(true);
                    }}
                    setCompanyDetails={(value) => {
                      setCompanyDetails(value);
                    }}
                    updateCheck={updateCheck}
                    handleDefaultMap={(value) => {
                      handleDefaultMap(value);
                    }}
                    resetCall
                  />
                )}
              </div>
            {!showNewMap && (
              <div>
                <div className="flexDiv">
                  <div
                    className="upperDiv gapBox"
                    style={{ padding: "25px 0px 0 40px" }}
                  >
                    <div>
                      {/* <Typography className="body">
                              Find Local Home Improvement Pro’s:
                            </Typography> */}
                      <div
                        style={{
                          width: "max-content",
                        }}
                      >
                        <div>
                          <FormControl
                            className={classes.seachBoxPosition}
                            fullWidth
                            variant="outlined"
                          >
                            <Autocomplete
                              disablePortal
                              options={sectorList.map(
                                (data) => data?.sector_name
                              )}
                              getOptionLabel={(option) => option || ""}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  margin="dense"
                                  variant="outlined"
                                  placeholder="Select"
                                  InputProps={{
                                    ...params.InputProps,
                                    className: classes.textField,
                                    style: {
                                      padding: "10px",
                                      backgroundColor: "white",
                                      marginRight: "-150px",
                                      minWidth: "400px",
                                      height: "45px",
                                    },
                                  }}
                                />
                              )}
                              onChange={(event, value) => {
                                const selectedSector = sectorList.find(
                                  (sector) => sector.sector_name === value
                                );
                                if (selectedSector) {
                                  handleSelectChange("", selectedSector.id);

                                  setSelectItem(value);
                                  setSectorId(selectedSector.id);
                                } else {
                                  setSelectItem("");
                                  setSectorId(null);
                                }
                              }}
                              disabled={isloading}
                              value={selectItem}
                            />
                          </FormControl>

                          <div className={classes.seachBoxPositionNew}>
                            <TextField
                              placeholder="Home search"
                              size="small"
                              variant="outlined"
                              id="inputID"
                              type="text"
                              value={search}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                handleListLocation(e.target.value);
                              }}
                              InputProps={{
                                className: classes.LoginTextBox,
                                endAdornment: (
                                  <Box className={classes.passsec}>
                                    {/* <img src="images/search.svg" alt="" /> */}
                                  </Box>
                                ),
                              }}
                              InputLabelProps={{
                                classes: { root: classes.textField },
                              }}
                              inputProps={{
                                className: classes.extendedInput1,
                              }}
                            />
                            {listItems.length > 0 && (
                              <div className={classes.absoluteDiv}>
                                {listItems.map((item) => {
                                  return (
                                    <div
                                      key={item?.osm_id}
                                      style={{ background: "#fff" }}
                                    >
                                      <div
                                        className={classes.locationDiv}
                                        onClick={() => {
                                          handlesetLat([
                                            item?.lon,
                                            item?.lat,
                                          ]);
                                          setSearch(item?.display_name);
                                          setListItems([]);
                                        }}
                                      >
                                        <div>
                                          <HiLocationMarker
                                            style={{ fontSize: "18px" }}
                                          />
                                        </div>
                                        <Typography>
                                          {item?.display_name}
                                        </Typography>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={classes.manageCategoryIcon}>
                          <div
                            className={
                              openCustomDrop
                                ? classes.mainEffectNew1
                                : classes.mainEffectNew
                            }
                          >
                            <div className="homeIconCss">
                              <Button
                                onClick={() =>
                                  setOpenCustomDrop(!openCustomDrop)
                                }
                                className={classes.categoryButon}
                              >
                                <FaFilter /> Filter
                              </Button>
                            </div>
                            <div className="openDiv">
                              <div
                                className={
                                  menuOpen && selectedCategory !== ""
                                    ? classes.dropdownPaperOpen
                                    : classes.setDivWidth
                                }
                              >
                                <FormControl
                                  className={classes.TextBoxFormControl}
                                  fullWidth
                                  variant="outlined"
                                >
                                  <Select
                                    margin="dense"
                                    variant="outlined"
                                    displayEmpty
                                    // disabled={isloading}
                                    value={selectedCategory}
                                    InputProps={{
                                      className: classes.TextBox,
                                    }}
                                    MenuProps={{
                                      PaperProps: {
                                        style: {
                                          maxHeight: 210,
                                        },
                                      },
                                    }}
                                    onChange={(e) => {
                                      setSelectedCategory(e.target.value);
                                      setSelectItem("");
                                    }}
                                  >
                                    <MenuItem
                                      value=""
                                      onClick={() => {
                                        setSearchInput("");
                                        handleSelectChange("", "");
                                      }}
                                      style={{
                                        fontSize: "12px",
                                        opacity: "0.5 !important",
                                      }}
                                    >
                                      All
                                    </MenuItem>
                                    {categoryList?.map((data) => {
                                      return (
                                        <MenuItem
                                          value={data?.category_name}
                                          style={{ fontSize: "12px" }}
                                          onClick={() => {
                                            getSectorData(data.id);
                                            setSearchInput("");
                                            handleSelectChange(data?.id, "");
                                          }}
                                        >
                                          {data?.category_name}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </FormControl>
                              </div>
                              <div
                                className={
                                  menuOpen && selectedCategory !== ""
                                    ? classes.dropdownPaperOpen
                                    : classes.setDivWidth
                                }
                              >
                                <FormControl
                                  className={classes.textBoxFormControl}
                                  fullWidth
                                  onMouseLeave={() => setMenuOpen(false)}
                                >
                                  <TextField
                                    fullWidth
                                    margin="dense"
                                    placeholder="Search"
                                    value={searchInput}
                                    disabled={selectedCategory == ""}
                                    onChange={handleSearchInputChange}
                                    onClick={() => {
                                      setMenuOpen(true);
                                      setSearchInput("");
                                    }}
                                    onFocus={() => {
                                      setMenuOpen(true);
                                      setSearchInput("");
                                    }}
                                    InputProps={{
                                      className: classes.textBox,
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton edge="end" size="large">
                                            <IoMdArrowDropdown
                                              style={{
                                                color: "rgb(117 117 117)",
                                              }}
                                            />
                                          </IconButton>
                                        </InputAdornment>
                                      ),
                                    }}
                                    InputLabelProps={{
                                      classes: { root: classes.textField },
                                    }}
                                    inputProps={{
                                      className:
                                        searchInput.length > 24
                                          ? classes.extendedInput
                                          : classes.input,
                                    }}
                                  />
                                  {menuOpen && selectedCategory !== "" && (
                                    <Paper className={classes.dropdownPaper}>
                                      <div className={classes.handleWidth}>
                                        {filteredSectors.map((data) => (
                                          <MenuItem
                                            key={data.sector_name}
                                            value={data.sector_name}
                                            style={{ fontSize: "14px" }}
                                            onClick={() => {
                                              setSearchInput(data.sector_name);
                                              setMenuOpen(false);
                                              handleSelectChange(
                                                data.category_id,
                                                data.sector_name
                                              );
                                            }}
                                          >
                                            {data.sector_name}
                                          </MenuItem>
                                        ))}
                                      </div>
                                    </Paper>
                                  )}
                                </FormControl>
                              </div>
                              <div className={classes.seachBoxPositionNew}>
                                <TextField
                                  placeholder="Home search"
                                  size="small"
                                  variant="outlined"
                                  id="inputID"
                                  type="text"
                                  value={search}
                                  fullWidth
                                  onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleListLocation(e.target.value);
                                  }}
                                  InputProps={{
                                    className: classes.LoginTextBox,
                                    endAdornment: (
                                      <Box className={classes.passsec}>
                                        <img src="images/search.svg" alt="" />
                                      </Box>
                                    ),
                                  }}
                                  InputLabelProps={{
                                    classes: { root: classes.textField },
                                  }}
                                  inputProps={{
                                    className: classes.extendedInput1,
                                  }}
                                />
                                {listItems.length > 0 && (
                                  <div className={classes.absoluteDiv}>
                                    {listItems.map((item) => {
                                      return (
                                        <div
                                          key={item?.osm_id}
                                          style={{ background: "#fff" }}
                                        >
                                          <div
                                            className={classes.locationDiv}
                                            onClick={() => {
                                              handlesetLat([
                                                item?.lon,
                                                item?.lat,
                                              ]);
                                              setSearch(item?.display_name);
                                              setListItems([]);
                                            }}
                                          >
                                            <div>
                                              <HiLocationMarker
                                                style={{ fontSize: "18px" }}
                                              />
                                            </div>
                                            <Typography>
                                              {item?.display_name}
                                            </Typography>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {!openCustomDrop ? (
                            <div
                              className={classes.newBorder}
                              onClick={() => {
                                setOpenCustomDrop(true);
                              }}
                            >
                              {" "}
                              <Typography className="body">
                                {searchInput != ""
                                  ? searchInput
                                  : selectedCategory != ""
                                  ? selectedCategory
                                  : "All"}
                              </Typography>
                              <IoMdArrowDropdown
                                style={{
                                  color: "rgb(117 117 117)",
                                }}
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="divGrid upperDiv"
                    style={{ padding: "20px 23px 0px 0" }}
                  >
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div className={classes.seachBoxPosition}>
                        <TextField
                          placeholder="Go To My Home"
                          size="small"
                          variant="outlined"
                          id="inputID"
                          type="text"
                          value={search}
                          inputProps={{ maxLength: 256 }}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            handleListLocation(e.target.value);
                          }}
                          InputProps={{
                            className: classes.LoginTextBox,
                            endAdornment: (
                              <Box className={classes.passsec}>
                                <img src="images/search.svg" alt="" />
                              </Box>
                            ),
                          }}
                        />
                        {listItems.length > 0 && (
                          <div className={classes.absoluteDiv}>
                            {listItems.map((item) => {
                              return (
                                <div
                                  key={item?.osm_id}
                                  style={{ background: "#fff" }}
                                >
                                  <div
                                    className={classes.locationDiv}
                                    onClick={() => {
                                      handlesetLat([
                                        item?.lon,
                                        item?.lat,
                                      ]);
                                      setSearch(item?.display_name);
                                      setListItems([]);
                                    }}
                                  >
                                    <div>
                                      <HiLocationMarker
                                        style={{ fontSize: "18px" }}
                                      />
                                    </div>
                                    <Typography>
                                      {item?.display_name}
                                    </Typography>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div
                        style={{ display: "grid", gap: "12px" }}
                        onClick={() => {
                          setOpenCustomDrop(false);
                        }}
                      >
                        <div className={classes.mainEffect}>
                          <div
                            className="homeIconCss"
                            onClick={() => {
                              childRef.current.flyTo(
                                fromLonLat([
                                  parseFloat(localStorage.getItem("longitude")),
                                  parseFloat(localStorage.getItem("latitude")),
                                ]),
                                () => {}
                              );
                            }}
                          >
                            <img
                              src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/images/icons/House.svg"
                              alt="#"
                            />
                          </div>
                          <div className="openDiv">
                            <div className={`cta arrowOpen`}>
                              <IoIosArrowForward
                                style={{
                                  color: "#fff",
                                  height: "25px",
                                  width: "25px",
                                }}
                              />
                              <div
                                className="listDiv"
                                style={{
                                  gap: "2px",
                                  overflow: "hidden",
                                }}
                              >
                                <Typography
                                  onClick={() => {
                                    toast.success(
                                      "Current map view has been successfully set as the default."
                                    );
                                    localStorage.setItem(
                                      "latitude",
                                      zoomLocation.latitude
                                    );
                                    localStorage.setItem(
                                      "longitude",
                                      zoomLocation.longitude
                                    );
                                    localStorage.setItem(
                                      "zoomValue",
                                      zoomLocation.zoomValue
                                    );
                                  }}
                                  style={{
                                    color: "#fff",
                                    cursor: "pointer",
                                  }}
                                >
                                  Set&nbsp;as&nbsp;home
                                </Typography>
                                <div
                                  style={{
                                    borderBottom: "1px solid #D8DADC",
                                  }}
                                ></div>
                                <Typography
                                  style={{
                                    color: "#fff",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    toast.success("Map reset to default view.");
                                    setresetCall(!resetCall);
                                    localStorage.setItem("latitude", 42.3601);
                                    localStorage.setItem("longitude", -71.0589);
                                    localStorage.setItem("zoomValue", 9);
                                  }}
                                >
                                  Reset
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </div>
                        <img
                          src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/images/icons/yourLocation.svg"
                          alt="#"
                          id="locationClick"
                          onClick={() => {
                            childRef.current.getCurrentLocation();
                          }}
                        />

                        <div className="cssdiv">
                          <FaPlus
                            style={{
                              color: "#000000",
                              fontSize: "18px",
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
                              fontSize: "18px",
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
                </div>
              </div>
            )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      {openBox && (
        <Box className="openBoxTag">
          <div className={classes.mainDiv}>
            <div className={classes.headingDiv}>
              <Typography className="body">Drag And Drop</Typography>
              <IconButton
                edge="end"
                size="small"
                onClick={() => {
                  setopenBox(false);
                  setUpdateCheck(false);
                }}
              >
                <img
                  src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/images/icons/CTA.png"
                  alt="icon"
                  style={{ width: 40, height: 40 }}
                />
              </IconButton>
            </div>
            <Typography
              className="body1"
              textAlign={"center"}
              style={{ lineHeight: "28px" }}
            >
              Once you drag the map marker, dropping it will change the original
              coordinates of it.
            </Typography>

            <div className={classes.dialogDiv}>
              <Button
                onClick={() => {
                  setopenBox(false);
                  setUpdateCheck(false);
                }}
                className="buttonCssDisagree"
              >
                Disagree
              </Button>
              <Button
                onClick={() => {
                  setopenBox(false);
                  setUpdateCheck(true);
                }}
                className="buttonCss"
              >
                Agree
              </Button>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
}