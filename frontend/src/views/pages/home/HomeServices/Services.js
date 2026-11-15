import React, { useEffect, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import "../aboutus.css";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import ListSection from "./ListSection";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const useStyles = makeStyles((theme) => ({
  boldText: {
    fontWeight: 900,
  },
  mainHeading: {
    fontFamily: "Big Shoulders Display",
    fontSize: "48px",
    fontWeight: 700,
    lineHeight: "72px",
    textAlign: "center",
    "@media (max-width: 599px)": {
      fontSize: "28px !important",
      lineHeight: "33.5px !important",
    },
  },
  serviceName: {
    color: "#005F99",
    fontFamily: "Noto Sans",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "36.8px",
    textAlign: "left",
  },
  accordianDiv: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "4%",
    marginBottom: "4%",
  },

  layoutDiv: {
    display: "flex",
    flexDirection: "row",
    gap: "15%",
    justifyContent: "space-between",
    marginTop: "5%",
    height: "auto",
    flexWrap: "nowrap",
  },
  column: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
}));

function Services() {
  const classes = useStyles();
  const [sectorList, setSectorList] = useState([]);
  const [interiorServices, setInteriorServices] = useState([]);
  const [exteriorServices, setExteriorServices] = useState([]);
  const [AECServices, setAECServices] = useState([]);
  const [expanded, setExpanded] = useState(null); 
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
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
        console.log(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

 

  const categorizeServices = () => {
    if (sectorList) {
      const interior = [];
      const exterior = [];
      const aec = [];

      sectorList.forEach((service) => {
        switch (service.category_id) {
          case 1:
            exterior.push(service);
            break;
          case 2:
            interior.push(service);
            break;
          case 3:
            aec.push(service);
            break;
          default:
            break;
        }
      });

      setExteriorServices(exterior);
      setInteriorServices(interior);
      setAECServices(aec);
    }
  };

  useEffect(() => {
    getSectorData();
  }, []);

  useEffect(() => {
    categorizeServices();
  }, [sectorList]);

  const headings = [
    "Interior Service Providers:",
    "Architectural, Engineering, Environmental, and Land Surveying Professional Consultants:",
    "Exterior Services Providers:",
  ];
  const isSmallScreen = useMediaQuery("(max-width:900px)");

  return (
    <>
      <section id="home-bar">
        {isSmallScreen ? (
          <Typography className={classes.mainHeading}>
            Find the Interior, Exterior, and AEC Home Service Pro's for your
            project in these TOP Categories:
          </Typography>
        ) : (
          <Typography className={classes.mainHeading}>
            Find the Interior, Exterior, and AEC Home Service Pro's <br />
            for your project in these TOP Categories:
          </Typography>
        )}
        {isSmallScreen ? (
          <Box className={classes.accordianDiv}>
            <Accordion expanded={expanded === "panel1"}
               onChange={handleChange("panel1")}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Interior Service Providers:
              </AccordionSummary>
              <AccordionDetails>
                {interiorServices.length > 0 ? (
                  interiorServices.map((sector, index) => (
                    <Typography key={index} className={classes.serviceName}>
                      {sector.sector_name}
                    </Typography>
                  ))
                ) : (
                  <Typography>No interior services available.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel2"}
               onChange={handleChange("panel2")}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Exterior Services Providers:
              </AccordionSummary>
              <AccordionDetails>
                {exteriorServices.length > 0 ? (
                  exteriorServices.map((sector, index) => (
                    <Typography key={index} className={classes.serviceName}>
                      {sector.sector_name}
                    </Typography>
                  ))
                ) : (
                  <Typography>No exterior services available.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === "panel3"}
               onChange={handleChange("panel3")}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
              >
                Architectural, Engineering, Environmental, Land Surveying and
                Professional Consultants Services:
              </AccordionSummary>
              <AccordionDetails>
                {AECServices.length > 0 ? (
                  AECServices.map((sector, index) => (
                    <Typography key={index} className={classes.serviceName}>
                      {sector.sector_name}
                    </Typography>
                  ))
                ) : (
                  <Typography>No AEC services available.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        ) : (
          <div className={classes.layoutDiv}>
            <div className={classes.column}>
              {interiorServices.length > 0 && (
                <ListSection
                  className={classes.item}
                  heading={headings[0]}
                  data={interiorServices}
                />
              )}
              {exteriorServices.length > 0 && (
                <ListSection
                  className={classes.item}
                  heading={headings[2]}
                  data={exteriorServices.slice(0, 12)}
                />
              )}
            </div>
            <div className={classes.column}>
              {exteriorServices.length > 0 && (
                <ListSection
                  className={classes.item}
                  heading={headings[2]}
                  data={exteriorServices.slice(12)}
                />
              )}
            </div>
            <div className={classes.column}>
              {AECServices.length > 0 && (
                <ListSection
                  className={classes.item}
                  heading={headings[1]}
                  data={AECServices}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Services;
