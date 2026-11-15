import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Container,
  Dialog,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useContext, useEffect, useState } from "react";
import Page from "src/component/Page";
import { UserContext } from "src/context/User";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import { FaCheck } from "react-icons/fa6";
import { MdClear } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { IoMdArrowBack } from "react-icons/io";
import Footer from "src/views/auth/Main/footer";

const useStyles = makeStyles((theme) => ({
  headbox: {
    borderRadius: "20px",
    padding: "60px 30px 10px",
    // marginTop: "80px",
    // overflow: "auto",
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
    "& .subTitleBox": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "600 !important",
      fontSize: "16px !important",
      lineHeight: "16px !important",
      color: "#000 !important",
      "@media (max-width: 599px)": {
        fontSize: "15px !important",
      },
    },
    "& h4": {
      color: "#2FF3FF",
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
    "& h5": {
      color: "#FFFFFF",
      fontSize: "18px",
      fontStyle: "normal",
      fontFamily: "'Noto Sans', sans-serif",
      fontWeight: "400",
      lineHeight: "28px",
    },
  },
  btn: {
    // borderRadius: "32px",
    background: "#161616",
    borderRadius: "32px",
    cursor: "pointer",
  },
  activetoggle: {
    borderRadius: "32px !important",
    background: "#D19A1D",
    color: "#fff",
    padding: "12px 20px",
    fontSize: "16px",
    fontStyle: "normal",
    fontFamily: "'Noto Sans', sans-serif",
    fontWeight: "600",
    lineHeight: "19px",
    border: "none",

    "&:hover": {
      background: "#D19A1D",
      border: "none",
    },
  },
  toggle: {
    color: "#fff",
    padding: "12px 26px",
    fontSize: "16px",
    fontStyle: "normal",
    fontFamily: "'Noto Sans', sans-serif",
    fontWeight: "600",
    lineHeight: "19px",
    border: "none",
    "&:hover": {
      border: "none",
    },
  },
  togglebtn: {
    justifyContent: "center",
    display: "flex",
  },
  togglebtngrid: {
    justifyContent: "center",
    display: "flex",
    // paddingTop: "44px !important",
  },
  titlediv: {
    paddingTop: "6px",
  },
  data: {
    justifyContent: "center",
    display: "flex",
    background: "#D19A1D",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "24px",
    lineHeight: "30px",
    marginTop: "9.38px",
  },
  data1: {
    justifyContent: "center",
    display: "flex",
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "28px",
    lineHeight: "31px",
  },
  card: {
    background: "#181C1F",
    borderRadius: "20px",
    width: "100%",
    // minHeight: '580px',
    boxSizing: "border-box",
    Stroke: "Linear Gradient #FFFFFF 0% rgba(255, 255, 255, 0) 100% ",
  },
  cardContentBox: {
    display: "grid",
    gap: "15px",
    padding: "25px 21px 13px 21px!important",
  },
  cardContentNormal: {
    display: "grid",  
    padding: "20px !important",
  },

  buybtn: {
    width: "100%",
    padding: "10px 20px",
    color: "#172624",
    cursor: "pointer",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "15.5938px",
    lineHeight: "19px",
    alignItems: "center",
    textAlign: "center",
    background: "#D19A1D",
    borderRadius: "6.66227px",
    "&:hover": {
      background: "#D19A1D",
      boxShadow:
        "inset -2.22076px -2.22076px 2.22076px rgba(0, 0, 0, 0.1), inset 2.22076px 2.22076px 2.22076px rgba(255, 255, 255, 0.1)",
      borderRadius: "6.66227px",
    },
  },
  list: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "150%",
  },
  list1: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "150%",
  },
  list2: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "20px",
    lineHeight: "150%",
  },
  listBox: {
    display: "flex",
    gap: "10px",
    alignItems:"center",
    minHeight: "72px",
  },
  cardButton: {
    background: "#181C1F",
    opacity: "0.8",
    borderRadius: "5.55681px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "14.2099px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
    color: "#FFFFFF",
    float: "right",
    padding: "7px 18.52px",
    border: "1px solid rgb(250, 247, 247, 0.1)",
  },
  Gridcard1: {
    transition: "transform .2s",
    marginTop: "40px",
    "@media (max-width: 599px)": {
      marginTop: "0px",
    },
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  popular: {
    background: "#D19A1D",
    boxShadow:
      "inset -2.65117px -2.65117px 2.65117px rgba(0, 0, 0, 0.1), inset 2.65117px 2.65117px 2.65117px rgba(255, 255, 255, 0.1)",
    borderRadius: "7.95059px",
    padding: "7px 24px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "14.2099px",
    lineHeight: "21px",
    display: "flex",
    textTransform: "none",
    alignItems: "center",
    textAlign: "center",
    color: "#172624",
  },
  listitem: {
    paddingTop: "10px",
  },
  buy: {
    paddingTop: "16px",
  },
  activeplanCard: {
    background: "linear-gradient(103.4deg, #161616 9.49%, #171717 114.6%)",
    border: "0.84252px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "33.7008px",
    padding: "25px 5px",
    position: "relative",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: "0px",
    },
  },
  activatedBtn: {
    background: "#D19A1D",
    borderRadius: "5px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "16px",
    lineHeight: "25px",
    color: "#000",
  },
  flexText: {
    display: "flex",
    gap: "3px",
    justifyContent: "center",
  },
  paddingtext: {
    paddingTop: "13px",
    paddingBottom: "23px",
    padding: "17px",
  },
  Boxgrid: {
    display: "grid",
    gap: "12px",
  },
  buttonFlexDiv: {
    display: "flex",
    gap: "3px",
    justifyContent: "center",
    marginBottom: "-18px",
  },
  flexgap: {
    display: "flex",
    gap: "13px",
    alignItems: "center",
  },
  currentPlanBox: {
    background: "#D19A1D",
    borderRadius: "42.126px",
    padding: "11px 20px",
    display: "flex",
    gap: "25px",
    alignItems: "center",
    justifyContent: "space-between",
    "@media(max-width:510px)": {
      display: "grid",
      justifyContent: "center",
      textAlign: "center",
    },
  },
  upgradeToBox: {
    background: "#D19A1D",
    borderRadius: "42.126px",
    padding: "11px 20px",
    display: "flex",
    gap: "25px",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  imgwidth: {
    borderRadius: "50%",
    width: "85px",
    height: "85px",
  },
  userName: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "16px",
    lineHeight: "23px",
  },
  userMail: {
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "12px",
    lineHeight: "16px",
    display: "flex",
    gap: "3px",
    alignItems: "center",
  },
  planHead: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "17px",
    lineHeight: "23px",
  },
  listBoxbutton: {
    display: "flex",
    gap: "12px",
    background: "#171717",
    borderRadius: "42.126px",
    padding: "5px 5px 5px 15px",
  },
  spotButton: {
    background: "#D19A1D",
    borderRadius: "42.126px",
    padding: "1px 7px",
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "17px",
    lineHeight: "23px",
    "&:hover": {
      background: "#D19A1D",
    },
  },
  nexPlanBox: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
    padding: "12px",
    "@media(max-width:510px)": {
      display: "grid",
      justifyContent: "center",
      textAlign: "center",
    },
  },
  autoRbutton: {
    background: "#171717",
    border: "1.68504px solid #FFFFFF",
    borderRadius: "5.05512px",
    padding: "7px 9px",
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "10px",
    lineHeight: "14px",
  },
  radioText: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "11px",
    lineHeight: "14px",
    marginTop: "7px",
  },
  continuingText: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "300",
    fontSize: "16px",
    lineHeight: "20px",
    "& li": {
      color: "#FFFFFF",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "300",
      fontSize: "16px",
      lineHeight: "18px",
    },
  },
  lastBox: {
    padding: "15px",
    // marginTop: "13px",
  },
  // backgroundBox: {
  //   background: "#D19A1D",
  //   border: "0.84252px solid rgba(255, 255, 255, 0.05)",
  //   borderRadius: "33.7008px",
  //   height: "425px",
  //   width: "100%",
  //   maxWidth: "410.83px",
  //   position: "absolute",
  //   marginRight: "60px",
  //   "@media(max-width:570px)": {
  //     display: "none",
  //   },
  // },
  switchCss: {
    "& .MuiSwitch-switchBase": {
      top: "19px !important",
    },
    "& .MuiSwitch-thumb": {
      width: "18px !important",
      height: "20px !important",
      marginTop: "-19.5px !important",
    },
    "&$checked + $track": {
      backgroundColor: "#D19A1D",
    },
    "&$disabled + $track": {
      backgroundColor: "#D19A1D",
    },
    "& .makeStyles-switch_track-121": {
      background: "#D19A1D",
    },
    "& .makeStyles-switchCss-120 ": {
      background: "#171717 !important",
    },
    "& .MuiSwitch-colorSecondary.Mui-checked": {
      color: "#008BD9",
    },
  },

  switch_track: {
    backgroundColor: "#008BD9 !important",
  },
  root: {
    width: "100%",
    height: "fit-content",
    background: "#161616",
    borderRadius: "24px",
    "& .MuiDialogContent-root": {
      flex: "none !important",
    },
    "& .MuiDialogActions-root": {
      marginRight: "0px !important",
    },
  },
  Titlemain: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "23.989px",
    lineHeight: "36px",
    color: "#fff",
  },
  subMain: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "20px",
    lineHeight: "24px",
    color: "#fff",
  },
  yesNoButton: {
    padding: "9px",
    background: "#D19A1D",
    borderRadius: "5px",
    color: "#000",
    textTransform: "capitalize",
    height: "35px",
  },
  NoButton: {
    padding: "9px",
    background: "#161616",
    borderRadius: "5px",
    color: "#fff",
    border: "1px solid #D19A1D",
    height: "35px",
  },
  loaderCss: {
    width: 15,
    height: 15,
    borderRadius: "50%",
    border: "3px solid #fff",
    borderTopColor: "transparent",
    animationName: "$spin",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  backBox: {
    background: "#F5F5F5",
    padding: "40px 8vw",
  },
  // // "& .MuiSwitch-track": {
  // //   backgroundColor: "#D19A1D !important"
  // // }
  cancelMainDiv: {
    display: "grid",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    margin: "30px 0 0 0",
  },
  cancelDiv: {
    padding: "10px",
    background: "#D19A1D",
    borderRadius: "10px",
    color: "#000",
    textTransform: "capitalize",
    height: "35px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "18.989px",
    lineHeight: "20px",
    textTransform: "uppercase",
  },
}));

