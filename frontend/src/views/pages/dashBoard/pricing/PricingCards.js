import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useContext, useEffect, useState } from "react";
import Page from "src/component/Page";
import { UserContext } from "src/context/User";
import { FaCheck } from "react-icons/fa6";
import { MdClear } from "react-icons/md";
import { AuthContext } from "src/context/Auth";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";

const useStyles = makeStyles((theme) => ({
  headbox: {
    borderRadius: "20px",
    padding: "60px 30px 10px",
    "@media (max-width: 599px)": {
      padding: "30px 30px 10px",
    },
    // marginTop: "80px",
    // overflow: "auto",
    "& .subTitle": {
      fontFamily: "'Noto Sans', sans-serif !important",
      fontStyle: "normal !important",
      fontWeight: "600 !important",
      fontSize: "22px !important",
      lineHeight: "22px !important",
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
    minHeight: '350px',
    boxSizing: "border-box",
    Stroke: "Linear Gradient #FFFFFF 0% rgba(255, 255, 255, 0) 100% ",
  },
  cardContentBox: {
    display: "grid",
    gap: "15px",
    padding: "25px 21px !important",
    minHeight:"300px"
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
  list2: {
    color: "#FFFFFF",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "14px",
    lineHeight: "150%",
    "@media (max-width: 899px)": {
      fontSize: "22px !important",
    },
  },
  listBox: {
    display: "flex",
    gap: "10px",
    minHeight:"62px"
  },
  Gridcard1: {
    transition: "transform .2s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  popular: {
    background: "#D19A1D",
    boxShadow:
      "inset -2.65117px -2.65117px 2.65117px rgba(0, 0, 0, 0.1), inset 2.65117px 2.65117px 2.65117px rgba(255, 255, 255, 0.1)",
    borderRadius: "7.95059px",
    // padding: "7px 24px",
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
  buttonFlexDiv: {
    display: "flex",
    gap: "3px",
    justifyContent: "center",
    marginBottom: "-18px",
  },

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
  NoButton: {
    padding: "9px",
    background: "#161616",
    borderRadius: "5px",
    color: "#fff",
    border: "1px solid #D19A1D",
    height: "35px",
  },
}));

export default function PricingCards(props) {
  const classes = useStyles();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [buttonValue, setButtonValue] = useState("month");
  const [botDetails, SetBotDetails] = useState([]);
  const [buySubscription, setBuySubscription] = useState(true);
  const [subValue, setsubValue] = useState(null);
  const [subscribeType, setSubscribeType] = useState("");
  const user = useContext(UserContext);

  useEffect(() => {
    getPlanDetails();
  }, []);

  const getPlanDetails = async (values) => {
    const token = localStorage.getItem("token");
    function customSort(a, b) {
      if (a.price === "Free" && b.price !== "Free") {
        return -1; // "Free" comes before other prices
      } else if (a.price !== "Free" && b.price === "Free") {
        return 1; // "Free" comes before other prices
      } else {
        // Sort by price in increasing order
        return parseFloat(a.price) - parseFloat(b.price);
      }
    }
    try {
      const res = await Axios({
        method: "GET",
        url: ApiConfig.subscription,
      });
      if (res.status === 200) {
        const sortedData = res.data.sort(customSort);
        SetBotDetails(sortedData)
      } else {
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  return (
    <>
    <Container>
      <Page title="Pricing">
        <Box className={classes.headbox}>
          <Box mb={3}>
            <Grid container spacing={2} style={{ alignItems: "center" }}>
              <Grid item lg={12} xs={12}>
                <Typography variant="h4">Digital Yard Sign Pricing </Typography>
                <Typography className="subTitle">
                  Start Your Digital Add Campaign Today - Gets New Leads Tomorrow!
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box className={classes.backBox}>
                  <Grid container>
                    {buySubscription ? (
                      <>
                        <Grid
                          className={classes.togglebtn}
                          item
                          xs={12}
                          sx={{ paddingTop:{
                            xs:"0px",
                            sm:"20px",
                            md:"38px"
                          } }}
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
                                      sx={{ marginTop:{
                                        xs:"10px",
                                        sm:"20px",
                                        md:"40px"
                                      } }}
                                      className={classes.Gridcard1}
                                    >
                                      {value.popular ? (
                                        <div className={classes.buttonFlexDiv}>
                                          {value.popular && (
                                            <Box className={classes.popular}>
                                              Popular
                                            </Box>
                                          )}
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
                                                height:"1px"
                                              }}
                                            />
                                            <br />
                                            <div>
                                              <Typography
                                                className={classes.data1}
                                              >
                                                {value.price == "Free"?value.price : `$${value.price}/Month`}
                                              </Typography>
                                            </div>
                                          </div>

                                          <div>
                                            <List>
                                              <ListItem>
                                                <ListItemText>
                                                  <Box
                                                    className={classes.listBox}
                                                  >
                                                    <FaCheck
                                                      style={{
                                                        color: "#00C64F",
                                                      }}
                                                    />
                                                    <Typography
                                                      className={classes.list2}
                                                    >
                                                      {value?.features}{" "}Digital
                                                        Yard Signs
                                                        {/* <p>{value?.features == 12? "No Credit Card Required*": ""}</p> */}
                                                     
                                                        {/* {value.price != "Free" ? <p>( ${(value.price/value?.features).toFixed(2)} Per Yard Signs)</p>:<p>&nbsp;</p>} */}
                                                    </Typography>
                                                  </Box>
                                                </ListItemText>
                                              </ListItem>
                                            </List>
                                          </div>
                                          <Divider
                                            style={{
                                              background:
                                                "linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 48.96%, rgba(255, 255, 255, 0) 100%)",
                                              opacity: "0.5",
                                              height:"1px"
                                            }}
                                          />
                                          <div>
                                            <Button
                                              className={classes.buybtn}
                                              onClick={() => {
                                                if (
                                                  auth.userLoggedIn &&
                                                  localStorage.getItem("token")
                                                ) {
                                                  navigate("/my-subscriptions");
                                                } else {
                                                  navigate("/register");
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
                                      sx={{ marginTop:{
                                        xs:"10px",
                                        sm:"20px",
                                        md:"40px"
                                      } }}
                                      className={classes.Gridcard1}
                                    >
                                      {value.popular ? (
                                        <div className={classes.buttonFlexDiv}>
                                          {value.popular && (
                                            <Box className={classes.popular}>
                                              Popular
                                            </Box>
                                          )}
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
                                                height:"1px"
                                              }}
                                            />
                                            <br />
                                            <div>
                                              <Typography
                                                className={classes.data1}
                                              >
                                                
                                                {value.price == "Free"?value.price : `$${value.price}/Year`}                                              </Typography>
                                            </div>
                                          </div>

                                          <div>
                                            <List>
                                              <ListItem>
                                                <ListItemText>
                                                  <Box
                                                    className={classes.listBox}
                                                  >
                                                    <FaCheck
                                                      style={{
                                                        color: "#00C64F",
                                                      }}
                                                    />

                                                    <Typography
                                                      className={classes.list2}
                                                    >
                                                      {value?.features}{" "}Digital
                                                        Yard Signs
                                                        {/* <p>{value?.features == 12? "No Credit Card Required*": ""}</p> */}
                                                        {/* {value.price != "Free" ?<p>( ${((value.price/value?.features)/12).toFixed(2)} Per Yard Signs)</p>:<p>&nbsp;</p>} */}
                                                    </Typography>
                                                  </Box>
                                                </ListItemText>
                                              </ListItem>
                                            </List>
                                          </div>
                                          <Divider
                                            style={{
                                              background:
                                                "linear-gradient(to left, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 48.96%, rgba(255, 255, 255, 0) 100%)",
                                              opacity: "0.5",
                                              height:"1px"
                                            }}
                                          />
                                          <div>
                                            <Button
                                              className={classes.buybtn}
                                              onClick={() => {
                                                if (
                                                  auth.userLoggedIn &&
                                                  localStorage.getItem("token")
                                                ) {
                                                  navigate("/my-subscriptions");
                                                } else {
                                                  navigate("/register");
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
                      <></>
                    )}
                    
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Page>
      {props?.type != "Hide" &&
      <Box className={classes.headbox} textAlign={"center"}>
      <Typography variant="h4">
        Get Started Now with Free 90 Day Trial
      </Typography>
      <Typography className="subTitle">
      After Subscribing to Free 90 Day Trial -  Go to 'My Yard Signs' to Manage and Post Company Digital Yard Signs 
      </Typography>
    </Box>}
    </Container>
    </>
  );
}
