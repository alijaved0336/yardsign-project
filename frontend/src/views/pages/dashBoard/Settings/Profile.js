import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  Autocomplete,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Form, Formik } from "formik";
import PhoneInput from "react-phone-input-2";
import Page from "src/component/Page";
import { GrEdit } from "react-icons/gr";
import { HiLocationMarker } from "react-icons/hi";

import React, { useState, useContext, useEffect } from "react";
import "src/scss/main.css";
import {
  useNavigate,
  Link as RouterComponent,
  useLocation,
} from "react-router-dom";
import * as yep from "yup";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import { AuthContext } from "src/context/Auth";
import { UserContext } from "src/context/User";
import { IoMdArrowBack } from "react-icons/io";
import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";
import { result } from "lodash";

const useStyles = makeStyles((theme) => ({
  headbox: {
    padding: "42px 80px 20px 80px",
    "@media (max-width: 920px)": {
      padding: "30px 40px 20px 40px",
    },
    "@media (max-width: 599px)": {
      padding: "20px 20px 20px 20px",
    },
    "& .MuiDialog-paperWidthSm": {
      maxWidth: "504px",
      borderRadius: "9px",
    },
    "& .cardCss": {
      borderRadius: "20px",
      background: " #F5F5F5",
      width: "-webkit-fill-available",
      padding: "20px",
    },
    "& .cardSubText": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "16px !important",
      lineHeight: "normal !important",
      color: "#172624 !important",

      "@media (max-width: 920px)": {},
      "@media (max-width: 599px)": {},
    },
    "& .cardLink": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "16px !important",
      lineHeight: "normal !important",
      color: "#0593FC !important",

      "@media (max-width: 920px)": {},
      "@media (max-width: 599px)": {
        wordBreak: "break-all !important",
      },
    },
    "& .cardTitle": {
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      fontSize: "20px !important",
      lineHeight: "23px !important",
      color: "#172624 !important",
      textTransform: "uppercase !important",
      "@media (max-width: 920px)": {
        fontSize: "19px !important",
        lineHeight: "23px !important",
        fontWeight: "600 !important",
        marginTop: "8px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "18px !important",
        lineHeight: "20px !important",
      },
    },
    "& .gridTextDiv": {
      display: "grid",
      gap: "15px",
    },
    "& .flexdiv": {
      display: "flex",
      gap: "23px",
      "@media (max-width: 599px)": {
        display: "flex",
        gap: "15px",
        flexDirection: "column",
      },
    },
    "& .parentdiv": {
      display: "flex",
      gap: "10%",
      // "@media (max-width: 599px)": {
      //   display: "flex",
      //   gap: "15px",
      //   flexDirection:"column"
      // },
    },
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
    "& .flexBox": {
      display: "flex",
      justifyContent: "space-between",
      "@media (max-width: 599px)": {
        display: "block",
      },
    },
  },
  Explore: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal",
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
  Loginlabelall: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
  },
  LoginTextBox: {
    borderRadius: "10px",
    background: " #fff",
    fontSize: "16px",
    color: "black",
    marginTop: "6px !important",
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
      fontSize: "16px !important",
      lineHeight: "125% !important",
      fontWeight: "400 !important",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "18px 16px !important",
    },
  },
  websiteInput: {
    border: "none",
    padding: "0px ",
    "& .MuiOutlinedInput-root": {
      background: "transparent !important",
    },
  },
  webTextBox: {
    borderRadius: "10px",
    background: "transparent",
    "& .MuiOutlinedInput-root": {
      background: "transparent !important",
    },
    "& .MuiOutlinedInput-input": { padding: "10px 8px !important" },
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.50) !important",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "125%",
    },
    "& .MuiInputBase-input": {
      color: "#0593FC !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "400 !important",
      fontSize: "16px !important",
      lineHeight: "normal !important",
      background: "transparent !important",
      width: "-webkit-fill-available",
      border: "none !important",
      width: "-webkit-fill-available",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "18px 16px !important",
    },
  },
  TextBoxFormControl: {
    "& .MuiOutlinedInput-root": {
      background: "#fff",
    },
    "& .MuiOutlinedInput-input": {
      padding: "18px 16px",
    },
  },
  SubmitBtnBox: {
    textAlign: "center",
    marginTop: "30px",
    "@media (max-width: 600px)": {
      marginTop: "20px",
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
    color: "#fff !important",
    lineHeight: "16px !important",
    background: "#172624 !important",
    borderRadius: "6px !important",
    padding: "20px !important",
    textTransform: "uppercase !important",
    // [theme.breakpoints.down('md')]: {
    //   fontSize: "14px",
    // },
    maxWidth: "500px !important",
    // maxWidth: "350px",
    // height: "50px",
  },
  checkDiv: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "0px",
    "& .MuiSvgIcon-root": {
      color: "#172624 !important",
    },
  },
  formikGridContainer: {
    marginTop: "8px",
  },
  firstGrid: {
    marginTop: "16px !important",
    "@media (max-width: 600px)": {
      marginTop: "10px !important",
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
}));

