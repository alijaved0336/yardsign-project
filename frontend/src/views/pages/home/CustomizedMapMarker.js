import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    MenuItem,
    FormControl,
    Select,
    Grid,
    Paper,
    IconButton,
    InputAdornment,
    TextField,
    InputLabel,
    Container,
    Drawer,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { IoIosArrowForward } from "react-icons/io";
import ApiConfig from "src/config/APICongig";
import Carousel from "react-material-ui-carousel";
import { useLocation, useNavigate } from "react-router-dom";



const useStyles = makeStyles((theme) => ({
    mainContainer: {
        marginTop: "80px",
        "@media (max-width: 1280px)": {
            "& .MuiContainer-maxWidthLg": {},
        },
        "@media (max-width: 1280px)": {
            marginTop: "60px",
        },
        "@media (max-width: 920px)": {
            marginTop: "40px",
        },
        "@media (max-width: 599px)": {
            marginTop: "30px",
        },
    },
    headbox: {
        "& .title": {
            color: "#172624 !important",
            fontFamily: "Big Shoulders Display, sans-serif !important",
            fontSize: "42px !important",
            fontStyle: "normal !important",
            fontWeight: "800 !important",
            lineHeight: "51px !important",
            textAlign: 'center',
            margin: "15px",
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
        "& .innerTitle": {
            color: "#172624 !important",
            fontFamily: "Big Shoulders Display, sans-serif !important",
            fontSize: "32px !important",
            fontStyle: "normal !important",
            fontWeight: "700 !important",
            lineHeight: "42px !important",
            "@media (max-width: 920px)": {
                fontSize: "30px !important",
                lineHeight: "40px !important",
            },
            "@media (max-width: 599px)": {
                fontSize: "24px !important",
                lineHeight: "30px !important",
            },
        },
        "& .ExploreButton": {
            fontFamily: "'Noto Sans', sans-serif !important",
            borderRadius: "6px !important",
            fontStyle: "normal !important",
            fontWeight: "700 !important",
            fontSize: "18px !important",
            lineHeight: "18px !important",
            color: "#172624 !important",
            cursor: "pointer",
            padding: "12px 24px !important",
            background: "#D19A1D !important",
            minHeight: "56px !important",
            minWidth: "200px !important",
            marginTop: "30px",
            marginBottom: "20px",
            "&:hover": {
                color: "#172624 !important",
                background: "#D19A1D !important",
            },
            "@media (max-width: 540px)": {
                width: "-webkit-fill-available !important",
                marginTop: "20px !important",
                marginBottom: "15px",
            },
        },
        "& .bodyText": {
            fontFamily: "'Noto Sans', sans-serif !important",
            fontStyle: "normal !important",
            fontWeight: "700 !important",
            // fontSize: "20px !important",
            lineHeight: "26px !important",
            color: "#000 !important",
            margin: "10px 0px !important",
            "@media (max-width: 599px)": {
                fontSize: "18px !important",
                lineHeight: "24px !important",
            },
        },
        "& .imgBox": {
            height: "100%",
            alignItems: "center",
            display: "flex",
        },
    },

    footertypo: {
        textAlign: 'center',
        fontWeight: '800 !important',
        fontFamily: "'Noto Sans', sans-serif !important",
        fontSize: '20px'
    },
    SwipeableDrawer: {
        maxWidth: "300px",
        "& .imgvideoList": {
            display: "flex",
            gap: "8px",
            alignItems: "center",
            overflow: "auto"
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
        borderRadius: "24px",
        background: "#172624",
        padding: "12px",
        fontFamily: "'Noto Sans', sans-serif",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: "14px",
        marginTop:'10px',
        lineHeight: "150%",
        color: "#fff",
        boxShadow: "0px 2px 20px 0px rgba(107, 107, 107, 0.20)",
        "@media (max-width: 1125px)": {
            display: "none",
        },
    },
    dividerin: {
        borderBottom: "1px solid #7911b7",
        margin: "25px 0",
    },
    fence: {
        fontFamily: "'Noto Sans', sans-serif",
        fontStyle: "normal",
        fontWeight: "600",
        fontSize: "20px",
        lineHeight: "20px",
        color: "#5A5A5A",
    },
    fenceTitle: {
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
}));

export default function CustomizedMapMarker() {

    const classes = useStyles();
    const navigate = useNavigate();


    const [consumerInfoData, setConsumerInfoData] = useState({
        file: [
            "images/Yardsignpro3.jpg",
            "images/Yardsignpro3.jpg",
            "images/Yardsignpro3.jpg"
        ],
        user_info: [],
    });

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

    function Item(props) {
        if (props.item != null) {
            return (

                <img
                    className={classes.imgCustom}
                    src={props.item}
                    alt="DashImage"
                    style={{ height: "300px" }}
                />

            );
        } else {
            return null;
        }
    }
    const [loadingCarousel, setLoadingCarousel] = useState(true); // State variable to track loading state of Carousel

    const handleCarouselLoad = () => {
        // Callback function to handle the load event of the Carousel
        setLoadingCarousel(false); // Set loading state to false once Carousel is loaded
    };

    return (
        <>
            <Container>
                <Box className={classes.headbox} style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Typography className="title" >
                        Customize Map Marker Pop UP Panel
                    </Typography>
                </Box>

                {/*In first col Adding component here */}
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    <Grid xs={6}>

                        <div style={{ display: "flex", padding: '30px 0', justifyContent: "center", backgroundColor: "rgb(247 199 89 / 68%)", borderRadius: '40px' }}>

                            <Box className={classes.SwipeableDrawer}>
                                {loadingCarousel && (
                                    <div className={classes.skeletonLoaderDiv}>
                                        <div className={classes.loaderCss}></div>
                                    </div>
                                )}

                                <div style={{ height: "272px" }}>
                                    <Carousel
                                        style={{ maxHeight: "200px" }}
                                        duration={1000}
                                        animation="slide"
                                        onChange={handleCarouselLoad}
                                        autoPlay
                                        indicatorIconButtonProps={{
                                            style: {
                                                color: "rgb(255, 255, 255)",
                                            },
                                        }}
                                        activeIndicatorIconButtonProps={{
                                            style: {
                                                color: "rgb(255, 255, 255, 0.5)",
                                            },
                                        }}
                                        CarouselButtonWrapper={{
                                            style: {
                                                height: "100% !important",
                                                position: "absolute",
                                                backgroundColor: "transparent  !important",
                                            },
                                        }}
                                        indicatorContainerProps={{
                                            style: {
                                                marginTop: "-24px",
                                                height: "20px !important",
                                                textAlign: "center",
                                                zIndex: "1",
                                                position: "relative",
                                            },
                                        }}
                                    >
                                        {consumerInfoData?.file
                                            .map((item, i) => (
                                                <Item key={i} item={item} />
                                            ))}
                                    </Carousel>
                                </div>
                                <div style={{ padding: "20px 0 10px 24px" }}>
                                    <div style={{ marginRight: "24px" }}>
                                        <div style={{ marginTop: "35px" }}>
                                            <Typography className={classes.fenceTitle}>
                                            GODIN CONSTRUCTION
                                            </Typography>
                                           
                                            <Typography className={classes.fence}>
                                            Home Builders
                                            </Typography>
                                        </div>

                                        <div className={classes.dividerin}></div>
                                        <Button
                                            onClick={() => {
                                                // window.open(
                                                //   `${
                                                //     consumerInfoData?.user_info[0]?.company_website || ""
                                                //   }`,
                                                //   "_blank"
                                                // );
                                                handleButtonClick(
                                                    consumerInfoData?.user_info[0]?.company_website || ""
                                                );
                                            }}
                                            className={classes.buttonCss1}
                                        >
                                            Go to Our Web Site{" "}
                                        </Button>
                                        <div className={classes.dividerin}></div>
                                        <Typography
                                            className="fenceTitle"
                                            style={{ fontSize: "30px", textAlign:'center' }}
                                        >
                                            Images & Videos
                                        </Typography>
                                    </div>
                                    <div className="imgvideoList">
                                        {consumerInfoData?.file?.map((item, i) => {
                                            const fileExtension = item?.split(".")?.pop();

                                            if (
                                                fileExtension == "png" ||
                                                fileExtension == "jpg" ||
                                                fileExtension == "jpeg" ||
                                                fileExtension == "webp"
                                            ) {
                                                return (
                                                    <img
                                                        src={`${item}`}
                                                        alt=""
                                                        style={{ height: "156px", borderRadius: "12px" }}
                                                    />
                                                );
                                            } else {
                                                if (item?.video_file != null) {
                                                    return (
                                                        <div>
                                                            <video
                                                                controls
                                                                src={`${item}`}
                                                                style={{ height: "156px" }}
                                                            ></video>
                                                        </div>
                                                    );
                                                }
                                            }
                                        })}
                                    </div>
                                    <div className="newCard">
                                        {/* <Typography>Are you an AEC Consultant?</Typography> */}
                                        <Button
                                            onClick={() => {
                                                navigate("/pricing");
                                            }}
                                            className={classes.Activebutton}
                                        >
                                            Join Our Map Pro Network{" "}
                                            <IoIosArrowForward
                                                style={{ color: "#fff", fontSize: "20px" }}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            </Box>
                        </div>
                    </Grid>
                    <Box className={classes.headbox} style={{marginLeft:'auto', alignItems:'center'}}>
                        {/*In Second col Adding information here */}
                        <div>
                            <Grid xs={6} style={{ display: "inline",alignItems:'center'}}>
                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                }}>
                                    <div style={{ paddingTop: "15px" }}>
                                        <img
                                            src="images/Star.svg"
                                            style={{ marginRight: "12px" }}
                                            alt=""
                                        />
                                    </div>
                                    <Typography className="bodyText">
                                        Upload your Favorite Image
                                    </Typography>
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                }}>
                                    <div style={{ paddingTop: "15px" }}>
                                        <img
                                            src="images/Star.svg"
                                            style={{ marginRight: "12px" }}
                                            alt=""
                                        />
                                    </div>
                                    <Typography className="bodyText">
                                        Customer Click Right to your Website URL.
                                    </Typography>
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                }}>
                                    <div style={{ paddingTop: "15px" }}>
                                        <img
                                            src="images/Star.svg"
                                            style={{ marginRight: "12px" }}
                                            alt=""
                                        />
                                    </div>
                                    <Typography className="bodyText">
                                        Upload Company Video's (or we can make them for You)
                                    </Typography>
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: "10px",
                                }}>
                                    
                                    <Typography className="bodyText" style={{fontSize:'17px'}}>
                                        <p>Special Offer - Sign Up for Free 60 Day Trial and we will make your<br />
                                        Great New Digital Yard Sign For you - can edit and revise anytime!</p>
                                    </Typography>
                                </div>
                            </Grid>
                        </div>

                    </Box>
                </Grid>

            </Container>
        </>
    )
}
