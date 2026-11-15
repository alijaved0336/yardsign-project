import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  Dialog,
  Drawer,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Axios from "axios";
import * as XLSX from "xlsx";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiConfig from "src/config/APICongig";
import { toast } from "react-toastify";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import MyServicesMap from "src/views/pages/dashBoard/map/MyServicesMap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Form, Formik } from "formik";
import * as yep from "yup";
import { HiLocationMarker } from "react-icons/hi";
import { UserContext } from "src/context/User";
import { fromLonLat } from "ol/proj";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa6";
import ConfirmationDialog from "src/component/ConfirmationDialog";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function ListServices({
  classes,
  handleCallBack,
  imgIcon,
  uploadData,
  setSubmit,
  submit,
}) {
  const [Icon, setIcon] = useState("images/icons/defaultIconLogo.svg");
  const [selectedItems, setSelectedItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (event) => {
    const value = event.target.value;
    setQuery(value);

    if (value.length > 0) {
      const results = listData.filter((item) =>
        item.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredResults(results);
      setShowDropdown(true);
    } else {
      setFilteredResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    handleLatAndLog(item.latitude, item.longitude);
    // console.log("item", item)
    // setQuery(item);
    setShowDropdown(false);
    setQuery("");
  };
  const handleClear = () => {
    setQuery("");
    setShowDropdown(false);
  };
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const [open, setOpen] = useState(false);
  const [openPopUp, setOpenPopup] = useState(false);
  const [elementIndex, setElementIndex] = useState("");
  const [listData, setListData] = useState([]);
  const [csvLoader, setCsvLoader] = useState(false);
  const [newDataToUpload, setNewDataToUpload] = useState([]);
  const user = useContext(UserContext);
  useEffect(() => {
    if (user?.profile?.plan?.feature_count === 0) {
      setOpenPopup(true);
    } else {
      setOpenPopup(false);
    }
  }, [user?.profile?.plan?.feature_count]);
  useEffect(() => {
    setIcon(`${ApiConfig.imagGet}${user?.profile?.profile?.logo}`);
  }, [user?.profile?.profile]);

  useEffect(() => {
    // setListData(JSON.parse(localStorage.getItem("LocationData")) || []);
    setListData(uploadData);
  }, [uploadData]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPostYardSign, setOpenPostYardSign] = useState(false);
  const [openPostYardSignEdit, setOpenPostYardSignEdit] = useState(false);
  const [editData, setEditData] = useState([]);
  const [CsvFileData, setCsvFileData] = useState([]);
  const [CsvFileDataWithLatLog, setCsvFileDataWithLatLog] = useState([]);
  const [checked, setChecked] = useState(false);
  const [selectPosition, setSelectPosition] = useState("");
  const [geoCodeCompanyAdress, setGeoCodeCompanyAdress] = useState("");
  const [geoCodeCompanyAdressEdit, setGeoCodeCompanyAdressEdit] = useState("");
  const [uploadedFileName, setuploadedFileName] = useState("");
  const [isloading, setLoader] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [listItemsSearch, setListItemsSearch] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("Massachusetts");
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [screenLat, setsetScreenLat] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectError, setselectError] = useState(false);
  const [addressError, setaddressError] = useState(false);
  const [errorEditCompany, seterrorEditCompany] = useState(false);
  const [yardSignPostLimit, setYardSignPostLimit] = useState(
    user?.profile?.plan?.feature_count || 0
  );
  const [profilePic, setProfilePic] = useState("");
  useEffect(() => {
    setProfilePic(
      user?.profile?.user_info?.image
        ? `${ApiConfig.imagGet}${user?.profile?.user_info?.image}`
        : ""
    );
  }, [user?.profile?.user_info?.image]);
  const handlesetLat = (values) => {
    setsetScreenLat(values);
  };
  const handlesetLatMap = (values) => {
    setsetScreenLat(values);
    const getAddressFromCoordinates = (latitude, longitude) => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Extract address from response
          const address = data.display_name;
          setGeoCodeCompanyAdress(address);
          setaddressError(false);
          // Do something with the address, such as updating state
          // setAddress(address);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

    // Call getAddressFromCoordinates with the provided values
    handleLatAndLog(values[0].latitude, values[0].longitude);
    getAddressFromCoordinates(values[0].latitude, values[0].longitude);
  };
  const handlesetLatMapEdit = (values) => {
    setsetScreenLat(values);
    const getAddressFromCoordinates = (latitude, longitude) => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Extract address from response
          const address = data.display_name;
          setGeoCodeCompanyAdressEdit(address);
          seterrorEditCompany(false);
          // Do something with the address, such as updating state
          // setAddress(address);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    };

    // Call getAddressFromCoordinates with the provided values
    handleLatAndLog(values[0].latitude, values[0].longitude);
    getAddressFromCoordinates(values[0].latitude, values[0].longitude);
  };
  const handleListLocation = async (values) => {
    try {
      const response = await fetch(
        `${
          ApiConfig.mapboxUrl
        }${values}.json?country=us&access_token=${"pk.eyJ1IjoiZ2VvZGFrYSIsImEiOiJjbHRoNnE2YWgwMXAxMmxwaG1wcnppZWphIn0.3YoeVGWEQ4Ux2ApJ_O23sQ"}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setListItemsSearch(result.features);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSelectItem = (id, index) => {
    console.log(id, index);
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((item) => item !== id)
        : [...prevSelectedItems, id]
    );
  };

  const handleDeleteSelected = () => {
    setElementIndex(selectedItems);
    setSelectedItems([]);
    setOpen(true);
  };
  const handleLatAndLog = (lat, long) => {
    if (!isNaN(lat) && !isNaN(long)) {
      setLongitude(long);
      setLatitude(lat);
      setselectError(false);
    } else {
      // toast.error(
      //   "Oops! Something went wrong. Please try again or select a different location."
      // );
      setselectError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const statesResponse = await Axios.get("/static/json/states.json");
      const statesData = statesResponse.data.states;

      if (selectedCountry) {
        const countryFromCode = countries.find(
          (data) => data.name == selectedCountry
        );

        if (true) {
          let CountryValue = "231";
          const statesOfSelectedCountry = statesData.filter(
            (state) => state.country_id === CountryValue
          );
          // setSelectedState("");
          setStates(statesOfSelectedCountry);
        }
      }
    };

    fetchData();
  }, [selectedCountry]);
  useEffect(() => {
    const fetchData = async () => {
      const statesResponse = await Axios.get("/static/json/cities.json");
      const cityData = statesResponse.data.cities;

      if (selectedState) {
        const stateFromCode = states.find((data) => data.name == selectedState);

        if (true) {
          let CountryValue =
            stateFromCode !== undefined ? stateFromCode.id : "3943";

          const cityOfSelectedState = cityData.filter(
            (city) => city.state_id === CountryValue
          );

          setSelectedCity("");
          setCities(
            cityOfSelectedState?.length !== 0
              ? cityOfSelectedState
              : [{ id: "00", name: selectedState, state_id: stateFromCode.id }]
          );
        }
      }
    };

    fetchData();
  }, [selectedState]);
  const childRef = useRef();
  const navigate = useNavigate();

  const handleFormData = (values) => {
    if (geoCodeCompanyAdress === "") {
      setaddressError(true);
    } else {
      setaddressError(false);
      if (selectError) {
        toast.error(
          "Oops! Something went wrong. Please select a different Point."
        );
      } else {
        // setListData([
        //   ...listData,
        //   {
        //     address: values.companyAddress,
        //     city: user?.profile?.user_info?.city,
        //     latitude: latitude,
        //     longitude: longitude,
        //     sector: user?.profile?.profile?.sector_id,
        //     state: user?.profile?.user_info?.state,
        //     zipcode: user?.profile?.user_info?.zipcode,
        //   },
        // ]);
        // setNewDataToUpload([
        //   ...newDataToUpload,
        //   {
        //     address: values.companyAddress,
        //     city: user?.profile?.user_info?.city,
        //     latitude: screenLat[0].latitude,
        //     longitude: screenLat[0].longitude,
        //     sector: user?.profile?.profile?.sector_id,
        //     state: user?.profile?.user_info?.state,
        //     zipcode: user?.profile?.user_info?.zipcode,
        //   },
        // // ]);
        // setTimeout(() => {
        handleFormSubmit([
          {
            address: geoCodeCompanyAdress,
            // city: user?.profile?.user_info?.city,
            latitude: screenLat[0].latitude,
            longitude: screenLat[0].longitude,
            sector: user?.profile?.profile?.sector_id,
            // state: user?.profile?.user_info?.state,
            // zipcode: user?.profile?.user_info?.zipcode,
          },
        ]);
        // }, 100);
      }
    }
  };
  const handleEditFormData = (values) => {
    if (editData[0].id) {
      if (geoCodeCompanyAdressEdit === "") {
        seterrorEditCompany(true);
      } else {
        seterrorEditCompany(false);
        if (selectError) {
          toast.error(
            "Oops! Something went wrong. Please select a different Point."
          );
        } else {
          handleEditApi([
            {
              id: editData[0].id,
              sector: editData[0].sector,
              latitude: screenLat[0].latitude,
              longitude: screenLat[0].longitude,
              address: geoCodeCompanyAdressEdit,
              company_name: editData[0].company_name,
              category_name: editData[0].category_name,
              user: editData[0].user,
            },
          ]);
        }
      }
    } else {
      // setListData(newData);
      const newUploadData = newDataToUpload.map((data) => {
        if (data.address.trim() == editData[0]?.address.trim()) {
          return {
            ...data,
            address: values.companyAddress,
            latitude: screenLat[0].latitude,
            longitude: screenLat[0].longitude,
          };
        } else {
          return data;
        }
      });
      setNewDataToUpload(newUploadData);
      listData[editData[1]?.index].address = values.companyAddress;
      listData[editData[1]?.index].latitude = screenLat[0].latitude;
      listData[editData[1]?.index].longitude = screenLat[0].longitude;
      setOpenPostYardSignEdit(false);
    }
  };
  const handleFormSubmit = async (values) => {
    if (geoCodeCompanyAdress === "") {
      setaddressError(true);
    } else {
      setaddressError(false);
      setLoader(true);
      try {
        const formData = new FormData();
        formData.append("sector", user?.profile?.profile?.sector_name);
        formData.append("user_email", localStorage.getItem("email"));
        console.log(typeof values[0].latitude);
        const res = await Axios.post(ApiConfig.uploadmultiplefile, values, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          setLoader(false);
          handleCallBack();
          setChecked(false);
          setNewDataToUpload([]);
          setOpenPostYardSign(false);
          setGeoCodeCompanyAdress("")
        }
      } catch (error) {
        console.error(
          "ERROR",
          error.response ? error.response?.data?.error : error.message
        );
        setLoader(false);
        if (error.response && error.response?.data?.error) {
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later.");
        }
      }
    }
  };
  const handleFormSubmitCSV = async (values) => {
    setaddressError(false);
    setLoader(true);
    try {
      const formData = new FormData();
      formData.append("sector", user?.profile?.profile?.sector_name);
      formData.append("user_email", localStorage.getItem("email"));
      const res = await Axios.post(ApiConfig.uploadmultiplefile, values, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("You have successfully uploaded Post Yard Sign");
        setLoader(false);
        handleCallBack();
        setChecked(false);
        setNewDataToUpload([]);
        setOpenPostYardSign(false);
      }
    } catch (error) {
      console.error(
        "ERROR",
        error.response ? error.response?.data?.error : error.message
      );
      setLoader(false);
      if (error.response && error.response?.data?.error) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Something went wrong please try again later.");
      }
    }
  };
  const handleDeleteApi = async (values) => {
    if (typeof values === "number") {
      values = [values];
    }
    setLoader(true);
    setNewDataToUpload([]);
    const raw = JSON.stringify(values);
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        `Token ${localStorage.getItem("token")}`
      );
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        ApiConfig.uploadmultiplefile,
        requestOptions
      );

      if (response.ok) {
        setLoader(false);
        setOpen(false);
        handleCallBack();
        toast.success("Location deleted successfully!");
        setOpenPostYardSignEdit(false);
      } else {
        setLoader(false);
        throw new Error("Failed to delete location");
      }
    } catch (error) {
      console.error("ERROR", error.message);
      setLoader(false);
      toast.error(
        error.message || "Something went wrong please try again later."
      );
    }
  };
  const handleEditApi = async (values) => {
    setLoader(true);
    // Assuming you have the values for the PUT request in the 'values' object
    const raw = JSON.stringify(values);
    setNewDataToUpload([]);
    try {
      const myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        `Token ${localStorage.getItem("token")}`
      );
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        ApiConfig.uploadmultiplefile,
        requestOptions
      );

      if (response.ok) {
        setLoader(false);
        setOpenPostYardSignEdit(false);
        handleCallBack();
        setEditData([]);
        setGeoCodeCompanyAdressEdit("");
        setsetScreenLat([]);
        toast.success("Location edited successfully!");
      } else {
        setLoader(false);
        throw new Error("Failed to edit location");
      }
    } catch (error) {
      console.error("ERROR", error.message);
      setLoader(false);
      toast.error(
        error.message || "Something went wrong please try again later."
      );
    }
  };
  const formInitialSchema = {
    Zipcode: "",
    companyAddress: geoCodeCompanyAdress,
    // companyAddressContinued: "",
    // state: selectedState,
    // city: "",
  };

  const handleListLocationLatLog = async (address) => {
    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${address}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      // console.error("Error:", error);
      return [];
    }
  };

  const fetchLatLongForAddresses = async (formattedData) => {
    try {
      const updatedData = [];
      const latLog = [];

      let count = 0 + (listData?.length - 1 || 0); // Initialize a counter variable

      for (const data of formattedData) {
        setCsvLoader(true);
        if (count >= (user?.profile?.plan?.feature_count || 0)) {
          // If more than 12 data, break out of the loop
          break;
        }
        if (data?.Address) {
          const result = await handleListLocationLatLog(
            data.Address + " " + data.City + " " + data.State
          );

          const updatedDataItem = {
            ...data,
            lat: result?.features[0]?.geometry?.coordinates[1]
              ? result?.features[0]?.geometry?.coordinates[1]
              : "",
            lon: result?.features[0]?.geometry?.coordinates[0]
              ? result?.features[0]?.geometry?.coordinates[0]
              : "",
          };
          updatedData.push(updatedDataItem);
          latLog.push({
            lat: result?.features[0]?.geometry?.coordinates[1]
              ? result?.features[0]?.geometry?.coordinates[1]
              : "",
            lon: result?.features[0]?.geometry?.coordinates[0]
              ? result?.features[0]?.geometry?.coordinates[0]
              : "",
          });
          count++; // Increment the counter
        } else {
          toast.error("Address key not found in CSV file data.");
        }
      }
      setCsvFileDataWithLatLog(updatedData);
      setCsvLoader(false);
      let newData = updatedData.map((item) => ({
        sector: user?.profile?.profile?.sector_id || "--",
        latitude: item["lat"],
        longitude: item["lon"],
        zipcode: item["Zip Code"],
        state: item["State"],
        city: item["City"],
        address: item["Address"] + ", " + item["City"] + ", " + item["State"],
      }));
      const concatCount = Math.min(
        newData.length,
        (user?.profile?.plan?.feature_count || 0) - (listData.length - 1)
      );
      setNewDataToUpload(newData.slice(0, concatCount));
      handleFormSubmitCSV(newData.slice(0, concatCount));
      // let combinedArray = listData.concat(newData);
      // if (combinedArray.length > 12) {
      // setListData(combinedArray.slice(0, 12));
      // } else {
      // setListData(combinedArray);
      // }
    } catch (error) {
      // console.error("Error fetching latitudes and longitudes:", error);
      setCsvLoader(false);
    }
  };

  useEffect(() => {
    if (CsvFileData?.length > 0) {
      fetchLatLongForAddresses(CsvFileData);
      setCsvFileData([]);
    } else {
      setuploadedFileName("");
    }
  }, [CsvFileData]);

  const handleImportChange = async (files) => {
    setuploadedFileName(files?.name || "");

    if (
      files.type === "application/vnd.ms-excel" ||
      files.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const arrayBuffer = await files.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      setCsvFileData(data);
    } else {
      Papa.parse(files, {
        delimiter: "",
        chunkSize: 3,
        header: false,
        complete: function (responses) {
          const [headers, ...dataRows] = responses.data;
          const formattedData = dataRows.map((row) => {
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index] || "";
            });
            return rowData;
          });
          setCsvFileData(formattedData);
        },
      });
    }
  };
  const confirmationHandler = () => {
    // const newData = listData.filter((_, i) => i !== elementIndex);
    handleDeleteApi(elementIndex);
  };
  function downloadFile() {
    // CSV content
    const csvContent = `Address,City,State,Zip Code
     7 Towne Rd,Boxford,MA,1921
     607 Dutton St,Lowell,MA,1854
     175 Portland St 6,Boston,MA,2114
     138 Flint Locke Dr,Duxbury,MA,2332
     108 County Rd,Plympton,MA,2367
     31 Canal St,Medford,MA,2155`;

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);

    // Set the filename for the downloaded CSV file
    link.download = "example.csv";

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the body after the download
    document.body.removeChild(link);
  }
  useEffect(() => {
    if (listData[0]?.latitude && listData[0]?.longitude) {
      localStorage.setItem("latitudeInnerMap", listData[0]?.latitude);
      localStorage.setItem("longitudeInnerMap", listData[0]?.longitude);
      localStorage.setItem("latitude", listData[0]?.latitude);
      localStorage.setItem("longitude", listData[0]?.longitude);
      childRef.current.flyTo(
        fromLonLat([
          parseFloat(listData[0]?.longitude),
          parseFloat(listData[0]?.latitude),
        ]),
        () => {}
      );
    }
  }, [listData[0]?.longitude, submit]);

  const isSmallScreen = useMediaQuery("(max-width:599px)");
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box className="SideBarBox">
          <Box className="firstBox">
            <div className="backgroundDiv">
              <div className="cardDiv">
                <div className="imgMainDiv">
                  <div className="imgDiv">
                    <img
                      src={
                        profilePic
                          ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                            profilePic == `${ApiConfig.imagGet}/media/None`
                            ? "images/defaultPic.png"
                            : profilePic
                          : "images/defaultPic.png"
                      }
                      alt=""
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                      }}
                    />
                    <img
                      src="images/editPen.svg"
                      alt=""
                      className="editImg"
                      onClick={() => {
                        navigate("/edit-profile", {
                          state: {
                            profileData: user?.profile,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Typography
                    style={{ wordBreak: "break-all" }}
                    className="cardTitle"
                  >
                    {user?.profile?.user_info?.company_name || "--"}
                  </Typography>
                  <Typography
                    className="labelTitle"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open(
                        `${user?.profile?.user_info?.company_website}`,
                        "_blank"
                      );
                    }}
                  >
                    {user?.profile?.user_info?.company_website || "--"}
                  </Typography>
                </div>
                <Button
                  onClick={() => {
                    navigate("/edit-profile", {
                      state: {
                        profileData: user?.profile,
                      },
                    });
                  }}
                  className="editButton"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="buttonGroup">
              {/* <Button
                className="newButtoncss"
                onClick={() => {
                  setSubmit(false);
                }}
              >
                create my company yard sign
              </Button>
            <Button
                className="newButtoncss"
                onClick={() => {
                  setSubmit(false);
                }}
              >
                Edit/Revise My Company Yard Sign
              </Button> */}
              {user?.profile?.user_type?.is_admin ? (
                <Button
                  onClick={() => {
                    navigate("/user-details");
                  }}
                  className="newButtoncss"
                >
                  Users Yard Signs
                </Button>
              ) : (
                ""
              )}
            </div>
          </Box>
          <Box className="SecondBox">
            <Box
              className="flexBox"
              style={{ marginBottom: "20px", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "10px",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Typography className="title">
                    Digital Yard Sign Dashboard
                  </Typography>
                  <Typography className="CardText">
                    Design - Revise - Place Your Yard Signs Here
                  </Typography>
                  <Typography className="CardText">
                    Current Use - {listData?.length}/
                    {user?.profile?.plan?.feature_count || 0} Yard Signs Placed
                  </Typography>
                  <Button
                    onClick={() => {
                      navigate("/my-subscriptions");
                    }}
                    className={"newColorButtoncss"}
                    style={{ minWidth: "auto", marginTop: "15px" }}
                  >
                    Go to My Subscriptions{" "}
                  </Button>
                </div>
              </div>
            </Box>

            <Box>
              <Box className={classes.positionBox}>
                {!openPostYardSign && !openPostYardSignEdit && (
                  <div style={{ height: "400px" }}>
                    <MyServicesMap
                      type="ViewServices"
                      latLon={[latitude, longitude]}
                      ref={childRef}
                      listItems={listItems}
                      imgIcon={Icon}
                      listData={listData}
                      selectItem={"nnn"}
                      handleLatAndLog={handleLatAndLog}
                      CsvFileDataWithLatLog={CsvFileDataWithLatLog}
                      submit={submit}
                    />
                  </div>
                )}
                <div>
                  <div className="flexDiv">
                    <div
                      className="upperDiv gapBox"
                      style={{ padding: "25px 0px 0 40px" }}
                    ></div>
                    <div
                      className="divGrid upperDiv"
                      style={{ padding: "20px 23px 0px 0" }}
                    >
                      <img
                        src="images/yourLocationMini.svg"
                        alt="#"
                        onClick={() => {
                          childRef.current.getCurrentLocation();
                        }}
                      />

                      <div className="cssdiv">
                        <FaPlus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomIn();
                          }}
                        />
                        <div className="divider"></div>
                        <FaMinus
                          style={{
                            color: "#000000",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            childRef.current.handleZoomOut();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
              <div style={{marginTop:"1rem"}}>
                <TextField
                  placeholder="Sign Search"
                  value={query}
                  onChange={handleSearch}
                  style={{
                    width: "350px",
                    color: "black",
                    borderRadius: "10px",
                    border: "1px solid black",
                  }}
                  InputProps={{
                    endAdornment: query && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClear} size="small">
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                ></TextField>
                {showDropdown &&
                  (filteredResults.length > 0 ? (
                    <div className={classes.absoluteDiv}>
                      {filteredResults.map((item) => (
                        <div key={item.id} style={{ background: "#fff" }}>
                          <div
                            className={classes.locationDiv}
                            onClick={() => {
                              handleSelect(item);
                            }}
                          >
                            <HiLocationMarker style={{ fontSize: "18px" }} />
                            <Typography>{item?.address}</Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={classes.absoluteDiv}>No Matches Found</div>
                  ))}
              </div>
              <div
                style={{
                  width: "-webkit-fill-available",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
                className="backGroundCard"
              >
                <div>
                  <Typography className="cardTitle">
                    {user?.profile?.user_info?.company_name || "--"}
                  </Typography>

                  <Typography className="CardText">
                    {user?.profile?.profile?.sector_name || "--"}
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginTop: "10px",
                      gap: "10px",
                    }}
                  >
                    <img src="images/markerLocation.svg" alt="" />

                    <Typography
                      className="CardText"
                      style={{ marginTop: "5px" }}
                    >
                      {listData[0]?.address || "--"}
                    </Typography>
                  </div>
                </div>
              </div>
              
              <Box style={{ marginTop: "25px" }}>
                {isSmallScreen
                  ? user?.profile?.plan?.feature_count !== 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          <Button
                            className={classes.transButton}
                            onClick={() => {
                              setOpenModal(!openModal);
                            }}
                          >
                            Watch Video
                          </Button>
                          <Box>
                            <Modal
                              open={openModal}
                              onClose={handleClose}
                              className={classes.modalMain}
                              aria-labelledby="modal-modal-title"
                              aria-describedby="modal-modal-description"
                            >
                              <Card className={classes.modalCard}>
                                <Box className={classes.modalTopbar}>
                                  <Typography variant="h6">
                                    How to Upload Address?
                                  </Typography>
                                  <IconButton
                                    sx={{
                                      color: "#fff",
                                    }}
                                    onClick={handleClose}
                                  >
                                    <IoCloseCircleOutline />
                                  </IconButton>
                                </Box>
                                <CardMedia
                                  component="video"
                                  src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/videos/Customer+List+Export+-+Video+generated+with+Synthesia.mp4"
                                  controls
                                />
                              </Card>
                            </Modal>
                          </Box>
                          <Button className={classes.transButton}>
                            <input
                              type="file"
                              accept=".csv, .xlsx, .xls"
                              onClick={() => {
                                setCsvFileData([]);
                                setCsvFileDataWithLatLog([]);
                              }}
                              onChange={(event) =>
                                handleImportChange(event.target.files[0])
                              }
                              className={classes.importTag}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer",
                              }}
                            />
                            {csvLoader ? (
                              <ButtonCircularProgress
                                className={classes.transButton}
                              />
                            ) : (
                              `${
                                uploadedFileName
                                  ? uploadedFileName.length > 8
                                    ? `${uploadedFileName.slice(0, 8)}...`
                                    : uploadedFileName
                                  : "Upload Excel Address File"
                              }`
                            )}
                          </Button>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <div className={classes.ImportMainDiv}></div>
                          <Button
                            className={classes.transButton}
                            onClick={() => downloadFile()}
                          >
                            Download Example&nbsp;
                            <FaDownload />
                          </Button>
                          <Button
                            disabled={
                              listData?.length - 1 >
                              (user?.profile?.plan?.feature_count
                                ? user?.profile?.plan?.feature_count - 1
                                : 0)
                            }
                            onClick={() => setOpenPostYardSign(true)}
                            className={classes.transButton}
                          >
                            Add Another
                          </Button>
                          <Button
                            onClick={handleDeleteSelected}
                            className={classes.transButton}
                          >
                            Delete Selected
                          </Button>
                        </div>
                      </div>
                    )
                  : user?.profile?.plan?.feature_count !== 0 && (
                      <div className="divFlex" style={{ alignItems: "center" }}>
                        <Button
                          className={classes.transButton}
                          onClick={() => {
                            setOpenModal(!openModal);
                          }}
                        >
                          Watch Video
                        </Button>
                        <Box>
                          <Modal
                            open={openModal}
                            onClose={handleClose}
                            className={classes.modalMain}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                          >
                            <Card className={classes.modalCard}>
                              <Box className={classes.modalTopbar}>
                                <Typography variant="h6">
                                  How to Upload Address?
                                </Typography>
                                <IconButton
                                  sx={{
                                    color: "#fff",
                                  }}
                                  onClick={handleClose}
                                >
                                  <IoCloseCircleOutline />
                                </IconButton>
                              </Box>
                              <CardMedia
                                component="video"
                                src="https://yard-sign-pro.s3.us-east-1.amazonaws.com/assets/videos/Customer+List+Export+-+Video+generated+with+Synthesia.mp4"
                                controls
                              />
                            </Card>
                          </Modal>
                        </Box>

                        <Button
                          className={classes.transButton}
                          onClick={() => downloadFile()}
                        >
                          Download Example&nbsp;
                          <FaDownload />
                        </Button>
                        <div className={classes.ImportMainDiv}>
                          <Button className={classes.transButton}>
                            <input
                              type="file"
                              accept=".csv, .xlsx, .xls"
                              onClick={() => {
                                setCsvFileData([]);
                                setCsvFileDataWithLatLog([]);
                              }}
                              onChange={(event) =>
                                handleImportChange(event.target.files[0])
                              }
                              className={classes.importTag}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer",
                              }}
                            />
                            {csvLoader ? (
                              <ButtonCircularProgress
                                className={classes.transButton}
                              />
                            ) : (
                              `${
                                uploadedFileName
                                  ? uploadedFileName.length > 8
                                    ? `${uploadedFileName.slice(0, 8)}...`
                                    : uploadedFileName
                                  : "Upload Excel Address File"
                              }`
                            )}
                          </Button>
                        </div>
                        <Button
                          disabled={
                            listData?.length - 1 >
                            (user?.profile?.plan?.feature_count
                              ? user?.profile?.plan?.feature_count - 1
                              : 0)
                          }
                          onClick={() => setOpenPostYardSign(true)}
                          className={classes.transButton}
                        >
                          Add Another
                        </Button>

                        <Button
                          onClick={handleDeleteSelected}
                          className={classes.transButton}
                        >
                          Delete Selected
                        </Button>
                      </div>
                    )}
              </Box>
              {listData && listData.length !== 0
                ? listData.map((values, index) => {
                    if (index == 0) return null;
                    const isSelected = selectedItems.includes(values.id);
                    return (
                      <Box className="backGroundCard" key={values.id}>
                        <div
                          className="alignDiv"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {index != 0 && (
                            <div
                              style={{
                                flexShrink: 0,
                                width: `${isSmallScreen ? "50px" : "100px"}`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleSelectItem(values.id, index)
                                }
                                style={{
                                  width: `${isSmallScreen ? "50px" : "100px"}`,
                                  height: "15px",
                                }}
                              />
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                              flexGrow: 1,
                            }}
                          >
                            <img src="images/markerLocation.svg" alt="" />
                            <Typography
                              className="CardText"
                              style={{ fontSize: "14px", flex: 1 }}
                            >
                              {`${values.address}`}
                            </Typography>
                          </div>
                          <div
                            className={classes.newFlex}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Tooltip
                              title={
                                user?.profile?.plan?.feature_count === 0 ||
                                user?.profile?.plan?.feature_count < index
                                  ? "please subscribe to one of our plans."
                                  : ""
                              }
                            >
                              <img
                                src={
                                  values.latitude && values.longitude
                                    ? user?.profile?.plan?.feature_count === 0
                                      ? "images/zoomToMapRed.svg"
                                      : user?.profile?.plan?.feature_count >=
                                        index
                                      ? "images/zoomToMap.svg"
                                      : "images/zoomToMapRed.svg"
                                    : "images/zoomToMapRed.svg"
                                }
                                alt=""
                                className={classes.zoomIcon}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  if (values.latitude && values.longitude) {
                                    childRef.current.flyTo(
                                      fromLonLat([
                                        parseFloat(values.longitude),
                                        parseFloat(values.latitude),
                                      ]),
                                      () => {}
                                    );
                                  }
                                }}
                              />
                            </Tooltip>
                            <img
                              src="images/zoomIcon.svg"
                              alt=""
                              className={classes.zoomIcon1}
                              style={{ cursor: "pointer" }}
                            />
                            <img
                              src="images/PencilSimple.svg"
                              alt=""
                              style={{
                                cursor: "pointer",
                                width: `${isSmallScreen ? "25px" : ""}`,
                              }}
                              onClick={() => {
                                setOpenPostYardSignEdit(true);
                                setElementIndex(values.id);
                                setCsvFileDataWithLatLog([]);
                                // document.getElementById("fileInput").value =
                                //   null;
                                setEditData([values, { index: index }]);
                                setGeoCodeCompanyAdressEdit(values.address);
                                setTimeout(() => {
                                  handlesetLat([
                                    {
                                      longitude: parseFloat(values.longitude),
                                      latitude: parseFloat(values.latitude),
                                    },
                                  ]);
                                }, 100);
                              }}
                            />
                            {index === 0 && (
                              <div
                                style={{ width: "32px", height: "38px" }}
                              ></div>
                            )}
                          </div>
                        </div>
                      </Box>
                    );
                  })
                : ""}
            </Box>
          </Box>
        </Box>
      </Grid>
      {openDrawer && (
        <Drawer
          anchor={"left"}
          open={openDrawer}
          onClose={() => {
            setOpenDrawer(false);
          }}
          classes={{
            paper: classes.headbox, // Apply your makeStyles class to the paper prop
          }}
          style={{ paddingTop: "0px" }}
        >
          <Box style={{ maxWidth: "300px" }}>
            <div className="backgroundDiv">
              <div style={{ display: "grid", gap: "20px" }}>
                <div className="imgMainDiv">
                  <div className="imgDiv">
                    <img
                      src={
                        profilePic
                          ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                            profilePic == `${ApiConfig.imagGet}/media/None`
                            ? "images/defaultPic.png"
                            : profilePic
                          : "images/defaultPic.png"
                      }
                      alt=""
                      style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                      }}
                    />
                    <img
                      src="images/editPen.svg"
                      alt=""
                      className="editImg"
                      onClick={() => {
                        navigate("/edit-profile", {
                          state: {
                            profileData: user?.profile,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Typography>
                    {user?.profile?.user_info?.company_name || "--"}
                  </Typography>
                  <Typography
                    className="labelTitle"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      window.open(
                        `${user?.profile?.user_info?.company_website}`,
                        "_blank"
                      );
                    }}
                  >
                    {user?.profile?.user_info?.company_website || "--"}
                  </Typography>
                </div>
                <Button
                  onClick={() => {
                    navigate("/edit-profile", {
                      state: {
                        profileData: user?.profile,
                      },
                    });
                  }}
                  className="editButton"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="buttonGroup">
              {/* <Button className="newButtoncss">
                create my company yard sign
              </Button> */}
              <Button
                onClick={() => {
                  setSubmit(false);
                }}
                className="newButtoncss"
              >
                Edit/Revise My Company Yard Sign
              </Button>

              {user?.profile?.user_type?.is_admin ? (
                <Button
                  onClick={() => {
                    navigate("/user-details");
                  }}
                  className="newButtoncss"
                >
                  Users Yard Signs
                </Button>
              ) : (
                ""
              )}
              {/* <Tooltip title="Coming Soon"> */}
              <Button
                className="newColorButtoncss"
                style={{ marginBottom: "30px" }}
                onClick={() => {
                  navigate("/my-subscriptions");
                }}
              >
                My Subscriptions
              </Button>
              {/* </Tooltip> */}
            </div>
          </Box>
        </Drawer>
      )}

      {openPostYardSign && (
        <Drawer
          anchor={"right"}
          open={openPostYardSign}
          // onClose={() => {
          //   setOpenPostYardSign(false);
          // }}
          classes={{
            paper: classes.modelBox, // Apply your makeStyles class to the paper prop
          }}
          style={{ padding: "20px" }}
        >
          <Box style={{ minWidth: "300px" }}>
            <div className="flexDivTag">
              <Typography className="textTitle">Post Yard Sign</Typography>
              <img
                src="images/XCircleCross.svg"
                alt="X"
                onClick={() => {
                  setGeoCodeCompanyAdress("");
                  childRef.current.removeAllIcons();
                  setsetScreenLat([]);
                  setOpenPostYardSign(false);
                  setaddressError(false);
                }}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="divider"></div>
            <Box className={classes.positionBox}>
              <div style={{ height: "280px" }}>
                <MyServicesMap
                  type="UploadServices"
                  latLon={[latitude, longitude]}
                  ref={childRef}
                  listItems={listItems}
                  imgIcon={Icon}
                  screenLat={screenLat}
                  selectError={selectError}
                  handleLatAndLog={handleLatAndLog}
                  handlesetLatMap={handlesetLatMap}
                />
              </div>
              <div>
                <div className="flexDiv">
                  <div
                    className="upperDiv gapBox"
                    style={{ padding: "25px 0px 0 40px" }}
                  ></div>
                  <div
                    className="divGrid upperDiv"
                    style={{ padding: "20px 23px 0px 0" }}
                  >
                    <img
                      src="images/yourLocationMini.svg"
                      alt="#"
                      onClick={() => {
                        childRef.current.getCurrentLocation();
                      }}
                    />

                    <div className="cssdiv">
                      <FaPlus
                        style={{
                          color: "#000000",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          childRef.current.handleZoomIn();
                        }}
                      />
                    <div className="divider"></div> 
                      <FaMinus
                        style={{
                          color: "#000000",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          childRef.current.handleZoomOut();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Box>
            <Formik
              onSubmit={(values) => handleFormData(values)}
              initialValues={formInitialSchema}
              initialStatus={{
                success: false,
                successMsg: "",
              }}
              validationSchema={yep.object().shape({
                // Zipcode: yep.string().required("Please enter zip code"),
                // companyAddress: yep
                //   .string()
                // .required("Please enter your company's address"),
                // companyAddressContinued: yep.string(),
                // state: yep.object().nullable(),
                // // .required("Select a state"),
                // city: yep.string().required("Please enter your city"),
              })}
            >
              {({
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                touched,
                values,
                setFieldValue,
              }) => (
                <Form>
                  <Box item style={{ marginTop: "22px" }}>
                    <Typography className={classes.Loginlabelall}>
                      Yard Sign Address
                      <span style={{ color: "#FE3B3B" }}>*</span>
                    </Typography>
                    <div style={{ position: "relative" }}>
                      <TextField
                        placeholder="Enter Full Address"
                        type="text"
                        variant="outlined"
                        fullWidth
                        id="inputID"
                        size="small"
                        inputProps={{ maxLength: 256, autoComplete: "off" }}
                        value={geoCodeCompanyAdress}
                        name="companyAddress"
                        className={classes.LoginTextBox}
                        error={Boolean(addressError)}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleListLocation(e.target.value);
                          // setFieldValue("companyAddress", e.target.value);
                          setGeoCodeCompanyAdress(e.target.value);
                        }}
                        onSubmit={handleSubmit}
                        InputProps={{
                          className: classes.Logintextfiled,
                        }}
                      />
                      {listItemsSearch?.length > 0 && (
                        <div
                          style={{
                            border: "1px solid #00000033",
                            borderRadius: "10px",
                            padding: "0.5rem",
                          }}
                        >
                          {listItemsSearch?.map((item) => {
                            return (
                              <div
                                key={item?.id}
                                className={classes.searchResultItem}
                              >
                                <div
                                  className={classes.locationDiv}
                                  onClick={() => {
                                    setSelectPosition(item);
                                    handlesetLat([
                                      {
                                        longitude:
                                          item?.geometry?.coordinates[0],
                                        latitude:
                                          item?.geometry?.coordinates[1],
                                      },
                                    ]);
                                    setGeoCodeCompanyAdress(item?.place_name);
                                    setListItems([item]);
                                    // setFieldValue(
                                    //   "companyAddress",
                                    //   item?.place_name
                                    // );
                                    setListItemsSearch([]);
                                    setaddressError(false);
                                  }}
                                >
                                  <div>
                                    <HiLocationMarker
                                      style={{ fontSize: "18px" }}
                                    />
                                  </div>
                                  <Typography>{item?.place_name}</Typography>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {addressError && (
                      <FormHelperText
                        error
                        style={{
                          fontSize: "12px",
                          fontFamily: "'Noto Sans', sans-serif",
                        }}
                      >
                        {"Please enter your company's address"}
                      </FormHelperText>
                    )}
                  </Box>

                  <Box className={classes.twobtnBox}>
                    <Button
                      onClick={() => {
                        setOpenPostYardSign(false);
                        // toast.success("Location deleted successfully!");
                      }}
                      className={classes.deleteButton}
                    >
                      Delete
                    </Button>
                    <Button
                      className={classes.postButton}
                      disabled={isloading}
                      type="submit"
                    >
                      Post {isloading && <ButtonCircularProgress />}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Drawer>
      )}

      {openPostYardSignEdit && (
        <Drawer
          anchor={"right"}
          open={openPostYardSignEdit}
          // onClose={() => {
          //   setOpenPostYardSignEdit(false);
          // }}
          classes={{
            paper: classes.modelBox, // Apply your makeStyles class to the paper prop
          }}
          style={{ padding: "20px" }}
        >
          <Box style={{ minWidth: "300px" }}>
            <div className="flexDivTag">
              <Typography className="textTitle">Post Yard Sign</Typography>
              <img
                src="images/XCircleCross.svg"
                alt="X"
                onClick={() => {
                  setGeoCodeCompanyAdressEdit("");
                  childRef.current.removeAllIcons();
                  setsetScreenLat([]);
                  seterrorEditCompany(false);
                  setOpenPostYardSignEdit(false);
                }}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="divider"></div>
            <Box className={classes.positionBox}>
              <div style={{ height: "280px" }}>
                <MyServicesMap
                  latLon={[latitude, longitude]}
                  type="UploadServices"
                  ref={childRef}
                  listItems={listItems}
                  imgIcon={Icon}
                  screenLat={screenLat}
                  selectError={selectError}
                  handleLatAndLog={handleLatAndLog}
                  handlesetLatMap={handlesetLatMapEdit}
                />
              </div>
              <div>
                <div className="flexDiv">
                  <div
                    className="upperDiv gapBox"
                    style={{ padding: "25px 0px 0 40px" }}
                  ></div>
                  <div
                    className="divGrid upperDiv"
                    style={{ padding: "20px 23px 0px 0" }}
                  >
                    <img
                      src="images/yourLocationMini.svg"
                      alt="#"
                      onClick={() => {
                        childRef.current.getCurrentLocation();
                      }}
                    />

                    <div className="cssdiv">
                      <FaPlus
                        style={{
                          color: "#000000",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          childRef.current.handleZoomIn();
                        }}
                      />
                      <div className="divider"></div>
                      <FaMinus
                        style={{
                          color: "#000000",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          childRef.current.handleZoomOut();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Box>
            <Formik
              onSubmit={(values) => handleEditFormData(values)}
              initialValues={{
                // Zipcode: editData[0]?.zipcode || "",
                companyAddress: editData[0]?.address || "",
                companyAddressContinued: "",
                // state: editData[0]?.state || "",
                // city: editData[0]?.city || "",
              }}
              initialStatus={{
                success: false,
                successMsg: "",
              }}
              validationSchema={yep.object().shape({
                // Zipcode: yep.string(),
                // companyAddress: yep.string(),
                // .required("Please enter your company's address"),
                // companyAddressContinued: yep.string(),
                // state: yep.object().nullable(),
                // // .required("Select a state"),
                // city: yep.string(),
              })}
            >
              {({
                errors,
                handleBlur,
                handleChange,
                handleSubmit,
                touched,
                values,
                setFieldValue,
              }) => (
                <Form>
                  <Box item style={{ marginTop: "22px" }}>
                    <Typography className={classes.Loginlabelall}>
                      Yard Sign Address
                      <span style={{ color: "#FE3B3B" }}>*</span>
                    </Typography>
                    <div style={{ position: "relative" }}>
                      <TextField
                        placeholder="Enter Full Address"
                        type="text"
                        variant="outlined"
                        fullWidth
                        id="inputID"
                        size="small"
                        inputProps={{ maxLength: 256, autoComplete: "off" }}
                        value={geoCodeCompanyAdressEdit}
                        name="companyAddress"
                        className={classes.LoginTextBox}
                        error={Boolean(errorEditCompany)}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleListLocation(e.target.value);
                          setGeoCodeCompanyAdressEdit(e.target.value);
                        }}
                        InputProps={{
                          className: classes.Logintextfiled,
                        }}
                      />
                      {listItemsSearch?.length > 0 && (
                        <div
                          style={{
                            border: "1px solid #00000033",
                            borderRadius: "10px",
                            padding: "0.5rem",
                          }}
                        >
                          {listItemsSearch?.map((item) => {
                            return (
                              <div
                                key={item?.id}
                                className={classes.searchResultItem}
                              >
                                <div
                                  className={classes.locationDiv}
                                  onClick={() => {
                                    setSelectPosition(item);

                                    handlesetLat([
                                      {
                                        longitude:
                                          item?.geometry?.coordinates[0],
                                        latitude:
                                          item?.geometry?.coordinates[1],
                                      },
                                    ]);
                                    // setFieldValue(
                                    //   "companyAddress",
                                    //   item?.place_name
                                    // );
                                    setGeoCodeCompanyAdressEdit(
                                      item?.place_name
                                    );
                                    setListItems([item]);
                                    setListItemsSearch([]);
                                  }}
                                >
                                  <div>
                                    <HiLocationMarker
                                      style={{ fontSize: "18px" }}
                                    />
                                  </div>
                                  <Typography>{item?.place_name}</Typography>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {errorEditCompany && (
                      <FormHelperText
                        error
                        style={{
                          fontSize: "12px",
                          fontFamily: "'Noto Sans', sans-serif",
                        }}
                      >
                        Please enter your company's address
                      </FormHelperText>
                    )}
                  </Box>

                  <Box className={classes.twobtnBox}>
                    <Button
                      disabled={isloading}
                      onClick={() => {
                        console.log("clicked");
                        handleDeleteApi(elementIndex);
                        // handleSelectItem(elementIndex);
                      }}
                      className={classes.deleteButton}
                    >
                      Delete{isloading && <ButtonCircularProgress />}
                    </Button>
                    <Button
                      className={classes.postButton}
                      disabled={isloading}
                      type="submit"
                    >
                      Post {isloading && <ButtonCircularProgress />}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Drawer>
      )}
      {open && (
        <ConfirmationDialog
          open={open}
          handleClose={() => setOpen(false)}
          title={"Delete"}
          desc={"Do you want to delete this location ?"}
          confirmationHandler={confirmationHandler}
          isloading={isloading}
        />
      )}
      {openPopUp && (
        <Dialog
          open={openPopUp}
          onClose={() => {
            setOpenPopup(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
          PaperProps={{
            classes: {
              root: classes.headbox,
            },
            style: {
              maxWidth: 380,
              width: "100%",
              padding: "20px 10px",
            },
          }}
        >
          <Box
            style={{
              display: "grid",
              gap: "20px",
              textAlign: "center",
              margin: "10px",
            }}
          >
            <Box style={{ position: "relative" }}>
              <div
                style={{ position: "absolute", right: "-18px", top: "-27px" }}
              >
                <img
                  src="images/XCircleCross.svg"
                  alt="X"
                  onClick={() => {
                    setOpenPopup(false);
                  }}
                  style={{ cursor: "pointer", width: "30px" }}
                />
              </div>
              <Typography className={classes.subMain}>
                Unlock Full Access!
              </Typography>
              <Typography style={{ fontSize: "18px" }} className="textTitle">
                To post yard signs and access all features, please{" "}
                <strong>subscribe</strong> to one of our plans. Your
                subscription helps us improve and provide you with the best
                service.
              </Typography>
            </Box>

            <Box
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <Button
                className="newColorButtoncss"
                fullWidth
                onClick={() => {
                  navigate("/my-subscriptions");
                }}
              >
                Start Your 30 Day Free Trial
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Grid>
  );
}
