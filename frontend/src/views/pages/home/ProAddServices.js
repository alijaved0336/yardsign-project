import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import ProListServices from "../dashBoard/pricing/ProListServices";


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
        "& .manageCssResponsiveness": {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "5px",
            "@media (max-width: 750px)": {
                display: "grid",
                justifyContent: "center",
                gap: "10px",
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
        "& .innerScrollDiv": {
            overflow: "auto",
            maxWidth: "280px",
            background: "#ECF3F2",
            padding: "10px",
            "@media (max-width: 750px)": { maxWidth: "413px", }
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
        marginBottom: "20px",
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
    headline: {

    }
}));

export default function ProAddServices() {
    const classes = useStyles();
    const [imgIcon, setImgIcon] = useState("images/icons/defaultIconLogo.svg");
    const [uploadData, setUploadData] = useState([]);
    return (
        <>

            <Box className={classes.headbox}>
                <Typography className="title" style={{ textAlign: "center", margin: "40px", }}>
                    Manage Subscription from Easy to Use Company Dashboard
                </Typography>
                <Box>
                    <ProListServices
                        uploadData={uploadData}
                        classes={classes}
                        imgIcon={imgIcon}
                    />
                </Box>
            </Box>
        </>
    );
}
