import React, { useState, useContext, useEffect } from "react";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa6";

import "src/scss/main.css";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Autocomplete,
  Link,
  FormHelperText,
  FormControl,
  InputAdornment,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {
  useNavigate,
  Link as RouterComponent,
  useLocation,
} from "react-router-dom";
import { Form, Formik } from "formik";
import * as yep from "yup";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { AuthContext } from "src/context/Auth";
import Page from "src/component/Page";
import { UserContext } from "src/context/User";
import { IoMdArrowBack } from "react-icons/io";
import PhoneInput from "react-phone-input-2";
import ReCAPTCHA from "react-google-recaptcha";
import { HiLocationMarker } from "react-icons/hi";

const useStyles = makeStyles((theme) => ({
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
  buttoncss: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    minHeight: "56px !important",
    color: "#fff !important",
    cursor: "pointer !important",
    padding: "12px !important",
    border: "1px solid rgb(23, 38, 36, 0.7) !important",
    minWidth: "200px !important",
    background: "#000 !important",
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
  buttonDownloadcss: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    minHeight: "56px !important",
    color: "#fff !important",
    cursor: "pointer !important",
    padding: "12px !important",
    border: "1px solid rgb(23, 38, 36, 0.7) !important",
    minWidth: "56px !important",
    background: "#000 !important",
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
  divFlex: {
    display: "flex",
    gap: "50px",
    justifyContent: "space-between",
    "@media (max-width: 799px)": {
      display: "grid",
      gap: "10px",
    },
  },
  buttonbox: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    textAlign: "center !important",
    textTransform: "none !important",
    letterSpacing: "0.2px !important",
    color: "#000 !important",
    lineHeight: "16px !important",
    // background: "#172624 !important",
    background: "#D19A1D !important",
    borderRadius: "6px !important",
    padding: "20px !important",
    textTransform: "uppercase !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "14px",
    // },
    // width: "100%",
    // maxWidth: "350px",
    // height: "50px",
  },
  mainBox: {},
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
  wrongPassword: {
    borderRadius: "8px",
    border: "1px solid red",
    // background: theme.palette.background.taf,
    height: "55px",
  },

  TopText: {
    display: "grid",
    gap: "24px",
    alignItems: "center",
    "& .innerDiv": {
      display: "inline-grid",
      alignContent: "center",
      justifyItems: "center",
    },
    "& .googleButton": {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      textAlign: "center",
      justifyContent: "center",
      borderRadius: "10px",
      border: "1px solid #D8DADC",
      background: "#FFF",
      padding: "16px",
      width: "-webkit-fill-available",
    },
    "& .dividerCss": {
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      marginBottom: "11px",
    },
    "& .border": {
      width: "100%",
      borderBottom: "1px solid #D8DADC",
      marginBottom: "10px",
    },
  },
  linkText: {
    color: "#000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "16px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "16px !important",
    textDecoration: "none !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "14px",
    // },
  },
  SubmitBtnBox: {
    textAlign: "center",
    marginTop: "24px",
    marginBottom: "27px",
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

  Loginlabelall: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
    marginBottom: "10px !important",
  },

  dontacctypo: {
    color: "#000 !important",
    textAlign: "center !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  formControlBox: {
    display: "grid",
    gap: "5px",
    marginTop: "22px",
    "& .MuiFormControlLabel-root": {},
  },
  TextBoxFormControl: {
    "& .MuiOutlinedInput-root": {
      background: "#fff",
    },
    "& .MuiOutlinedInput-input": {
      padding: "18px 16px",
    },
  },
  alreadyAccount: {
    color: "rgba(0, 0, 0) !important",
    textAlign: "center",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  checkDiv: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    "& .MuiSvgIcon-root": {
      color: "#172624 !important",
    },
  },
  checkBackgroundDiv: {
    maxWidth: "289px",
    padding: "18px 16px",
    borderRadius: "10px",
    border: "1px solid #D8DADC",
    background: "#FFF",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexDiv: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  titleText: {
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "800 !important",
    fontSize: "20px",
    lineHeight: "normal !important",
    color: "#172624 !important",
    textTransform: "uppercase",
    "@media (max-width: 920px)": {
      fontSize: "18px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "16px !important",
    },
  },
  firstGrid: {
    marginTop: "40px",
    "@media (max-width: 920px)": {
      marginTop: "30px",
    },
    "@media (max-width: 599px)": {
      marginTop: "30px",
    },
  },
  rotateAnimation: {
    animation: "$rotate 1.5s",
  },
  "@keyframes rotate": {
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(360deg)",
    },
  },

  locationDiv: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    cursor: "pointer",
  },
  absoluteDiv: {
    position: "absolute",
    top: "65px",
    background: "rgb(255, 255, 255)",
    borderRadius: "10px",
    padding: "12px",
    width: "-webkit-fill-available",
    // maxWidth: "252px",
    maxHeight: "125px",
    overflow: "auto",
    zIndex: "1",
  },
}));

