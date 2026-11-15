import React, { useContext, useEffect, useState } from "react";
import PricingCards from '../dashBoard/pricing/PricingCards';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    Drawer,
    FormControl,
    FormHelperText,
    Grid,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    CardContent,
    Card,
    Container,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import { UserContext } from "src/context/User";



const useStyles = makeStyles(() => ({
    headbox: {
        borderRadius: "20px",
        padding: "60px 30px 10px",
        // marginTop: "80px",
        // overflow: "auto",
        "@media (max-width: 599px)": {
            padding: "30px 30px 10px",
          },
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
        fontSize: "16px",
        lineHeight: "150%",
    },
    listBox: {
        display: "flex",
        gap: "10px",
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
        padding: "25px 30px",
        position: "relative",
        maxWidth: "400px",
        margin: "0 auto",
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


}));
export default function ProUpgrade() {
    const classes = useStyles();
    const [expiry, setExpiry] = useState(true);
    const [Eyebutton, setEyebutton] = useState(true);
    const [profilePic, setProfilePic] = useState("images/defaultPic.png");
    const user = useContext(UserContext);
    const [subDetails, SetSubDetails] = useState([
        {
            planName: user?.profile?.plan?.plan_name || "--",
            type: "",
            expiaryDate: user?.profile?.plan?.expiry_date || "--",
            months: "1",
            features: [
                {
                    name: `${user?.profile?.plan?.feature_count || 12} Digital Yard Sign`,
                    status: true,
                },
            ],
        },
    ]);

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

    return (
        <>
        <Container>
            <Grid spacing={2}>
                <Grid  item xs={12}>
                    <Grid className={classes.headbox}>
                        <Typography variant="h4" style={{textAlign:"center",  marginBottom: "20px" }}>
                            Go To My Subscriptions to Upgrade to Small Business, Business or Corporate Plan
                        </Typography>
                      
                            <Box>
                                <Typography variant="h4">
                                    Digital Yard Sign Pricing{" "}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography className="subTitle">
                                    Current Plan :{" "}
                                    {user?.profile?.plan?.plan_name
                                        ? user?.profile?.plan?.plan_name
                                        : "Free 60 Day Trial"}
                                </Typography>
                            </Box>
                </Grid>
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

                <Box>
                    <section>
                        <PricingCards type="Hide" />
                    </section>
                </Box>
            </Grid>
        </Grid >
        </Container>
        </>
    )
}


