import React, { useContext, useEffect, useRef, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { MdMenu as MenuIcon } from "react-icons/md";
// import MenuIcon from "@mui/icons-material/Menu";
import { IoIosArrowForward } from "react-icons/io";
import { AuthContext } from "src/context/Auth";
import { useNavigate } from "react-router-dom";
import Scroll from "react-scroll";
import { useLocation } from "react-router-dom";
import { Drawer, Grid, List, ListItem } from "@mui/material";
import { FaChevronDown } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa6";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { ScrollContext } from "src/context/ScrollContext";

const ScrollLink = Scroll.Link;

const useStyles = makeStyles((theme) => ({
  "@global": {
    "@font-face": [
      {
        fontFamily: "Balbek",
        src: `url(/fonts/Balbek.otf) format('opentype')`,
        fontWeight: "normal",
        fontStyle: "normal",
      },
    ],
  },
  root: {
    flexGrow: 1,
    display: "block",
    "@media(max-width:1200px)": {
      display: "none",
    },
  },
  root1: {
    display: "none",
    "@media(max-width:1200px)": {
      display: "block",
    },
  },
  drawerButton: {
    "@media(max-width:599px)": {
      position: "absolute",
      right: "5%",
    },
  },
  menuButton: {
    // marginRight: theme.spacing(2),
  },
  "MuiToolbar-root": {
    paddingButtom: "0px",
  },

  toolbar: {
    display: "flex",
    minHeight: "54px !important",
    justifyContent: "space-between",
  },
  toolbar2: {
    display: "flex",
    paddingLeft: "35px !imporatant",
    minHeight: "50px !important",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    justifyContent: "space-between",
  },
  linkButtonsDiv: {
    display: "flex",
    gap: "14px",
    "@media(max-width:1200px)": {
      flexDirection: "column",
    },
  },
  logo: {
    maxWidth: "130px",
    paddingLeft: "24px",
    marginTop: "10px",
    "@media(max-width:500px)": {
      paddingLeft: "0px !important",
    },
  },
  logoMain: {
    maxWidth: "200px",
  },
  spotSmartT: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "15.2381px",
    lineHeight: "18px",
    color: "#172624",
    cursor: "pointer",
    padding: "12px 24px",
    textTransform: "none",
    minWidth: "120px",
    height: "75px",
    background: "#D19A1D",
    "& .MuiSelect-icon": {
      color: "#fff",
    },
  },
  register: {
    background: "#D19A1D",
    borderRadius: "0px",
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "18px",
    lineHeight: "18px",
    color: "#172624",
    cursor: "pointer",
    padding: "12px 24px",
    textTransform: "none",
    minWidth: "120px",
    height: "75px",
  },
  Login: {
    fontFamily: "'Noto Sans', sans-serif !important",
    // borderRadius: "20px",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    color: "#000 !important",
    cursor: "pointer !important",
    minWidth: "80px",
    maxHeight: "64px",
    overflow: "hidden",

    "&:hover": {
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.5)",
    },
  },
  linkButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    lineHeight: "16px !important",
    color: "#000 !important",
    cursor: "pointer !important",
  },
  linkButton1: {
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal !important",
    fontWeight: "600 !important",
    fontSize: "16px !important",
    lineHeight: "20px !important",
    color: "#000 !important",
    cursor: "pointer !important",
    marginLeft: "15px",
  },
  navbarMenuButton: {
    backgroundColor: "#3f51b5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#303f9f",
    },
  },
  navbarMenu: {
    "& .MuiPaper-root": {
      backgroundColor: "#f5f5f5",
    },
  },
  registerBox: {
    display: "flex",
    maxHeight: "64px",
    overflow: "hidden",
    "& .MuiButton-root:hover": {},
  },
  drawerRight: {
    "& .MuiDrawer-paperAnchorRight": {
      background: "#fff",
      padding: "30px 20px",
      height: "-webkit-fill-available",
    },
  },

  toolbarlogo: {
    display: "flex",
    height: "-webkit-fill-available",
    justifyContent: "space-between",
    "@media(max-width:599px)": {
      justifyContent: "start !important",
    },
  },
  divider: {
    borderLeft: "1px solid rgba(247, 246, 241, 0.20)",
    height: "64px",
  },
  customSelectBox: {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    alignItems: "center",
    // minWidth: "120px",
    background: "#D19A1D",
    padding: "18px 18px !important",
    borderRadius: "6px ",
    "@media(max-width:1337px)": {
      padding: "18px 18px",
    },
    "& .contentTypo": {
      color: "rgb(23, 38, 36)",
      display: "flex",
      textTransform: "uppercase",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "600",
      fontSize: "16px",
      lineHeight: "16px",
      cursor: "pointer",
    },
  },
  dropdownContent: {
    position: "absolute",
    borderRadius: "0 0 0 4px",
    background: "#FFF",
    boxShadow: "0px 4px 14px 0px rgba(0, 0, 0, 0.18)",
    width: "-webkit-fill-available",
    padding: "20px",
    display: "grid",
    gap: "30px",
    zIndex: "1",
    "& .contentTypo": {
      color: "rgb(23, 38, 36)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      textTransform: "uppercase",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "600",
      fontSize: "16px",
      lineHeight: "16px",
      cursor: "pointer",
    },
  },
}));

