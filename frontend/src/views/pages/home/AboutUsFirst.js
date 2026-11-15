import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import GoogleMapReact from "google-map-react";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import "./aboutus.css";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IoCloseCircleOutline } from "react-icons/io5";
const useStyles = makeStyles((theme) => ({
  modalTopbar: {
    backgroundColor: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    color: "#fff",
  },
  modalMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "60%",
    position: "relative",
    outline: "none",
  },
  largeText: {
    color: "#172624 !important",
    // textAlign: "center",
    fontFamily: "Big Shoulders Display, sans-serif !important",
    fontSize: "40px !important",
    marginTop: "3%",
    fontStyle: "normal",
    fontWeight: "800 !important",
    lineHeight: "45px !important",
    textTransform: "uppercase",
    "@media (max-width: 1200px)": {
      fontSize: "30px !important",
      lineHeight: "35px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "25px !important",
      lineHeight: "30px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "19px !important",
    },
  },

  body1: {
    fontFamily: "Noto Sans",
    fontStyle: "normal",
    fontWeight: "400 !important",
    fontSize: "17px !important",
    lineHeight: "200%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#000 !important",
    textAlign: "start",

    "@media (max-width: 1200px)": {
      fontSize: "15px !important",
      lineHeight: "18px !important",
    },
    "@media (max-width: 920px)": {
      fontSize: "13px !important",
      lineHeight: "15px !important",
    },
    "@media (max-width: 599px)": {
      fontSize: "12px !important",
      lineHeight: "14px !important",
    },
  },
  typoSeparate: {
    marginTop: "24px",
    display: "grid",
    gap: "16px",
    marginBottom: "40px",
  },
  transButton: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal !important",
    fontWeight: "700 !important",
    minHeight: "56px !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    maxWidth: "350px !important",
    background: "#D19A1D !important",
    width: "100% !important",
    "&:hover": {
      color: "#D19A1D !important",
      border: "1px solid #D19A1D",
      background: "#fff !important",
    },
    "@media (max-width: 920px)": {
      maxWidth: "290px !important",
    },
    "@media (max-width: 599px)": {
      maxWidth: "320px !important",
      // padding: "8px !important",
      // minHeight: "30px !important",
    },
  },
  displayButtonText: {
    "@media (max-width: 599px)": {
      // display: "none !important",
    },
  },
  newButtonDiv: {
    display: "flex",
    justifyContent: "start",
    marginTop: "4%",
    "@media (max-width: 599px)": {
      justifyContent: "center",
    },
  },
  manageCategory: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    overflow: "auto",
    position: "relative",
    "& .button": {
      borderRadius: "30px",
      border: "1px solid #c4c4c4",
      padding: "5px 20px",
      color: "#172624",
      minWidth: "200px",
      "@media (max-width: 920px)": {
        minWidth: "140px",
      },
    },
  },
  TextBoxFormControlOpen: {
    minWidth: "140px",
    "@media (max-width: 1125px)": {
      minWidth: "140px",
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
  mainSection: {
    display: "flex",
    gap: "28px",
    marginTop: "5%",
    marginBottom: "5%",
    "@media (max-width: 599px)": {
      flexDirection: "column",
    },
  },
  starDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "4%",
    marginBottom: "4%",
  },
  box1: {
    flex: 1,
  },
  box2: {
    flex: 1,
  },
  boldText: {
    fontWeight: 900,
  },
  TextBoxFormControl: {
    minWidth: "140px",
    position: "absolute",
    top: "0",
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
}));
const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function AboutUsFirst() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <Container className={classes.mainSection}>
      <Box className={classes.box1}>
        <Typography className={classes.largeText}>
          Everything You Need for Your Home Improvement - with just a few
          clicks!
        </Typography>

        <Box className={classes.starDiv}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              What is Geodaka:
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="fs-16 fw-400">
                <span className={classes.boldText}>Geodaka</span> is a New AI
                Geospatial Digital Services and Property Company.
                <br /> <span className={classes.boldText}>Geodaka:</span> Geo -
                Earth / aka - 'Also Know As'. <br />
                <br />
                <span className={classes.boldText}>
                  Geodaka: Revolutionizing Digital Property, Real Estate and the
                  Home Services Marketplace with Digital Yard Sign technology.{" "}
                </span>
                Imagine a world where property lives on a web 3 secure
                de-centralized property layer. Geodaka mapplications create
                ‘infinite’ new real estate, e-commerce and the Home Services
                Provider networks that makes every aspect of property
                utilization and management as easy as opening a map on your
                phone. Geodaka is making that a reality. We're a global team of
                professionals and developers building revolutionary geospatial
                mapplications that uses digital property layers projected on a
                worldwide map and developing{" "}
                <span className={classes.boldText}>‘Digital Yard Sign’</span>{" "}
                mapplications that empower the ability both for homeowners and
                service providers to connect instantly on the Mapp. This
                Geospatial innovative approach offers vast new benefits for
                everyone: A secure digital property map layer of towns, cities
                and eventually the entire world, essentially a comprehensive and
                interactive global property map, holds immense potential to
                create secure, de-centralized digital property to benefit all
                individuals, companies and industries.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              For Homeowners and Buyers:{" "}
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="fs-16 fw-400">
                <span className={classes.boldText}>
                  Transparency and Accessibility:
                </span>{" "}
                Easily access property information like ownership records,
                boundaries, valuations, tax assessments, and even historical
                data. This empowers buyers to make informed decisions and
                promotes fair market practices.
                <br />
                <span className={classes.boldText}>
                  Simplified Property Management:
                </span>{" "}
                Visualize property lines, easements, and zoning regulations.
                Track maintenance schedules, renovations, and property-related
                documents all in one place.
                <br />
                <span className={classes.boldText}>
                  Community Engagement:
                </span>{" "}
                Connect with neighbors, understand local development plans, and
                participate in discussions regarding zoning changes or community
                improvements.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              For Service Providers and Businesses:
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="fs-16 fw-400">
                <span className={classes.boldText}> Targeted Marketing:</span>{" "}
                Identify potential customers based on property characteristics,
                demographics, and service needs. This allows for efficient and
                effective marketing campaigns.
                <br />{" "}
                <span className={classes.boldText}>
                  Improved Service Delivery:
                </span>{" "}
                Optimize routes, schedule jobs, and manage resources effectively
                with accurate location data and property information.
                <br />
                <span className={classes.boldText}>
                  {" "}
                  Risk Assessment and Planning:
                </span>{" "}
                Insurance companies, utilities, and emergency services can use
                the map for risk assessment, disaster preparedness, and
                infrastructure planning.
                <br />
                By providing a de-centralized and accessible platform for
                property information, a digital property map layer can empower
                individuals, businesses, and governments to make informed
                decisions, promote sustainable development, and improve the
                lives of people around the world.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4-content"
              id="panel4-header"
            >
              The Geospatial Hom Services Marketplace:
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <span className={classes.boldText}>
                  YardSignProShop.com: Your Digital Yard Sign Solution
                </span>
                <br />
                <br /> Tired of outdated methods for finding and advertising
                home services? YardSignProShop.com is here to change the game!
                <br /> <br /> We're a global team of professionals and
                developers revolutionizing the home services industry with our
                innovative geospatial map application. Our platform uses digital
                yard signs to connect homeowners with local service providers in
                a way that's never been done before.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel5-content"
              id="panel5-header"
            >
              Here's how YardSignProShop.com benefits you:
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="fs-16 fw-400">
                <span className={classes.boldText}>Homeowners:</span>
                <br />
                <br />{" "}
                <span className={classes.boldText}>
                  {" "}
                  Find the perfect pro:
                </span>{" "}
                Simply Go To Your Home on the Mapp, type in the search box any
                type of service provider – Click on a sign and instantly Easily
                locate nearby, available service providers and professionals
                with our intuitive map interface. <br />
                <span className={classes.boldText}>
                  Make informed choices:
                </span>{" "}
                Access ratings, reviews, and pricing information upfront.
                <br />{" "}
                <span className={classes.boldText}>Save valuable time:</span> No
                more wasted time searching multiple platforms or waiting for
                callbacks.
                <br />
                <span className={classes.boldText}>
                  Every Possible Service Provider and AEC Professional:{" "}
                </span>
                Instantly available for all aspects of any project.
                <br />{" "}
                <span className={classes.boldText}>Effortless Search:</span>
                Find nearby, available professionals instantly with our
                intuitive map interface.
                <br />{" "}
                <span className={classes.boldText}>
                  Increased Transparency:
                </span>{" "}
                Access ratings, reviews, and pricing information upfront to make
                informed choices.
                <br /> <span className={classes.boldText}>
                  Time Savings:
                </span>{" "}
                No more wasted time searching multiple platforms or waiting for
                callbacks. <br />
                <br />
                <span className={classes.boldText}>
                  Home Service Providers and AEC Professionals:
                </span>{" "}
                <br />
                <br />{" "}
                <span className={classes.boldText}>
                  Boost your visibility:{" "}
                </span>
                Reach a wider audience of potential customers actively seeking
                services in your area. <br />
                <span className={classes.boldText}>
                  Let everyone know your in the Neighborhood:{" "}
                </span>
                Post a Smart Digital Yard Sign at every job in seconds. 1000’s
                can be posted covering entire service area.
                <br />{" "}
                <span className={classes.boldText}>
                  Target your marketing:
                </span>{" "}
                Focus your efforts on the right customers, in the best
                locations. <br />{" "}
                <span className={classes.boldText}>Maximize your budget:</span>{" "}
                Gain a competitive edge with a more affordable and efficient
                marketing solution. Free 90 Day 100 sign trial. Post 1000’s for
                only a few dollars per month. <br />{" "}
                <span className={classes.boldText}>Enhanced Visibility:</span>
                Reach a wider audience of potential customers actively seeking
                services in their area. <br />
                <span className={classes.boldText}>Targeted Marketing: </span>
                Focus your efforts on the right customers at the right time.
                <br />
                <span className={classes.boldText}> Cost-Effectiveness:</span>
                Gain a competitive edge with a more affordable and efficient
                marketing solution.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel5-content"
              id="panel5-header"
            >
              Visit YardSignProShop.com today and discover a better way to
              connect.
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="fs-16 fw-400">
                The <span className={classes.boldText}>‘old school’</span>{" "}
                Paper/Wire Front Yard Signs may be a thing of the past:
                <br /> <br />
                <span className={classes.boldText}>
                  Expensive – Labor Intensive:
                </span>{" "}
                Paper/Wire signs have to designed, printed and installed –
                expensive and time consuming.
                <br />
                <span className={classes.boldText}>
                  Unsightly and Environmentally unfriendly:{" "}
                </span>
                Paper Signs in Home Owners front yards are unsightly and
                environmentally unfriendly.
                <br />
                <span className={classes.boldText}>
                  Current Customers Aggravated:
                </span>{" "}
                Home Owners do not want ugly signs in their front yard.
                <br />
                <span className={classes.boldText}>
                  {" "}
                  Paper Signs are hard to read and degrade quickly:
                </span>{" "}
                Paper Signs are hard to read, de-grade quickly and disappear in
                a few days.
                <br />
                <span className={classes.boldText}>
                  {" "}
                  ‘Dumb' and not ‘GeoAI’ Connected:
                </span>{" "}
                No one can search for a local service provider putting out paper
                yard signs. <br />
                Digital Yard Signs can be instantly searched and last forever on
                the Mapp.
                <br />
                <br /> The bottom line is Paper/Wire on Site physical Yard Sign
                Advertising Campaigns basically- don’t work.
                <br />
                There is now a much better way – for every company – Large and
                Small to participate.
                <br /> Using the YardSignProShop.com Mapp anyone can post
                hundreds of smart, interactive – great advertising and Marketing
                tool – right in their customers front year.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* <Box className={classes.starDiv}>
              <Typography className={classes.body1}>
                  <img
                    src="images/Star.svg"
                  />{"  "}
                  Free Mapp Search for Home Owners - no sign up
                </Typography>{" "}
                <Typography className={classes.body1}>
                  <img
                    src="images/Star.svg"
                    alt=""
                    style={{ verticalAlign: "top", marginRight: "5px" }} // Aligns with the first line
                  />{" "}
                  Map Search - Interior, Exterior and AEC Consultant Service Providers
                </Typography>
                <Typography className={classes.body1}>
                  <img
                    src="images/Star.svg"
                    alt=""
                  />{" "}
                 100's of Service providers of all types who have worked in your neighborhood {" "}
                </Typography>
                <Typography className={classes.body1}>
                  <img
                    src="images/Star.svg"
                    alt=""
                  />{" "}
                  Click on Digital Yard Signs for instant link to web site 
                </Typography>{" "}
                <Typography className={classes.body1}>
                  <img
                    src="images/Star.svg"
                    alt=""
                  />{" "}
                  Get Instant Free Quotes from Hundreds of Service Providers 
                </Typography>
              </Box> */}
        <div className={classes.newButtonDiv}>
          <Button className={classes.transButton} onClick={() => {}}>
            <span className={classes.displayButtonText}>
              What are Digital Yard Signs?
            </span>
          </Button>
        </div>
      </Box>
      <Box className={classes.box2}>
        <div>
          <img src="images/bgImage.png" alt="" style={{ width: "100%" }} />
          <div className={classes.newButtonDiv}></div>
        </div>
      </Box>
    </Container>
  );
}