export default function Profile() {
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:599px)");
  const [cities, setCities] = useState([]);
  const [latLongVerification, setLatLongVerification] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  const [isloading, setLoader] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const auth = useContext(AuthContext);
  const location = useLocation();
  const [profilePic, setProfilePic] = useState("");
  const [mergedList, setMergedList] = useState([]);
  const [listItems, setListItems] = useState([]);

  const user = useContext(UserContext);
  const [selectItem, setSelectItem] = useState(
    user?.profile?.profile?.sector_name || ""
  );
  const [sectorId, setSectorId] = useState();
  const [sectorList, setSectorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [userData, setUserData] = useState({
    id: "",
    contact_name: "",
    sector: "",
    company_phone: "",
    company_name: "",
    company_email: "",
    city: "",
    state: "",
    zipcode: "",
    company_address: "",
    company_website: "",
    image: "",
    hide: false,
    user: "",
  });
  const [webSite, setwebSite] = useState("");
  const [editWebSite, setEditWebSite] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    user?.profile?.profile?.category_name || "Select Service"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    if (user?.profile?.profile?.category_name) {
      getSectorData(user?.profile?.profile?.category_id);
      setSelectedCategoryId(user?.profile?.profile?.category_id);
      setSelectedCategory(user?.profile?.profile?.category_name);
      setSelectItem(user?.profile?.profile?.sector_name);
    }
  }, [user?.profile?.profile?.category_name]);

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
  const handleListLocation = async (values) => {
    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${values}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
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

  const [profileData, setProfileData] = useState(profilePic);

  useEffect(() => {
    setProfilePic(
      user?.profile?.user_info?.image
        ? `${ApiConfig.imagGet}${user?.profile?.user_info?.image}`
        : ""
    );
    setUserData(user?.profile?.user_info);
    setwebSite(user?.profile?.user_info?.company_website);
  }, [user?.profile?.user_info]);

  const navigate = useNavigate();

  const handleFormSubmit = async (values) => {
    console.log(values);
    if (webSite != "") {
      setLoader(true);
      try {
        const formData = new FormData();
        if (profileData) {
          formData.append(`image`, profileData);
        }
        formData.append("sector", parseInt(sectorId));
        formData.append("category_id", selectedCategoryId);
        formData.append("category_name", selectedCategory);
        formData.append("sector_id", parseInt(sectorId));
        formData.append("sector_name", selectItem);

        formData.append("company_website", values.companyWebsite);
        formData.append("company_name", values.companyName);
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
        formData.append("email", localStorage.getItem("email"));
        formData.append("contact_name", values.contactName);
        formData.append("category_id", selectedCategoryId);

        formData.append("hide", values.check === true ? true : false);

        const res = await Axios.post(ApiConfig.editprofileinfo, formData, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 200 || res.status === 201) {
          // Check status directly, assuming responseCode is returned correctly
          toast.success("You are successfully updated profile");
          setEditWebSite(true);
          // resetForm({ values: "" });
          setProfilePic(res.data.image);
          navigate("/edit-profile", {
            state: {
              profileData: {
                user_info: {
                  id: res?.data?.id || "",
                  contact_name: res?.data?.contact_name || "",
                  sector: res?.data?.sector || "",
                  company_phone: res?.data?.company_phone || "",
                  company_name: res?.data?.company_name || "",
                  company_email: res?.data?.company_email || "",
                  city: res?.data?.city || "",
                  state: res?.data?.state || "",
                  zipcode: res?.data?.zipcode || "",
                  company_address: res?.data?.company_address || "",
                  company_website: res?.data?.company_website || "",
                  image: res?.data?.image || "",
                  hide: res?.data?.hide || "",
                  user: res?.data?.user || "",
                },
                user_sector: res?.data?.sector || "",
              },
            },
          });
          setLoader(false);
          user.getViewMyProfile();
        }
      } catch (error) {
        setLoader(false);
        if (error.response?.data?.error) {
          // const errorMessage = await errolor.response.json().message; // Parse error response JSON
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later."); // Handle unexpected errors
        }
      }
    } else {
      toast.error(
        "Ensure the company website field is not empty. Kindly provide the required information."
      );
    }
  };
  const handleImageSelect = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setProfileData(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileData(profilePic);
    }
  };
  const checkValue = (value) => {
    if (value == "null" || value == "None") {
      return "";
    } else if (value) {
      return value;
    } else {
      return "";
    }
  };
  const formInitialSchema = {
    // firstName: checkValue(location.state?.profileData?.user_info?.first_name),
    // lastName: checkValue(location.state?.profileData?.user_info?.last_name),
    // businessName: checkValue(
    //   location.state?.profileData?.user_info?.company_name
    // ),
    // sector: checkValue(location.state?.profileData?.profile?.sector_name),
    // check: location.state?.profileData?.user_info?.hide,
    companyName: checkValue(
      location.state?.profileData?.user_info?.company_name
    ),
    companyWebsite: checkValue(
      location.state?.profileData?.user_info?.company_website
    ),
    companyEmail: checkValue(
      location.state?.profileData?.user_info?.company_email
    ),
    companyPhone: checkValue(
      location.state?.profileData?.user_info?.company_phone
    ),
    // Zipcode: "",
    contactName: checkValue(
      location.state?.profileData?.user_info?.contact_name
    ),
    contactEmail: checkValue(location.state?.profileData?.user_info?.email),
    companyAddress: checkValue(
      location.state?.profileData?.user_info?.company_address
    ),
  };

  return (
    <Page title="Setting">
      <Box className={classes.headbox}>
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <IoMdArrowBack
                  style={{ fontSize: "35px", cursor: "pointer" }}
                  onClick={() => {
                    navigate("/add-services");
                  }}
                />

                <Typography className="title">Edit company profile</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className="cardCss" style={{ marginBottom: "15px" }}>
                <div className="flexdiv">
                  <div className="parentdiv">
                    <div
                      style={{
                        display: "grid",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <img
                          src={
                            profilePic
                              ? profilePic ==
                                  `${ApiConfig.imagGet}/media/null` ||
                                profilePic == `${ApiConfig.imagGet}/media/None`
                                ? "images/defaultPic.png"
                                : profilePic
                              : "images/defaultPic.png"
                          }
                          alt=""
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                      {isSmallScreen ? (
                        <></>
                      ) : (
                        <div className={classes.editBox}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple="false"
                            className={classes.editInput}
                            onChange={(e) => handleImageSelect(e)}
                          />
                          <Button className={classes.Explore}>
                            Upload Logo Image
                          </Button>
                        </div>
                      )}
                    </div>
                    <div
                      className="gridTextDiv"
                      style={
                        editWebSite ? {} : { width: "-webkit-fill-available" }
                      }
                    >
                      <div style={{ position: "relative" }}>
                        {editWebSite ? (
                          <>
                            <Typography className="cardLink">
                              {userData?.company_website
                                ? userData?.company_website
                                : "--"}
                            </Typography>
                            {/* <div
                            style={{
                              position: "absolute",
                              top: "0",
                              right: "-23px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setEditWebSite(false);
                            }}
                          >
                            <GrEdit />
                          </div> */}
                          </>
                        ) : (
                          <TextField
                            placeholder="Enter Business Name"
                            type="text"
                            variant="outlined"
                            fullWidth
                            id="inputID"
                            size="small"
                            inputProps={{ maxLength: 256 }}
                            value={webSite ? webSite : ""}
                            name="company Name"
                            className={classes.webTextBox}
                            onChange={(e) => {
                              setwebSite(e.target.value);
                            }}
                            InputProps={{
                              style: { border: "none" },
                            }}
                            // autoFocus={true}
                          />
                        )}
                      </div>
                      <Typography className="cardSubText">
                        Subscription Type: None
                      </Typography>
                      <Typography className="cardSubText">
                        Property Listed:{" "}
                        {localStorage.getItem("PropertyCount") - 1 < 1
                          ? 0
                          : localStorage.getItem("PropertyCount") - 1}
                        /
                        {user?.profile?.plan?.feature_count
                          ? user?.profile?.plan?.feature_count
                          : 0}
                      </Typography>
                    </div>
                  </div>
                  {!isSmallScreen ? (
                    <></>
                  ) : (
                    <div className={classes.editBox}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple="false"
                        className={classes.editInput}
                        onChange={(e) => handleImageSelect(e)}
                      />
                      <Button className={classes.Explore}>
                        Upload Logo Image
                      </Button>
                    </div>
                  )}
                </div>  
              </Box>
              <Box className="cardCss">
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
                    companyWebsite: yep
                      .string()
                      .required("Please enter your company's website")
                      .matches(
                        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+)(\/[^\s]*)?$/,
                        "Please enter a valid website URL"
                      ),
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

                    // companyAddressContinued: yep.string(),
                    // state: yep.object().nullable(),
                    // // .required("Select a state"),
                    // city: yep.string().required("Please enter your city"),
                    check: yep
                      .bool()
                      .oneOf(
                        [true],
                        "Please check the box to confirm you are not a robot."
                      ),
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
                    <Form style={{ paddingTop: "16px" }}>
                      <Grid
                        container
                        spacing={2}
                        className={classes.formikGridContainer}
                      >
                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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
                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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
                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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

                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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

                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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
                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
                          <Typography
                            className={classes.Loginlabelall}
                            style={{ marginBottom: "7px" }}
                          >
                            Service
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
                                    style: {
                                      padding: "0px",
                                      margin: "0px               ",
                                    },
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
                        <Grid xs={12} sm={6} item className={classes.firstGrid}>
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
                                setLatLongVerification(false);
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

                        <Grid item xs={12} className={classes.firstGrid}>
                          <div className={classes.checkDiv}>
                            <Checkbox
                              type="checkbox"
                              name="check"
                              onChange={handleChange}
                              value={values.check}
                              checked={values.check}
                              style={{ width: "20px", height: "20px" }}
                            />
                            <Typography className={classes.alreadyAccount}>
                              Hide personal name from public/community
                            </Typography>
                          </div>
                        </Grid>
                        <Grid item xs={12}>
                          <Box className={classes.SubmitBtnBox} mt={2}>
                            <Button
                              type="submit"
                              fullWidth
                              className={classes.buttonbox}
                              disabled={isloading}
                            >
                              Submit
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
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} style={{ marginTop: "15px" }}>
              <ChangePassword classes={classes} />
            </Grid>
            <Grid item xs={12} sm={6} style={{ marginTop: "15px" }}>
              <ChangeEmail classes={classes} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Page>
  );
}