export default function TopBar() {
  const { scrollToCarousel } = useContext(ScrollContext);
  const classes = useStyles();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const [openDrawerContent, setOpenDrawerContent] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(false);
  }, [window.location.pathname]);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorEl1, setAnchorEl1] = React.useState(null);
  const [webPath, setwebPath] = React.useState("");
  const [selected, setSelected] = useState(
    location.pathname == "/login"
      ? "Sign In"
      : location.pathname == "/register" ||
        location.pathname == "/company-information"
      ? "Sign Up"
      : "Select options"
  );
  useEffect(() => {
    setSelected(
      location.pathname == "/login"
        ? "Sign In"
        : location.pathname == "/register" ||
          location.pathname == "/company-information"
        ? "Sign Up"
        : "Select options"
    );
    setwebPath(location.pathname);
  }, [location.pathname]);

  const [CategoryList, setCategoryList] = useState([]);

  const dropdownRef = useRef(null);

  const handleOptionClick = (option) => {
    setIsOpen(false);
    setSelected(option);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDrawerOpen = () => {
    setOpenDrawerContent(!openDrawerContent);
  };

  const handleDrawerClose = () => {
    setOpenDrawerContent(false);
  };
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      setLogIn(true);
    } else setLogIn(false);
  }, [token]);

  useEffect(() => {
    getCategoryData();
  }, []);
  const getCategoryData = async (values) => {
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

  return (
    <>
      <div className={classes.root}>
        <AppBar
          position="static"
          color="default"
          style={{
            height: "110px",
            justifyContent: "center",
            position: "fixed",
            zIndex: "2000",
            borderBottom: "1px solid rgba(247, 246, 241, 0.20)",
          }}
        >
          <Box>
            <Toolbar className={classes.toolbar}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  className={classes.logoMain}
                  src="/images/geodakaLogo.png"
                  onClick={() => {
                    navigate("/");
                    setIsOpen(false);
                  }}
                />

                <Box
                  style={{
                    width: "1px",
                    height: "40px",
                    backgroundColor: "gray",
                  }}
                ></Box>
                <img
                  className={classes.logo}
                  src="/images/logoNew.png"
                  onClick={() => {
                    navigate("/");
                    setIsOpen(false);
                  }}
                />
              </Box>

              <Box className={classes.registerBox}>
                <Button
                  className={classes.Login}
                  onClick={() => {
                    navigate("/pro-network");
                    handleDrawerClose();
                  }}
                >
                  Join Our Pro Map Network{" "}
                  {/* <IoIosArrowForward
                  style={{ color: "#000", fontSize: "18px", marginLeft: "4px" }}
                /> */}
                </Button>
                {webPath != "/map" ? (
                  <div>
                    {auth.userLoggedIn && localStorage.getItem("token") ? (
                      <Box
                        onClick={() => {
                          navigate("/add-services");
                        }}
                        className={`${classes.customSelectBox}`}
                        style={{ padding: "24px 26px", marginLeft: "10px" }}
                      >
                        <p className="contentTypo">Go to My Account</p>
                        <IoIosArrowForward
                          style={{
                            color: "#000",
                            fontSize: "18px",
                            marginLeft: "4px",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        className={`${classes.customSelectBox} ${
                          isOpen ? classes.dropdownContentVisible : ""
                        }`}
                        onClick={() => setIsOpen(!isOpen)}
                        ref={dropdownRef}
                        style={
                          selected === "Select options" ||
                          (auth.userLoggedIn && localStorage.getItem("token"))
                            ? {}
                            : { padding: "22px 26px" }
                        }
                      >
                        <p className="contentTypo">
                          {selected === "Select options"
                            ? "Sign In/up"
                            : selected}
                        </p>
                        <FaChevronDown
                          style={{
                            fontSize: "20px",
                            color: "rgb(0, 0, 0, 0.8)",
                          }}
                        />
                      </Box>
                    )}
                    {isOpen && (
                      <div className={`${classes.dropdownContent}`}>
                        <p
                          key={"Sign In"}
                          onClick={() => {
                            handleOptionClick("Sign In");
                            navigate("/login");
                          }}
                          className="contentTypo"
                        >
                          Sign In{" "}
                          <FaAngleRight
                            style={{
                              fontSize: "20px",
                              color: "rgb(0, 0, 0, 0.8)",
                            }}
                          />
                        </p>
                        <p
                          key={"Sign UP"}
                          onClick={() => {
                            handleOptionClick("Sign UP");
                            navigate("/register");
                          }}
                          className="contentTypo"
                        >
                          Sign UP{" "}
                          <FaAngleRight
                            style={{
                              fontSize: "20px",
                              color: "rgb(0, 0, 0, 0.8)",
                            }}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
              </Box>
            </Toolbar>
            <Toolbar className={classes.toolbar2}>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "32px",
                }}
              >
                <Box className={classes.linkButtonsDiv}>
                  <Button
                    className={classes.linkButton}
                    style={{ fontSize: "14px !important" }}
                  >
                    <ScrollLink
                      className=""
                      onClick={() => {
                        navigate("/");
                        setIsOpen(false);
                        setSelected("Select options");
                      }}
                      smooth={true}
                      duration={500}
                      to="home-bar"
                      style={{ cursor: "pointer" }}
                    >
                      <span style={webPath === "/" ? { color: "#D19A1D" } : {}}>
                        Home
                      </span>
                    </ScrollLink>
                  </Button>
                  <Button
                    className={classes.linkButton}
                    style={{ fontSize: "14px !important" }}
                  >
                    <ScrollLink
                      className=""
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate("/home-services");
                      }}
                    >
                      <span style={webPath === "" ? { color: "#D19A1D" } : {}}>
                        Home Owners
                      </span>
                    </ScrollLink>
                  </Button>
                  <Button
                    className={classes.linkButton}
                    style={{ fontSize: "14px !important" }}
                  >
                    <ScrollLink
                      className=""
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate("/home-service-providers");
                      }}
                    >
                      <span style={webPath === "" ? { color: "#D19A1D" } : {}}>
                        Home Service Providers
                      </span>
                    </ScrollLink>
                  </Button>

                  <Button
                    className={classes.linkButton}
                    style={{ fontSize: "14px !important" }}
                  >
                    <ScrollLink
                      className=""
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate("/aec-consultants");
                      }}
                    >
                      <span style={webPath === "" ? { color: "#D19A1D" } : {}}>
                        AEC Consultants
                      </span>
                    </ScrollLink>
                  </Button>

                  <Button className={classes.linkButton}>
                    <ScrollLink
                      className=""
                      onClick={() => {
                        navigate("/my-subscriptions");
                      }}
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        style={
                          webPath === "/my-subscriptions"
                            ? { color: "#D19A1D" }
                            : {}
                        }
                      >
                        Pricing
                      </span>
                    </ScrollLink>
                  </Button>
                  <Button className={classes.linkButton}>
                    <ScrollLink
                      className=""
                      onClick={() => {
                        navigate("/map");
                      }}
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        style={webPath === "/map" ? { color: "#D19A1D" } : {}}
                      >
                        Go to Map
                      </span>
                    </ScrollLink>
                  </Button>
                  <Button
                    className={classes.linkButton}
                    style={{ fontSize: "14px !important" }}
                  >
                    {/* <ScrollLink
                      className=""
                      smooth={true}
                      duration={500}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate("/refund");
                      }}
                    >
                      <span style={webPath === "" ? { color: "#D19A1D" } : {}}>
                        Refund Policy
                      </span>
                    </ScrollLink> */}
                  </Button>
                </Box>
              </Box>

              <Box className={classes.registerBox}>
                <Button className={classes.linkButton}>
                  <ScrollLink
                    className=""
                    smooth={true}
                    duration={500}
                    onClick={() => {
                      navigate("/about-us");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <span style={webPath === "" ? { color: "#D19A1D" } : {}}>
                      About Us{" "}
                    </span>
                  </ScrollLink>
                </Button>
                <Button className={classes.linkButton}>
                  <ScrollLink
                    onClick={() => {
                      navigate("/contact-us", {
                        state: {
                          mapView: "map",
                        },
                      });
                      setIsOpen(false);
                    }}
                    smooth={true}
                    duration={500}
                    // to="map-bar"
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      style={
                        webPath === "/contact-us" ? { color: "#D19A1D" } : {}
                      }
                    >
                      Contact Us
                    </span>
                  </ScrollLink>
                </Button>
              </Box>
            </Toolbar>
          </Box>
        </AppBar>
      </div>
      <div className={classes.root1}>
        <AppBar
          position="static"
          color="default"
          style={{
            minHeight: "64px !important",
            height: "64px",
            position: "fixed",
            zIndex: "2000",
          }}
        >
          <Toolbar className={classes.toolbarlogo}>
            <Box>
              <img
                className={classes.logo}
                src="/images/geodakaLogo.png"
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
              />
            </Box>
            <Box>
              <img
                className={classes.logo}
                src="/images/logoNew.png"
                onClick={() => {
                  navigate("/");
                  setIsOpen(false);
                }}
              />
            </Box>
            <Box className={classes.drawerButton}>
              <MenuIcon onClick={handleDrawerOpen} />
            </Box>
          </Toolbar>
          {openDrawerContent && (
            <Drawer
              anchor="right"
              open={openDrawerContent}
              onClose={handleDrawerClose}
              className={classes.drawerRight}
            >
              <Grid container>
                <Grid
                  item
                  xs={12}
                  className={classes.gridfour}
                  style={{ width: "10rem" }}
                >
                  <List>
                    <img
                      style={{ maxWidth: "140px" }}
                      src="/images/Logo.png"
                      onClick={() => {
                        navigate("/");
                        setIsOpen(false);
                        handleDrawerClose();
                      }}
                    />

                    <ListItem className={classes.linkButton1}></ListItem>
                    <Box className={classes.linkButtonsDiv}>
                      {webPath !== "/" && (
                        <Button
                          className={classes.linkButton}
                          style={{ fontSize: "14px !important" }}
                        >
                          <ScrollLink
                            className=""
                            onClick={() => {
                              navigate("/");
                              handleDrawerClose();
                              setIsOpen(false);
                              setSelected("Select options");
                            }}
                            smooth={true}
                            duration={500}
                            to="home-bar"
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={
                                webPath === "/" ? { color: "#D19A1D" } : {}
                              }
                            >
                              Home
                            </span>
                          </ScrollLink>
                        </Button>
                      )}
                      <Button
                        className={classes.linkButton}
                        style={{ fontSize: "14px !important" }}
                      >
                        <ScrollLink
                          className=""
                          smooth={true}
                          duration={500}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleDrawerClose();
                            navigate("/home-service-providers");
                          }}
                        >
                          <span
                            style={webPath === "" ? { color: "#D19A1D" } : {}}
                          >
                            Home Service Providers
                          </span>
                        </ScrollLink>
                      </Button>

                      <Button
                        className={classes.linkButton}
                        style={{ fontSize: "14px !important" }}
                      >
                        <ScrollLink
                          className=""
                          smooth={true}
                          duration={500}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            handleDrawerClose();
                            navigate("/aec-consultants");
                          }}
                        >
                          <span
                            style={webPath === "" ? { color: "#D19A1D" } : {}}
                          >
                            AEC Consultants
                          </span>
                        </ScrollLink>
                      </Button>

                      <Button className={classes.linkButton}>
                        <ScrollLink
                          className=""
                          smooth={true}
                          duration={500}
                          onClick={() => {
                            navigate("/about-us");
                            handleDrawerClose();
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            style={webPath === "" ? { color: "#D19A1D" } : {}}
                          >
                            About Us{" "}
                          </span>
                        </ScrollLink>
                      </Button>
                      <Button className={classes.linkButton}>
                        <ScrollLink
                          className=""
                          onClick={() => {
                            navigate("/my-subscriptions");
                            handleDrawerClose();
                          }}
                          smooth={true}
                          duration={500}
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            style={
                              webPath === "/my-subscriptions"
                                ? { color: "#D19A1D" }
                                : {}
                            }
                          >
                            Pricing
                          </span>
                        </ScrollLink>
                      </Button>
                    </Box>
                    <ListItem
                      className={classes.linkButton1}
                      onClick={() => {
                        navigate("/pro-network");
                        handleDrawerClose();
                      }}
                    >
                      Join Our Pro Map Network
                    </ListItem>
                    {auth.userLoggedIn && localStorage.getItem("token") ? (
                      <ListItem
                        onClick={() => {
                          navigate("/add-services");
                        }}
                        className={classes.register}
                      >
                        <p className="contentTypo">Go to My Account</p>
                        {/* <IoIosArrowForward
                          style={{
                            color: "#000",
                            fontSize: "18px",
                            marginLeft: "4px",
                          }}
                        /> */}
                      </ListItem>
                    ) : (
                      <></>
                    )}
                    {auth.userLoggedIn && localStorage.getItem("token") ? (
                      <></>
                    ) : (
                      <ListItem
                        style={{ maxWidth: "100px", minWidth: "100px" }}
                        className={classes.linkButton1}
                        onClick={() => {
                          handleDrawerClose();
                          navigate("/login");
                        }}
                      >
                        Sign In
                      </ListItem>
                    )}
                    {auth.userLoggedIn && localStorage.getItem("token") ? (
                      <></>
                    ) : (
                      <ListItem
                        style={{ maxWidth: "150px", minWidth: "150px" }}
                        className={classes.register}
                        onClick={() => {
                          handleDrawerClose();
                          navigate("/register");
                        }}
                      >
                        Sign Up
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </Drawer>
          )}
        </AppBar>
      </div>
    </>
  );
}