export default function CompanyInformation() {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const [CsvFileDataWithLatLog, setCsvFileDataWithLatLog] = useState([]);
  const [csvLoader, setCsvLoader] = useState(false);
  const user = useContext(UserContext);
  const [listItems, setListItems] = useState([]);
  const [uploadedFileName, setuploadedFileName] = useState("");
  const [CsvFileData, setCsvFileData] = useState([]);
  const [imageIconData, setImageIconData] = useState("");
  const [imageIconView, setImageIconView] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    user?.profile?.profile?.category_name || "Select Service"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [sectorId, setSectorId] = useState();

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const [listData, setListData] = useState([]);
  const [newDataToUpload, setNewDataToUpload] = useState([]);
  const [addressError, setaddressError] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedState, setSelectedState] = useState("Massachusetts");
  const [selectedCity, setSelectedCity] = useState("");
  const [countries, setCountries] = useState([]); // Your country JSON data
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isloading, setLoader] = useState(false);
  const [isRotating, setRotating] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [latLongVerification, setLatLongVerification] = useState(false);
  const { email, token } = location.state || {};
  const [uploadData, setUploadData] = useState([]);
  const [checked, setChecked] = useState(false);
  const [openPostYardSign, setOpenPostYardSign] = useState(false);
  const [mergedList, setMergedList] = useState([]);
  const [sectorList, setSectorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectItem, setSelectItem] = useState(
    user?.profile?.profile?.sector_name || ""
  );
  useEffect(() => {
    getCategoryData();
    getSectorData();
  }, []);

  useEffect(() => {
    if (categoryList.length && sectorList.length) {
      const mergedData = sectorList.map((sector) => {
        const category = categoryList.find(
          (cat) => cat.id === sector.category_id
        );
        return {
          ...sector,
          category_name: category?.category_name,
        };
      });

      setMergedList(mergedData);
    }
  }, [categoryList, sectorList]);
  const getCategoryData = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "GET",
        url: ApiConfig.categorylist,
      });
      if (res.status === 200 || res.status === 201) {
        setCategoryList(res.data);
      }
    } catch (error) {}
  };
  const getSectorData = async () => {
    try {
      const res = await Axios.get(ApiConfig.sectorlist, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200 || res.status === 201) {
        setSectorList(res.data);
        res.data.map((values) => {
          if (user?.profile?.profile?.sector_name == values?.sector_name) {
            setSectorId(values.id);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
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
  const handleImportChange = async (files) => {
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

  const fetchLatLongForAddresses = async (formattedData) => {
    try {
      const updatedData = [];
      const latLog = [];

      let count = 0 + (listData?.length - 1 || 0); // Initialize a counter variable

      for (const data of formattedData) {
        setCsvLoader(true);
        // if (count >= (user?.profile?.plan?.feature_count || 0)) {
        //   // If more than 12 data, break out of the loop
        //   break;
        // }
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
      const concatCount = Math.min(
        newData.length,
        (user?.profile?.plan?.feature_count || 0) - (listData.length - 1)
      );
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

  const handleFormSubmitCSV = async (values) => {
    setaddressError(false);
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("sector", user?.profile?.profile?.sector_name);
      formData.append("user_email", localStorage.getItem("email"));
      const res = await Axios.post(ApiConfig.uploadmultiplefile, values, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("You have successfully uploaded Post Yard Sign");
        setLoader(false);
        // handleCallBack();
        setChecked(false);
        setNewDataToUpload([]);
        setOpenPostYardSign(false);
        navigate("/add-services");
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

  const handleImageSelect = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setImageIconData(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageIconView(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const CustomSuccessToast = () => {
    return (
      <div>
        {/* You can customize the success toast content here */}
        Your account has been successfully created, Please log in.
      </div>
    );
  };

  const handleRotatingClick = () => {
    setRotating(true);
    setTimeout(() => {
      setRotating(false);
    }, 1500);
  };

  const subscription_plan = async () => {
    const res = await Axios({
      method: "POST",
      url: ApiConfig.buyFreePlanData,
      headers: {
        Authorization: `Token ${location?.state?.token}`,
        "Content-Type": "application/json", // Add this header for Axios
      },
    });
    if (res?.status === 200 || res?.status === 201) {
      toast.success(
        res?.data?.message ||
          "Your 90-day free trial has been activated successfully."
      );
      user.getViewMyProfile();
      successEmail()
    } else {
      toast.error(res?.data?.error);
    }
  };

  const successEmail = async () => {
    const res = await Axios({
      method: "POST",
      url: ApiConfig.successEmail,
      headers: {
        Authorization: `Token ${location?.state?.token}`,
        "Content-Type": "application/json", 
      },
      data: {email:localStorage.email,
             contact_name: localStorage.contact_name,
             company_name: localStorage.company_name
      }
    });
    if (res?.status === 200 || res?.status === 201) {

      navigate("/add-services")
    } else {
      toast.error(res?.data?.error);
    }
  };
  const handleFirstYardSign = async (address) => {
    if (sectorId == "") {
      toast.error("Please select a sector.");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("sector", parseInt(sectorId));
        formData.append("category_id", selectedCategoryId);
        // formData.append("category_name", selectedCategory);
        formData.append("sector_name", selectItem);
        formData.append("sector_id", parseInt(sectorId));
        formData.append("user_email", location?.state?.email);
        // formData.append("state", user?.profile?.user_info?.state);
        // formData.append("zipcode", user?.profile?.user_info?.zipcode);
        // formData.append("city", user?.profile?.user_info?.city);
        formData.append("address", address);
        const res = await Axios.post(ApiConfig.uploadfile, formData, {
          headers: {
            Authorization: `Token ${location?.state?.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        setLoader(false);
        if (error.response?.data?.error) {
          // const errorMessage = await error.response.json().message; // Parse error response JSON
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later."); // Handle unexpected errors
        }
      }
    }
  };
  const handleFormSubmit = async (values) => {
    if (latLongVerification) {
      sessionStorage.setItem("email", values.email);
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("company_website", values.companyWebsite);
        formData.append("company_name", values.companyName)
        localStorage.setItem("company_name", values.companyName)
        formData.append("company_phone", values.companyPhone);
        formData.append("company_address", values.companyAddress);
        formData.append("company_email", values.companyEmail);
        // formData.append("city", values.city);
        // formData.append("state", values.state);
        // formData.append("zipcode", values.Zipcode);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        // formData.append("first_name", null);
        // formData.append("last_name", null);
        formData.append("email", location?.state.email);
        if(values.contactName.length>0)
          {
            formData.append("contact_name", values.contactName);
            localStorage.setItem("contact_name", values.contactName)
          }
        formData.append("sector", sectorId);  
        formData.append("image", imageIconData);
        const myHeaders = {
          "Content-Type": "multipart/form-data",
          Cookie:
            "csrftoken=iS7XAA0wJWNon68TQcNK8OI12pkR7dsb3iiXl8VpwMmUTK9soQkucW1BWZ1s3NI1",
        };

        const res = await Axios.post(`${ApiConfig.companyInfo}`, formData, {
          headers: myHeaders,
        });

        if (res.status === 200 || res.status === 201) {
          // toast.success(<CustomSuccessToast />, {
          //   progressClassName: "toast-progress-hidden", // Hides the green progress line
          //   bodyClassName: "toast-body-no-tick", // Hides the green tick
          // });
          window.localStorage.setItem("email", location?.state.email);
          window.localStorage.setItem("token", location?.state.token);
          auth.userLogIn(location?.state?.token, true);


          handleFirstYardSign(values.companyAddress);
          subscription_plan();
        } else {
          toast.warn(res.message);
          setLoader(false);
        }
      } catch (error) {
        console.log("ERROR", error);
        setLoader(false);
        if (error.response?.data?.error) {
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later.");
        }
      }
    } else {
      toast.error("Please select a different address.");
    }
  };

  const handleListLocation = async (values) => {

    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${values}.json?country=us&access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setListItems(result.features);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formInitialSchema = {
    companyName: "",
    companyWebsite: "",
    companyEmail: "",
    companyPhone: "",
    // Zipcode: "",
    contactName: "",
    companyAddress: "",
    // companyAddressContinued: "",
    // state: selectedState,
    // city: "",
    check: false,
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
          setSelectedState("");
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
            cityOfSelectedState.length !== 0
              ? cityOfSelectedState
              : [{ id: "00", name: selectedState, state_id: stateFromCode.id }]
          );
        }
      }
    };

    fetchData();
  }, [selectedState]);
  return (
    <>
      <Page title="signUp">
        <Grid className="d-flex height100">
          <Box className="loginForm">
            <Box className={classes.mainBox}>
              <Grid container direction={"column"}>
                <Grid item className={classes.TopText}>
                  <div className={classes.flexDiv}>
                    {/* <IoMdArrowBack
                      style={{ fontSize: "22px" }}
                      onClick={() => {
                        navigate("/register");
                      }}
                    /> */}
                    <Typography className={classes.titleText}>
                      Company Information
                    </Typography>
                  </div>
                </Grid>

                <Formik
                  onSubmit={(values) => handleFormSubmit(values)}
                  initialValues={formInitialSchema}
                  initialStatus={{
                    success: false,
                    successMsg: "",
                  }}
                  validationSchema={yep.object().shape({
                    companyName: yep
                      .string()
                      .required("Please enter your company's name"),
                    companyEmail: yep
                      .string()
                      .required("Please enter your company's email"),
                    companyPhone: yep
                      .string()
                      .required("Please enter your company's phone number"),
                    // Zipcode: yep.string().required("Please enter zip code"),
                    companyAddress: yep
                      .string()
                      .required("Please enter your company's address"),
                    // contactName: yep
                    //   .string()
                    //   .required("Please enter your contact name"),
                    companyWebsite: yep
                      .string()
                      .required("Please enter your company's website")
                      .matches(
                        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+)(\/[^\s]*)?$/,
                        "Please enter a valid website URL"
                      ),
                    // companyAddressContinued: yep.string(),
                    // state: yep.object().nullable(),
                    // // .required("Select a state"),
                    // city: yep.string().required("Please enter your city"),
                    // check: yep
                    //   .bool()
                    //   .oneOf(
                    //     [true],
                    //     "Please check the box to confirm you are not a robot."
                    //   ),
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
                      <Grid item className={classes.firstGrid}>
                        <Typography className={classes.Loginlabelall}>
                          Company Name
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        <TextField
                          placeholder="Enter Company Name"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.companyName}
                          name="companyName"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyName && errors.companyName
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.companyName && errors.companyName}
                        </FormHelperText>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography
                          className={classes.Loginlabelall}
                          style={{ marginBottom: "7px" }}
                        >
                          Service Type
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        <FormControl
                          className={classes.TextBoxFormControl}
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
                                placeholder="Select Service"
                                InputProps={{
                                  ...params.InputProps,
                                  className: classes.TextBox,
                                  style: { padding: "0px", margin: "0px" },
                                }}
                              />
                            )}
                            onChange={(event, value) => {
                              const selectedSector = sectorList.find(
                                (sector) => sector.sector_name === value
                              );
                              if (selectedSector) {
                                setSelectItem(value);
                                setSectorId(selectedSector.id);
                                setSelectedCategoryId(selectedSector.category_id)
                              } else {
                                setSelectItem("");
                                setSectorId(null);
                              }
                            }}
                            disabled={isloading}
                            value={selectItem}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Company Website
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        <TextField
                          placeholder="https://"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.companyWebsite}
                          name="companyWebsite"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyWebsite && errors.companyWebsite
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.companyWebsite && errors.companyWebsite}
                        </FormHelperText>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Company Email
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        <TextField
                          placeholder="Enter Email"
                          type="email"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.companyEmail}
                          name="companyEmail"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyEmail && errors.companyEmail
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.companyEmail && errors.companyEmail}
                        </FormHelperText>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Contact Name
                          {/* <span style={{ color: "#FE3B3B" }}>*</span> */}
                        </Typography>
                        <TextField
                          placeholder="Enter Contact Name"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.contactName}
                          name="contactName"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.contactName && errors.contactName
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.contactName && errors.contactName}
                        </FormHelperText>
                      </Grid>

                      {/* <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Company Phone
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography> */}
                      {/* <TextField
                          placeholder="Enter Phone Number"
                          type="number"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          onWheel={() => document.activeElement.blur()}
                          inputProps={{ maxLength: 256 }}
                          value={values.companyPhone}
                          name="companyPhone"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyPhone && errors.companyPhone
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        /> */}
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Company Phone
                          <span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        {/* <TextField
                          placeholder="Enter Phone Number"
                          type="number"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          onWheel={() => document.activeElement.blur()}
                          inputProps={{ maxLength: 256 }}
                          value={values.companyPhone}
                          name="companyPhone"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyPhone && errors.companyPhone
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        /> */}
                        <PhoneInput
                          country={"us"}
                          inputStyle={{
                            background: "#fff",
                            width: "-webkit-fill-available",
                            color: "#000",
                            border: "1px solid rgb(184, 185, 186)",
                            padding: "18px 16px",
                            marginTop: "5px",
                            borderRadius: "10px",
                          }}
                          value={values.companyPhone}
                          error={Boolean(
                            touched.companyPhone && errors.companyPhone
                          )}
                          onBlur={handleBlur}
                          onChange={(mobile, e) => {
                            setCountryCode(e.dialCode);
                            setFieldValue("companyPhone", mobile);
                          }}
                          className={`textFeilds textHeight ${classes.selectedFlag}`}
                          InputProps={{
                            className: classes.TextBox,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.companyPhone && errors.companyPhone}
                        </FormHelperText>
                      </Grid>
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Company Address
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
                            value={values.companyAddress}
                            name="companyAddress"
                            className={classes.LoginTextBox}
                            error={Boolean(
                              touched.companyAddress && errors.companyAddress
                            )}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              setFieldValue("companyAddress", e.target.value);
                              handleListLocation(e.target.value);
                              setLatLongVerification(true);
                            }}
                            onSubmit={handleSubmit}
                            InputProps={{
                              className: classes.Logintextfiled,
                            }}
                          />
                          {listItems.length > 0 && (
                            <div className={classes.absoluteDiv}>
                              {listItems.map((item) => {
                                return (
                                  <div
                                    key={item?.id}
                                    style={{ background: "#fff" }}
                                  >
                                    <div
                                      className={classes.locationDiv}
                                      onClick={(e) => {
                                        setFieldValue(
                                          "companyAddress",
                                          item?.place_name
                                        );
                                        setLatitude(item?.center[1]);
                                        setLongitude(item?.center[0]);
                                        setLatLongVerification(true);
                                        setListItems([]);
                                      }}
                                    >
                                      <div>
                                        <HiLocationMarker
                                          style={{ fontSize: "18px" }}
                                        />
                                      </div>
                                      <Typography>
                                        {item?.place_name}
                                      </Typography>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.companyAddress && errors.companyAddress}
                        </FormHelperText>
                        {/* <TextField
                          placeholder="Company Address Continued"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.companyAddressContinued}
                          name="companyAddressContinued"
                          className={classes.LoginTextBox}
                          error={Boolean(
                            touched.companyAddressContinued &&
                              errors.companyAddressContinued
                          )}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        /> */}
                      </Grid>
                      {/* <Grid
                        item
                        style={{
                          marginTop: "22px",
                          display: "flex",
                          gap: "20px",
                        }}
                      >
                        <div style={{ width: "100%" }}>
                          <Typography className={classes.Loginlabelall}>
                            {"State"}
                            <span style={{ color: "#FE3B3B" }}>*</span>
                          </Typography>
                          <FormControl
                            className={classes.TextBoxFormControl}
                            fullWidth
                            variant="outlined"
                          >
                            <Select
                              margin="dense"
                              variant="outlined"
                              placeholder="Select State"
                              displayEmpty
                              disabled={isloading}
                              // disabled
                              value={values.state}
                              InputProps={{
                                className: classes.TextBox,
                              }}
                              onChange={(e) => {
                                setSelectedState(e.target.value);
                                setFieldValue("state", e.target.value);
                                setFieldValue("city", "");
                              }}
                            >
                              {states.map((data) => {
                                return (
                                  <MenuItem
                                    value={data.name}
                                    style={{ fontSize: "12px" }}
                                  >
                                    {data.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <FormHelperText error>
                            {touched.state &&
                              errors.state &&
                              `${errors.state}.`}
                          </FormHelperText>
                        </div>
                        <div style={{ width: "100%" }}>
                          <Typography className={classes.Loginlabelall}>
                            {"City"}
                            <span style={{ color: "#FE3B3B" }}>*</span>
                          </Typography>
                          <FormControl
                            className={classes.TextBoxFormControl}
                            fullWidth
                            variant="outlined"
                          >
                            <Select
                              margin="dense"
                              variant="outlined"
                              displayEmpty
                              disabled={isloading}
                              value={values.city}
                              InputProps={{
                                className: classes.TextBox,
                              }}
                              onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setFieldValue("city", e.target.value);
                              }}
                            >
                              <MenuItem
                                value=""
                                disabled
                                style={{
                                  fontSize: "12px",
                                  opacity: "0.5 !important",
                                }}
                              >
                                Select
                              </MenuItem>
                              {cities.map((data) => {
                                return (
                                  <MenuItem
                                    value={data.name}
                                    style={{ fontSize: "12px" }}
                                  >
                                    {data.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <FormHelperText error>
                            {touched.city && errors.city && `${errors.city}.`}
                          </FormHelperText>
                        </div>
                      </Grid> */}
                      {/* <Grid item style={{ marginTop: "22px" }}>
                        <Typography className={classes.Loginlabelall}>
                          Zipcode<span style={{ color: "#FE3B3B" }}>*</span>
                        </Typography>
                        <TextField
                          placeholder="Enter Zipcode"
                          type="text"
                          variant="outlined"
                          fullWidth
                          id="inputID"
                          size="small"
                          inputProps={{ maxLength: 256 }}
                          value={values.Zipcode}
                          name="Zipcode"
                          className={classes.LoginTextBox}
                          error={Boolean(touched.Zipcode && errors.Zipcode)}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onSubmit={handleSubmit}
                          InputProps={{
                            className: classes.Logintextfiled,
                          }}
                        />
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.Zipcode && errors.Zipcode}
                        </FormHelperText>
                      </Grid> */}

                     
                      {/* 
                      <Grid item style={{ marginTop: "22px" }}>
                        <Typography
                          className={classes.Loginlabelall}
                          style={{ marginBottom: "7px" }}
                        >
                          Upload Company Logo
                        </Typography>
                        {imageIconView ? (
                          <Box
                            mt={2}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <div className="iconImageDiv">
                              <img
                                src={imageIconView}
                                alt=""
                                style={{
                                  width: "100%",
                                  borderRadius: "8px",
                                  margin: "8px 0",
                                  maxHeight: "100px",
                                  maxWidth: "180px",
                                }}
                              />
                              <img
                                src="images/XCircle.svg"
                                alt="x"
                                className="iconImage"
                                onClick={() => {
                                  setImageIconView("");
                                }}
                              />
                            </div>
                          </Box>
                        ) : (
                          <Box className={classes.editBox} mt={2}>
                            <TextField
                              type="file"
                              variant="outlined"
                              fullWidth
                              accept="image/*"
                              className={classes.editInput}
                              onChange={(e) => handleImageSelect(e)}
                            />
                          </Box>
                        )}
                      </Grid> */}

                   

                      <Grid item style={{ marginTop: "22px" }}>
                        <div className={classes.checkBackgroundDiv}>
                          <div className={classes.checkDiv}>
                            <Checkbox
                              type="checkbox"
                              name="check"
                              onChange={handleChange}
                              value={values.check}
                              style={{ width: "20px", height: "20px" }}
                            />
                            <Typography className={classes.alreadyAccount}>
                              I am not a robot
                            </Typography>
                          </div>
                          <div>
                            <img
                              src="images/loadingIcon.svg"
                              alt="#"
                              className={
                                isRotating ? classes.rotateAnimation : ""
                              }
                              onClick={handleRotatingClick}
                            />
                          </div>
                        </div>
                        <FormHelperText
                          error
                          style={{
                            fontSize: "12px",
                            fontFamily: "'Noto Sans', sans-serif",
                          }}
                        >
                          {touched.check && errors.check}
                        </FormHelperText>
                      </Grid>
                      <Grid style={{ marginTop: "15px" }}>
                        <span style={{ color: "#FE3B3B" }}>*</span>
                        <span style={{ margin: "5px" }}>
                          Fields are mandatory.
                        </span>
                      </Grid>
                      <Grid>
                        <Box className={classes.SubmitBtnBox} mt={2}>
                          <Button
                            type="submit"
                            fullWidth
                            className={classes.buttonbox}
                            disabled={isloading}
                          >
                            Create Account
                            {isloading && <ButtonCircularProgress />}
                          </Button>
                        </Box>
                        {/* <Box
                          style={{
                            display: "grid",
                            justifyContent: "center",
                          }}
                        >
                          <Typography className={classes.dontacctypo}>
                            Already have an account?{" "}
                            <span
                              onClick={() => {
                                navigate("/login");
                              }}
                              style={{
                                cursor: "pointer",
                                fontWeight: "700",
                                color: "#000",
                              }}
                            >
                              Sign In
                            </span>
                          </Typography>
                        </Box> */}
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Page>
    </>
  );
}