export default function MySubscriptionPlan() {
  const classes = useStyles();
  const user = useContext(UserContext);
  const [buttonValue, setButtonValue] = useState("month");
  const navigate = useNavigate();
  const [botDetails, SetBotDetails] = useState([]);
  const [loaderPlan, setLoaderPlan] = useState(true);
  const [subscribeType, setSubscribeType] = useState("");
  const [popupText, setPopupText] = useState(
    "Are you sure you want to continue with this payment?"
  );
  const [loader, setLoader] = useState(false);
  const [buyId, setBuyId] = useState("");
  const [expiry, setExpiry] = useState(true);
  const [subDetails, SetSubDetails] = useState([
    {
      planName: user?.profile?.plan?.plan_name || "--",
      type: "",
      expiaryDate: user?.profile?.plan?.expiry_date || "--",
      months: "1",
      features: [
        {
          name: `${user?.profile?.plan?.feature_count || 0} Digital Yard Sign`,
          status: true,
        },
      ],
    },
  ]);
  useEffect(() => {
    SetSubDetails([
      {
        planName: user?.profile?.plan?.plan_name || "--",
        type: "",
        expiaryDate: user?.profile?.plan?.expiry_date || "--",
        months: "1",
        features: [
          {
            name: `${user?.profile?.plan?.feature_count || 0
              } Digital Yard Sign`,
            status: true,
          },
        ],
      },
    ]);
  }, [user?.profile?.plan?.feature_count]);
  const [open, SetOpen] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [Eyebutton, setEyebutton] = useState(true);

  useEffect(() => {
    if (user?.profile?.plan?.expiry_date) {
      const isExpired = (expiryDate) => {
        const currentDate = moment();
        const expiry = moment(expiryDate);
        return expiry.isBefore(currentDate);
      };
      let result = isExpired(user?.profile?.plan?.expiry_date);
      //  let result = isExpired("01-04-2025");
      setExpiry(result);
    } else {
      setExpiry(true);
    }
  }, [user?.profile?.plan?.expiry_date]);
  const nickName = user?.profile?.user_info?.company_name
    ? user?.profile?.user_info?.company_name
    : "--";
  const email = user?.profile?.user_info?.company_email
    ? user?.profile?.user_info?.company_email
    : "--";

  const [profilePic, setProfilePic] = useState("images/defaultPic.png");
  useEffect(() => {
    let pic = user?.profile?.user_info?.image
      ? `${ApiConfig.imagGet}${user?.profile?.user_info?.image}` ==
        `${ApiConfig.imagGet}/media/null` ||
        `${ApiConfig.imagGet}${user?.profile?.user_info?.image}` ==
        `${ApiConfig.imagGet}/media/None`
        ? "images/defaultPic.png"
        : `${ApiConfig.imagGet}${user?.profile?.user_info?.image}`
      : "images/defaultPic.png";
    setProfilePic(pic);
  }, [user?.profile?.user_info?.image]);
  const expiry_date = user?.profile?.plan?.expiry_date
    ? user?.profile?.plan?.expiry_date
    : "--";
  const plane_name = user?.profile?.plan?.plan_name
    ? user?.profile?.plan?.plan_name
    : "--";

  // get spot plan details api integration

  const getPlanDetails = async (values) => {
    const token = localStorage.getItem("token");
    setLoaderPlan(true);
    function customSort(a, b) {
      if (
        a.price.toLowerCase() === "free" &&
        b.price.toLowerCase() !== "free"
      ) {
        return -1;
      } else if (
        a.price.toLowerCase() !== "free" &&
        b.price.toLowerCase() === "free"
      ) {
        return 1;
      } else {
        if (
          a.price.toLowerCase() !== "free" &&
          b.price.toLowerCase() !== "free"
        ) {
          return parseFloat(a.price) - parseFloat(b.price);
        } else {
          return 0;
        }
      }
    }
    try {
      const res = await Axios({
        method: "GET",
        url: ApiConfig.subscription,
      });
      if (res.status === 200) {
        const sortedData = res.data.sort(customSort);
        SetBotDetails(sortedData);
        setLoaderPlan(false);
      }
    } catch (error) {
      if (error?.response?.message) {
      } else {
      }
    }
  };

  useEffect(() => {
    getPlanDetails();
  }, []);
  const buyPlan = async (values) => {
    const token = localStorage.getItem("token");
    if(!token) 
    {
      toast.error("Please SignUp First")
      navigate("/register")
      return
    }
    if (values.planname === "Unlimited") {
      setLoader(true);
      try {
        const res = await Axios({
          method: "POST",
          url: ApiConfig.buyUnlimitedPlanData,
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res?.status === 200 || res?.status === 201) {
          setLoader(false);
          toast.success(
            res?.data?.message ||
            "Your unlimited plan has been activated successfully."
          );
          handleClose();
          user.getViewMyProfile();
        } else {
          toast.error(res?.data?.error);
          setLoader(false);
          handleClose();
        }
      } catch (error) {
        if (error?.response?.data.error) {
          toast.error(error?.response?.data.error);
          setLoader(false);
          handleClose();
        } else {
          toast.error("Something went wrong!");
          setLoader(false);
          handleClose();
        }
      }
    } else if (values.price.toLowerCase() === "free") {
      setLoader(true);
      try {
        const res = await Axios({
          method: "POST",
          url: ApiConfig.buyFreePlanData,
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json", // Add this header for Axios
          },
        });
        if (res?.status === 200 || res?.status === 201) {
          setLoader(false);
          toast.success(
            res?.data?.message ||
            "Your 90-day plan has been activated successfully."
          );
          handleClose();
          user.getViewMyProfile();
        } else {
          toast.error(res?.data?.error);
          setLoader(false);
          handleClose();
        }
      } catch (error) {
        if (error?.response?.data.error) {
          toast.error(error?.response?.data.error);
          setLoader(false);
          handleClose();
        } else {
          toast.error("Something went wrong!");
          setLoader(false);
          handleClose();
        }
      }
    } else {
      setLoader(true);
      try {
        const res = await Axios({
          method: "POST",
          url: ApiConfig.buyPlanData,
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json", // Add this header for Axios
          },
          data: JSON.stringify({
            plan_id: values.id,
            quantity: 1,
            price: parseFloat(values.price),
            name: values.planname,
            validityType: values.validityType,
          }),
        });
        if (res?.status === 200) {
          // SetBotDetails(res.data.result);
          // toast.success("Plan activated successfully");
          window.open(res?.data?.url);
          // getPlanDetails();
          setLoader(false);
          handleClose();
        } else {
          toast.error(res?.data?.error);
          setLoader(false);
          handleClose();
        }
      } catch (error) {
        if (error?.response?.data.error) {
          toast.error(error?.response?.data.error);
          setLoader(false);
          handleClose();
        } else {
          toast.error("Something went wrong!");
          setLoader(false);
          handleClose();
        }
      }
    }
  };

  const handleClose = () => {
    SetOpen(false);
  };
  // auto renew api

  const handleChange = (event, newValue) => {
    setAutoRenewal(newValue);
    autoRenew(newValue);
  };
  const autoRenew = async (values) => {
    const token = localStorage.getItem("token");

    try {
      const res = await Axios({
        method: "POST",
        url: ApiConfig.autoRenew,
        headers: { token: token },
        params: {
          autoRenew: values == true ? "ON" : "OFF",
        },
      });

      if (res.data.statusCode === 200) {
        console.log("success");
      } else {
        console.log("error");
      }
    } catch (error) {
      if (error?.response?.data?.responseMessage) {
        toast.error(error.response.data.responseMessage);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };
  // get renewal status
  return (
    <>
      <Page title="Pricing">
        <Box className={classes.headbox}>
          <Box mb={3}>
            <Grid container spacing={2} style={{ alignItems: "center" }}>
              <Grid item lg={12} xs={12}>
                <Box
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <IoMdArrowBack
                    style={{ fontSize: "35px", cursor: "pointer" }}
                    onClick={() => {
                      navigate("/add-services");
                    }}
                  />
                  <Typography variant="h4">
                    Digital Yard Sign Pricing{" "}
                  </Typography>
                </Box>

                {expiry ? (
                  <Typography className="subTitle">
                  Start your Free 90 Day Trial or Upgrade to Full Service and Benefits 
                  </Typography>
                ) : (
                  <Typography className="subTitle">
                    Current Plan :{" "}
                    {user?.profile?.plan?.plan_name
                      ? user?.profile?.plan?.plan_name
                      : "--"}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box className={classes.backBox}>
                  {loaderPlan ? (
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        height: "30vh",
                        alignItems: "center",
                      }}
                    >
                      <div class="three-body">
                        <div class="three-body__dot"></div>
                        <div class="three-body__dot"></div>
                        <div class="three-body__dot"></div>
                      </div>
                    </Box>
                  ) : (
                    <Grid container>
                      {expiry ? (
                        <>
                          <Grid
                            className={classes.togglebtn}
                            item
                            xs={12}
                            style={{ paddingTop: "38px" }}
                          >
                            <ButtonGroup className={classes.btn}>
                              <Button
                                className={
                                  buttonValue === "month"
                                    ? classes.activetoggle
                                    : classes.toggle
                                }
                                onClick={() => {
                                  setButtonValue("month");
                                  // getSpotBotDetails("SpotBot");
                                }}
                              >
                                Per Month
                              </Button>
                              <Button
                                className={
                                  buttonValue === "year"
                                    ? classes.activetoggle
                                    : classes.toggle
                                }
                                onClick={() => {
                                  setButtonValue("year");
                                  // getSpotBotDetails("FutureBot");
                                }}
                              >
                                Per annual
                              </Button>
                            </ButtonGroup>
                          </Grid>
                          <Grid container spacing={2}>
                            {buttonValue == "month"
                              ? botDetails &&
                              botDetails?.map((value, i) => {
                                if (value.validityType == "month") {
                                  return (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={6}
                                      lg={3}
                                      md={3}
                                      style={{}}
                                      className={classes.Gridcard1}
                                    >
                                      {value.popular ? (
                                        <div
                                          className={classes.buttonFlexDiv}
                                        >
                                          {value.popular && (
                                            <Box className={classes.popular}>
                                              Popular
                                            </Box>
                                          )}{" "}
                                          {/* <Box className={classes.cardButton}>
                                            Save ${value.save}
                                          </Box> */}
                                        </div>
                                      ) : (
                                        <span
                                          style={{
                                            height: "17px",
                                            display: "block",
                                          }}
                                        ></span>
                                      )}
                                      <Card className={classes.card}>
                                        <CardContent
                                          className={classes.cardContentBox}
                                        >
                                          <div>
                                            <Typography
                                              className={classes.data}
                                            >
                                              {value.planname}
                                            </Typography>
                                            <br />
                                            <Divider
                                              style={{
                                                background:
                                                  "rgba(255, 255, 255, 0.4)",
                                                opacity: "0.5",
                                              }}
                                            />
                                            <br />
                                            <div>
                                              <Typography
                                                className={classes.data1}
                                              >
                                                {value.price == "Free"
                                                  ? value.price
                                                  : "$" + value.price}
                                              </Typography>
                                            </div>
                                          </div>

                                          <div>
                                            <List>
                                              <ListItem>
                                                <ListItemText>
                                                  <Box
                                                    className={
                                                      classes.listBox
                                                    }
                                                    style={
                                                      value?.features < 99
                                                        ? { gap: "20px" }
                                                        : {}
                                                    }
                                                  >
                                                    <FaCheck
                                                      style={{
                                                        color: "#00C64F",
                                                      }}
                                                    />
<div>
                                                    <Typography
                                                      className={
                                                        classes.list2
                                                      }
                                                    >
                                                      {value?.features
                                                        ? `${value?.features} Digital
                                                      Yard Signs`
                                                        : "--"}
                                                      {value?.features ==
                                                        25 ? (
                                                        <p>
                                                          No Credit Card
                                                          Required*
                                                        </p>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </Typography>
                                                    {/* {value.price != "Free" && <Typography
                                                        className={
                                                          classes.list2
                                                        }
                                                      >( ${(value.price/value?.features).toFixed(2)} Per Yard Signs)</Typography>} */}
                                                  </div></Box>
                                                </ListItemText>
                                              </ListItem>
                                            </List>
                                          </div>
                                          <Divider
                                            style={{
                                              background:
                                                "linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 48.96%, rgba(255, 255, 255, 0) 100%)",
                                              opacity: "0.5",
                                            }}
                                          />
                                          <div>
                                            <Button
                                              className={classes.buybtn}
                                              disabled={loader || value.planname == user?.profile?.plan?.plan_name ? user?.profile?.plan?.expiry_date : false}
                                              onClick={() => {
                                                setBuyId(value);
                                                SetOpen(true);
                                                if (value.price == "Free") {
                                                  setPopupText(
                                                    "     Start My 90 Day Free Trial"
                                                  );
                                                } else if (value.planname === "Unlimited") {
                                                  setPopupText("Activate Unlimited Plan");
                                                } else {
                                                  setPopupText(
                                                    "Are you sure you want to continue with this payment?"
                                                  );
                                                }   
                                              }}
                                            >
                                              Get Started
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  );
                                }
                              })
                              : botDetails &&
                              botDetails?.map((value, i) => {
                                if (value.validityType == "year") {
                                  return (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={6}
                                      lg={3}
                                      md={3}
                                      className={classes.Gridcard1}
                                    >
                                      {value.popular ? (
                                        <div
                                          className={classes.buttonFlexDiv}
                                        >
                                          {value.popular && (
                                            <Box className={classes.popular}>
                                              Popular
                                            </Box>
                                          )}{" "}
                                          {/* <Box className={classes.cardButton}>
                                            Save ${value.save}
                                          </Box> */}
                                        </div>
                                      ) : (
                                        <span
                                          style={{
                                            height: "17px",
                                            display: "block",
                                          }}
                                        ></span>
                                      )}
                                      <Card className={classes.card}>
                                        <CardContent
                                          className={classes.cardContentBox}
                                        >
                                          <div>
                                            <Typography
                                              className={classes.data}
                                            >
                                              {value.planname}
                                            </Typography>
                                            <br />
                                            <Divider
                                              style={{
                                                background:
                                                  "rgba(255, 255, 255, 0.4)",
                                                opacity: "0.5",
                                              }}
                                            />
                                            <br />
                                            <div>
                                              <Typography
                                                className={classes.data1}
                                              >
                                                {value.price == "Free"
                                                  ? value.price
                                                  : "$" + value.price}
                                              </Typography>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <List>
                                              <ListItem>
                                                <ListItemText>
                                                  <Box
                                                    className={
                                                      classes.listBox
                                                    }
                                                    style={
                                                      value?.features < 99
                                                        ? { gap: "20px" }
                                                        : {}
                                                    }
                                                  >
                                                    <FaCheck
                                                      style={{
                                                        color: "#00C64F",
                                                      }}
                                                    />

                                                    <div>
                                                      <Typography
                                                        className={
                                                          classes.list2
                                                        }
                                                      >
                                                        {value?.features}{" "}
                                                        Digital Yard Signs
                                                        <p>
                                                          {value?.features ==
                                                            25
                                                            ? "No Credit Card Required*"
                                                            : ""}
                                                        </p>
                                                      </Typography>
                                                     {/* {value.price != "Free" && <Typography
                                                        className={
                                                          classes.list2
                                                        }
                                                      >( ${((value.price/value?.features)/12).toFixed(2)} Per Yard Signs)</Typography>} */}
                                                    </div>
                                                  </Box>
                                                </ListItemText>
                                              </ListItem>
                                            </List>
                                          </div>
                                          {/* one card */}
                                          <Divider
                                            style={{
                                              background:
                                                "linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 48.96%, rgba(255, 255, 255, 0) 100%)",
                                              opacity: "0.5",
                                            }}
                                          />
                                          <div>
                                            <Button
                                              className={classes.buybtn}
                                              disabled={loader || value.planname == user?.profile?.plan?.plan_name ? user?.profile?.plan?.expiry_date : false}
                                              onClick={() => {
                                                setBuyId(value);
                                                SetOpen(true);
                                                if (value.price == "Free") {
                                                  setPopupText(
                                                    "     Start My 90 Day Free Trial"
                                                  );
                                                } else {
                                                  setPopupText(
                                                    "Are you sure you want to continue with this payment?"
                                                  );
                                                }
                                              }}
                                            >
                                              Get Started
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  );
                                }
                              })}

                          </Grid>
                        </>
                      ) : (
                        <Grid item xs={12} className={classes.togglebtngrid}>
                          <Box className={classes.backgroundBox}></Box>
                          <Card className={classes.activeplanCard}>
                            <CardContent>
                              {subDetails?.map((values, index) => {
                                return (
                                  <Box className={classes.Boxgrid}>
                                    <Box className={classes.flexgap}>
                                      <img
                                        src={
                                          profilePic
                                            ? profilePic
                                            : "/images/profile.svg"
                                        }
                                        alt="profile"
                                        className={classes.imgwidth}
                                      />
                                      <div>
                                        <Typography
                                          className={classes.userName}
                                        >
                                          {nickName.substring(0, 20)}
                                        </Typography>
                                        <Typography
                                          className={classes.userMail}
                                        >
                                          Email:
                                          {Eyebutton
                                            ? email && email.substring(0, 40)
                                            : email
                                              .split("")
                                              .map(() => "*")
                                              .join("")
                                              .substring(0, 40)}
                                          {Eyebutton ? (
                                            <img
                                              src="/images/Eye.png"
                                              alt=""
                                              style={{
                                                width: "15px",
                                              }}
                                              onClick={() =>
                                                setEyebutton(!Eyebutton)
                                              }
                                            />
                                          ) : (
                                            <img
                                              src="/images/Hide.png"
                                              alt=""
                                              style={{
                                                width: "15px",
                                              }}
                                              onClick={() =>
                                                setEyebutton(!Eyebutton)
                                              }
                                            />
                                          )}
                                        </Typography>
                                      </div>
                                    </Box>
                                    <Box className={classes.currentPlanBox}>
                                      <Typography className={classes.planHead}>
                                        CURRENT PLAN
                                      </Typography>
                                      <div className={classes.listBoxbutton}>
                                        <Typography
                                          className={classes.planHead}
                                        >
                                          {expiry ? "InActive" : "Active"}&nbsp;
                                        </Typography>
                                        {/* <Button className={classes.spotButton}>
                                        {values.type === "SpotBot"
                                          ? "SPOT"
                                          : "Future"}
                                      </Button> */}
                                      </div>
                                    </Box>
                                    <Box className={classes.lastBox}>
                                      <div>
                                        <Typography
                                          className={classes.continuingText}
                                        >
                                          {/* By continuing,
                                        <br />
                                        I agree to YARDSIGNPRO Activation Service
                                        Agreement. <br />
                                        <br /> */}
                                          You unlocked the following features
                                          {values?.features?.map((data) => {
                                            return <li>{data?.name}</li>;
                                          })}
                                          {/* ＊You need to connect to your Exchange
                                        account to start trading. */}
                                        </Typography>
                                      </div>
                                    </Box>
                                    <Box className={classes.nexPlanBox}>
                                      <Typography className={classes.planHead}>
                                        Plan Expiration Date -{" "}
                                        {moment(values.expiaryDate).format(
                                          "Do MMM YYYY"
                                        )}
                                      </Typography>
                                      {/* <div>
                                      <Switch
                                        className={classes.switchCss}
                                        classes={{
                                          track: classes.switch_track,
                                          // switchBase: classes.switch_base,
                                          // colorPrimary: classes.switch_primary,
                                        }}
                                        onChange={handleChange}
                                        defaultChecked={autoRenewal}
                                        // color="default"
                                      />
                                    </div> */}
                                    </Box>
                                    {/* <Box className={classes.upgradeToBox}>
                                    <Typography className={classes.planHead}>
                                      {user?.profile?.plan?.plan_name
                                        ? user?.profile?.plan?.plan_name
                                        : "--"}
                                    </Typography>
                                  </Box> */}
                                    <Box
                                      className={classes.upgradeToBox}
                                      onClick={() => {
                                        setExpiry(true);
                                      }}
                                    >
                                      <Typography className={classes.planHead}>
                                        {"Upgrade Plan"}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box>
        <Footer />
      </Box>
      </Page>

      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
          PaperProps={{
            classes: {
              root: classes.root,
            },
            style: {
              maxWidth: 380,
              width: "100%",
            },
          }}
        >
          <Box
            style={{
              display: "grid",
              gap: "20px",
              textAlign: "center",
              margin: "30px 31px",
            }}
          >
            <Box>
              <Typography
                style={{ fontSize: "18px" }}
                className={classes.subMain}
              >
                {popupText}
              </Typography>
            </Box>

            <Box
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <Button
                className={classes.yesNoButton}
                disabled={loader}
                fullWidth
                onClick={() => {
                  buyPlan(buyId);
                }}
              >
                Confirm &nbsp;
                {loader && <div className={classes.loaderCss}></div>}
              </Button>
              <Button
                className={classes.NoButton}
                onClick={handleClose}
                fullWidth
                autoFocus
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </>
  );
}
