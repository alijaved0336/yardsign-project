import React, { useState, useContext, useEffect, useRef } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Dialog,
  TextField,
  InputAdornment,
  Hidden,
  SvgIcon,
  Paper,
  Typography,
  Button,
  Drawer,
  Grid,
  List,
  ListItem,
  CircularProgress,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import { Menu as MenuIcon } from "react-feather";
import SwipeableTemporaryDrawer from "./RightDrawer";
import Logo from "src/component/Logo";
import DialogContent from "@mui/material/DialogContent";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsContext from "src/context/SettingsContext";
import { AuthContext } from "src/context/Auth";
import { MdOutlinePriceChange } from "react-icons/md";
import { UserContext } from "src/context/User";
import ConfirmationDialog from "src/component/ConfirmationDialog";
import Axios from "axios";
import Scroll from "react-scroll";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import { FaAngleRight } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";

const ScrollLink = Scroll.Link;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: "block",
    "@media(max-width:700px)": {
      display: "none",
    },
  },
  drawerButton: {
    "@media(max-width:599px)": {
      position: "absolute",
      right: "5%",
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
  toolbarlogo: {
    display: "flex",
    height: "-webkit-fill-available",
    justifyContent: "space-between",
    "@media(max-width:599px)": {
      justifyContent: "start !important",
    },
  },
  root1: {
    display: "none",
    "@media(max-width:700px)": {
      display: "block",
    },
  },
  logo: {
    maxWidth: "200px",
    // marginRight: theme.spacing(2),
    "@media(max-width:599px)": {
      maxWidth: "120px",
    },
  },
  dropdownContent: {
    position: "absolute",
    top: "65px",
    right: "0px",
    borderRadius: "0 0 0 4px",
    background: "#FFF",
    boxShadow: "0px 4px 14px 0px rgba(0, 0, 0, 0.18)",
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
  searchBox: {
    // "@media(max-width:900px)": {
    //   display: "none",
    // },
  },

  linkButton: {
    cursor: "pointer",
    // display: "flex",
    gap: "10px",
    color: "black",
    fontWeight: 600,
    backgroundColor: "transparent",
    justifyContent: "space-evenly",
    alignItems: "center",
    minWidth: "120px",
    padding: "17px 26px",
    "&:hover": {
      color: "#D19A1D",
    },
  },
  linkButtonIcon: {
    cursor: "pointer",
    // display: "flex",
    // gap: "10px",
    color: "white",
    // fontWeight:600,
    backgroundColor: "transparent",
    border: "1px solid #D19A1D",
    justifyContent: "space-evenly",
    alignItems: "center",
    minWidth: "60px",
    paddingLeft: "26px",
    paddingRight: "26px",
    // padding: "17px 26px",
    "&:hover": {
      backgroundColor: "#D19A1D",
    },
  },

  customSelectBox: {
    gap: "10px",
    cursor: "pointer",
    display: "flex",
    padding: "18px 18px !important",
    position: "relative",
    background: "#D19A1D",
    alignItems: "center",
    borderRadius: "6px",
    justifyContent: "space-between",
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
  toolbar: {
    paddingRight: "0px !important",
    display: "flex",
    justifyContent: "space-between",
  },
}));

const TopBar = ({ className, onMobileNavOpen, ...rest }) => {
  const user = useContext(UserContext);
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDrawerContent, setOpenDrawerContent] = useState(false);
  const themeSeeting = useContext(SettingsContext);
  const [isloading, setIsloading] = useState(false);
  const navigate = useNavigate();
  const [webPath, setwebPath] = useState("");
  const auth = useContext(AuthContext);

  const confirmationHandler = () => {
    setOpen(false);
    navigate("/login");
    auth.userLogIn("", false);
    handleLogOut();
    window.localStorage.removeItem("token");
    window.localStorage.clear();
  };

  const handleLogOut = async (values) => {
    try {
      const res = await Axios.post(
        ApiConfig.logout,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        user.cleanProfile();
      }
    } catch (error) {
      console.log("ERROR", error?.response?.data?.error);
      // Handle error here
    }
  };

  const handleDrawerOpen = () => {
    setOpenDrawerContent(!openDrawerContent);
  };

  const handleDrawerClose = () => {
    setOpenDrawerContent(false);
  };
  return (
    <>
      <div className={classes.root}>
        <AppBar
          color="default"
          style={{
            height: "64px",
            justifyContent: "center",
            borderBottom: "1px solid rgba(247, 246, 241, 0.20)",
          }}
        >
          <Toolbar className={classes.toolbar}>
            <TopBarData />
          </Toolbar>
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
                            }}
                            smooth={true}
                            duration={500}
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={
                                webPath === "/map" ? { color: "#D19A1D" } : {}
                              }
                            >
                              Home
                            </span>
                          </ScrollLink>
                        </Button>
                      )}
                      {webPath !== "/" && (
                        <Button
                          className={classes.linkButton}
                          style={{ fontSize: "14px !important" }}
                        >
                          <ScrollLink
                            className=""
                            onClick={() => {
                              navigate("/map");
                              handleDrawerClose();
                              setIsOpen(false);
                            }}
                            smooth={true}
                            duration={500}
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={
                                webPath === "/map" ? { color: "#D19A1D" } : {}
                              }
                            >
                              Go to Map
                            </span>
                          </ScrollLink>
                        </Button>
                      )}
                    </Box>
                    {auth.userLoggedIn && localStorage.getItem("token") ? (
                      <>
                        {" "}
                        <Button
                          className={classes.linkButton}
                          style={{ fontSize: "14px !important" }}
                        >
                          <ScrollLink
                            className=""
                            onClick={() => {
                              handleDrawerClose()
                              setOpen(true)
                            }
                            }
                            smooth={true}
                            handle
                            duration={500}
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={
                                webPath === "/map" ? { color: "#D19A1D" } : {}
                              }
                            >
                              Logout
                            </span>
                          </ScrollLink>
                        </Button>
                      </>
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
          {open && (
            <ConfirmationDialog
              open={open}
              handleClose={() => setOpen(false)}
              title={"Logout"}
              desc={"Do you want to logout ?"}
              confirmationHandler={confirmationHandler}
              isloading={isloading}
            />
          )}
        </AppBar>
      </div>
    </>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
};
TopBar.defaultProps = {
  onMobileNavOpen: () => {},
};

export default TopBar;

export function TopBarData() {
  const classes = useStyles();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const themeSeeting = useContext(SettingsContext);
  const user = useContext(UserContext);
  const [unReadNotification, setUnReadNotification] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selected, setSelected] = useState(
    location.pathname == "/login"
      ? "Sign In"
      : location.pathname == "/register" ||
        location.pathname == "/company-information"
      ? "Sign Up"
      : "Select options"
  );
  const handleOptionClick = (option) => {
    setIsOpen(false);
    setSelected(option);
  };
  const [isloading, setIsloading] = useState(false);
  const [notiData, setNotiData] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const confirmationHandler = () => {
    setOpen(false);
    navigate("/login");
    auth.userLogIn("", false);
    handleLogOut();
    window.localStorage.removeItem("token");
    window.localStorage.clear();
  };

  const handleLogOut = async (values) => {
    try {
      const res = await Axios.post(
        ApiConfig.logout,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        user.cleanProfile();
      }
    } catch (error) {
      console.log("ERROR", error?.response?.data?.error);
      // Handle error here
    }
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };
  const notificationHandler = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await Axios({
        method: "GET",
        url: ApiConfig.listNotification,
        params: { limit: 5 },
        headers: {
          token: token,
        },
      });

      if (res.data.statusCode == 200) {
        setNotiData(res?.data?.dataResults?.docs);
      }
    } catch (error) {
      console.log("error");
    }
  };
  const [count, setCount] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location?.pathname]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <img
          className={classes.logo}
          src="/images/logoNew.png"
          onClick={() => {
            navigate("/");
          }}
        />
        <div
          style={{
            height: "64px",
            borderLeft: "1px solid rgba(247, 246, 241, 0.20)",
          }}
        ></div>
        <img
          src="images/House.svg"
          alt="#"
          onClick={() => {
            navigate("/");
          }}
          style={{ cursor: "pointer" }}
        />
        <Button
          className={classes.linkButton}
          onClick={() => {
            navigate("/map", {
              state: {
                mapView: "map",
              },
            });
          }}
        >
          <span> Go to Map</span>
        </Button>
      </div>
      <>
        <Box flexGrow={1} />
        {auth.userLoggedIn && localStorage.getItem("token") ? (
          <Box className={classes.searchBox}>
            <Box
              className={`${classes.customSelectBox}`}
              onClick={() => setOpen(true)}
            >
              <p className="contentTypo">Logout</p>
              <FaAngleRight
                style={{ fontSize: "20px", color: "rgb(0, 0, 0, 0.8)" }}
              />
            </Box>
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
              {selected === "Select options" ? "Sign In/up" : selected}
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
      </>

      {open && (
        <ConfirmationDialog
          open={open}
          handleClose={() => setOpen(false)}
          title={"Logout"}
          desc={"Do you want to logout ?"}
          confirmationHandler={confirmationHandler}
          isloading={isloading}
        />
      )}
    </>
  );
}
