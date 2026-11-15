import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
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
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { IoMdArrowDropdown } from "react-icons/io";




const useStyles = makeStyles(() => ({
    headbox: {
        borderRadius: "20px",
        padding: "60px 30px 10px",
        textAlign: 'center',
        marginBottom: 16, // Adding margin bottom to create space below the heading
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
    container: {
        position: "relative",
        display: "flex",
        marginTop: "16px",
        height: '100vh',
        
    },
    content: {
        flex: 1,
        marginLeft: "16px", // Adding space between ProMapServices and content
    },
    proMapServices: {
    },
}));

export default function ProUploadServices() {
    const classes = useStyles();
    const childRef = useRef();
    const [map, setMap] = useState("")
    const handleSelectChange = (cateId, sectorName) => {
        setSelectItem(sectorName);
       
    };
    const [categoryList, setCategoryList] = useState([]);
    const [selectItem, setSelectItem] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [sectorList, setSectorList] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const filteredSectors = sectorList.filter((data) =>
        data.sector_name.toLowerCase().includes(searchInput.toLowerCase())
    );
    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
        setMenuOpen(true);
    };



    useEffect(() => {
        const newMap = new Map({
            target: "landing-map",
            layers: [
                new TileLayer({
                    source: new OSM({
                        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                        attributions:
                            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                        CQL_FILTER: "",
                    }),
                }),
            ],
            view: new View({
                center: fromLonLat(["70", "20"]),
                zoom: 1.1,
            }),
        });
        const flyTo = (location, done) => {
            const view = map?.getView();
            if (view) {
                const duration = 2000;
                const zoom = view.getZoom();

                view.animate(
                    {
                        center: location,
                        duration: duration,
                    },
                    () => {
                        view.animate(
                            {
                                zoom: zoom - 1,
                                duration: duration / 2,
                            },
                            {
                                zoom: zoom,
                                duration: duration / 2,
                            },
                        );
                    }
                );
            }
        };
        //   flyTo()
        setMap(newMap);

        return () => {
            newMap.setTarget(null); // Cleanup on unmount
        };

    }, []);

    const getSectorData = async (values) => {
        const raw = JSON.stringify({
            category_id: values,
        });
        try {
            const res = await Axios.post(ApiConfig.sectorlist, raw, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200 || res.status === 201) {
                setSectorList(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        getCategoryData();
      }, []);
      const getCategoryData = async (values) => {
        const token = localStorage.getItem("token");
        try {
          const res = await Axios({
            method: "GET",
            url: ApiConfig.categorylist,
          });
          if (res.status === 200 || res.status === 201) {
            setCategoryList(res.data);
            setSelectedCategory(res?.data[0]?.category_name);
            getSectorData(res?.data[0]?.id);
          }
        } catch (error) {}
      };
    
    return (
        <>
            <Container>
                <Box className={classes.headbox}>
                    <Typography variant="h4">
                        Quickly Build Your Company Yard Sign <br /> or <br /> We can do it for you!
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid xs={12} sm={12} md={6}>
                    <div className={classes.proMapServices}>
                        <div id="landing-map" style={{ width: "100%", height: "300px", top: "0", right: "0" }} />
                    </div></Grid>
                    <Grid xs={12} sm={12} md={6}>
                    <div className={classes.content}>
                        {/* Industry field */}
                        <Typography variant="h6" gutterBottom>
                            Select Industry
                        </Typography>
                        <div
                            className={
                                menuOpen && selectedCategory !== ""
                                    ? classes.dropdownPaperOpen
                                    : classes.setDivWidth
                            }
                        >
                            <FormControl
                                className={classes.TextBoxFormControl}
                                fullWidth
                                variant="outlined"
                            >
                                <Select
                                    margin="dense"
                                    variant="outlined"
                                    displayEmpty
                                    // disabled={isloading}
                                    value={selectedCategory}
                                    InputProps={{
                                        className: classes.TextBox,
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 210,
                                            },
                                        },
                                    }}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSelectItem("");
                                    }}
                                >
                                    <MenuItem
                                        value=""
                                        onClick={() => {
                                            setSearchInput("");
                                            handleSelectChange("", "");
                                        }}
                                        style={{
                                            fontSize: "12px",
                                            opacity: "0.5 !important",
                                        }}
                                    >
                                        All
                                    </MenuItem>
                                    {categoryList?.map((data) => {
                                        return (
                                            <MenuItem
                                                value={data?.category_name}
                                                style={{ fontSize: "12px" }}
                                                onClick={() => {
                                                    getSectorData(data.id);
                                                    setSearchInput("");
                                                    handleSelectChange(data?.id, "");
                                                }}
                                            >
                                                {data?.category_name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </div>

                        {/* Textfiled */}
                        <Typography variant="h6" gutterBottom>
                        Select Sector
                        </Typography>
                        <div
                            className={
                                menuOpen && selectedCategory !== ""
                                    ? classes.dropdownPaperOpen
                                    : classes.setDivWidth
                            }
                        >
                            <FormControl
                                className={classes.textBoxFormControl}
                                fullWidth
                                onMouseLeave={() => setMenuOpen(false)}
                            >
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    placeholder="Search"
                                    value={searchInput}
                                    disabled={selectedCategory == ""}
                                    onChange={handleSearchInputChange}
                                    onClick={() => {
                                        setMenuOpen(true);
                                        setSearchInput("");
                                    }}
                                    onFocus={() => {
                                        setMenuOpen(true);
                                        setSearchInput("");
                                    }}
                                    InputProps={{
                                        className: classes.textBox,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" size="large">
                                                    <IoMdArrowDropdown
                                                        style={{
                                                            color: "rgb(117 117 117)",
                                                        }}
                                                    />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    InputLabelProps={{
                                        classes: { root: classes.textField },
                                    }}
                                    inputProps={{
                                        className:
                                            searchInput.length > 24
                                                ? classes.extendedInput
                                                : classes.input,
                                    }}
                                    label="Search"

                                />
                                {menuOpen && selectedCategory !== "" && (
                                    <Paper className={classes.dropdownPaper}>
                                        <div className={classes.handleWidth}>
                                            {filteredSectors.map((data) => (
                                                <MenuItem
                                                    key={data.sector_name}
                                                    value={data.sector_name}
                                                    style={{ fontSize: "14px" }}
                                                    onClick={() => {
                                                        setSearchInput(
                                                            data.sector_name
                                                        );
                                                        setMenuOpen(false);
                                                        handleSelectChange(
                                                            data.category_id,
                                                            data.sector_name
                                                        );
                                                    }}
                                                >
                                                    {data.sector_name}
                                                </MenuItem>
                                            ))}
                                        </div>
                                    </Paper>
                                )}
                            </FormControl>
                        </div>
                    </div></Grid>
                </Grid>
            </Container>
        </>
    );
}
