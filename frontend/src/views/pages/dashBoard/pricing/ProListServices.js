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
  } from "@mui/material";
  import Axios from "axios";
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
  
  export default function ProListServices({
    classes,
    handleCallBack,
    imgIcon,
    uploadData,
    setSubmit,
    submit,
  }) {
    const [Icon, setIcon] = useState("images/icons/defaultIconLogo.svg");
    const [open, setOpen] = useState(false);
    const [openPopUp, setOpenPopup] = useState(false);
    const [elementIndex, setElementIndex] = useState("");
    const [listData, setListData] = useState([]);
    const [csvLoader, setCsvLoader] = useState(false);
    const [newDataToUpload, setNewDataToUpload] = useState([]);
    const user = useContext(UserContext);
    useEffect(() => {
      if (
        user?.profile?.plan?.feature_count === 0
      ) {
        setOpenPopup(true);
      }else{
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
          }${values}.json?access_token=${"pk.eyJ1IjoiZ2VvZGFrYSIsImEiOiJjbHRoNnE2YWgwMXAxMmxwaG1wcnppZWphIn0.3YoeVGWEQ4Ux2ApJ_O23sQ"}`
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
      setLoader(true);
      setNewDataToUpload([]);
      const raw = JSON.stringify([
        {
          id: values,
        },
      ]);
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
  
    const handleImportChange = (files) => {
      setuploadedFileName(files?.name || "");
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
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="SideBarBox">
            <Box className="firstBox">
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
                        // onClick={() => {
                        //   navigate("/edit-profile", {
                        //     state: {
                        //       profileData: user?.profile,
                        //     },
                        //   });
                        // }}
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
                    //   onClick={() => {
                    //     window.open(
                    //       `${user?.profile?.user_info?.company_website}`,
                    //       "_blank"
                    //     );
                    //   }}
                    >
                      {user?.profile?.user_info?.company_website || "--"}
                    </Typography>
                  </div>
                  <Button
                    // onClick={() => {
                    //   navigate("/edit-profile", {
                    //     state: {
                    //       profileData: user?.profile,
                    //     },
                    //   });
                    // }}
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
                </Button> */}
                <Button
                  className="newButtoncss"
                  // onClick={() => {
                  //   setSubmit(false);
                  // }}
                >
                  Edit/Revise My Company Yard Sign
                </Button>
                {user?.profile?.user_type?.is_admin ? (
                  <Button
                    // onClick={() => {
                    //   navigate("/user-details");
                    // }}
                    className="newButtoncss"
                  >
                    Users Yard Signs
                  </Button>
                ) : (
                  ""
                )}
  
                <Button
                //   onClick={() => {
                //     navigate("/my-subscriptions");
                //   }}
                  className="newColorButtoncss"
                >
                  My Subscriptions
                </Button>
              </div>
            </Box>
            <Box className="SecondBox">
              <Box
                className="flexBox"
                style={{ marginBottom: "20px", gap: "8px" }}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginBottom: "10px" }}
                >
                  <div className="visible">
                    <img
                      src="images/editPen.svg"
                      alt=""
                      class="editImgDrawer"
                    //   onClick={() => {
                    //     setOpenDrawer(true);
                    //   }}
                    />
                  </div>
                  <div>
                    <Typography className="title">
                      Digital Yard Sign Dashboard
                    </Typography>
                    <Typography className="CardText">
                      Design - Revise - Place Your Yard Signs Here
                    </Typography>
                    <Typography className="CardText">
                      Current Use - {listData?.length - 0}/
                      {user?.profile?.plan?.feature_count || 25} Yard Signs Placed
                    </Typography>
                    {/* <Tooltip title="Coming Soon"> */}
                    {/* <IconButton> */}
                    <Button
                    //   onClick={() => {
                    //     navigate("/my-subscriptions");
                    //   }}
                      className={"newColorButtoncss"}
                      style={{ minWidth: "auto", marginTop: "15px" }}
                    >
                      Go to My Subscriptions{" "}
                    </Button>
                    {/* </IconButton> */}
                    {/* </Tooltip> */}
                  </div>
                </div>
                {user?.profile?.plan?.feature_count !== 0 && (
                  <div className="divFlex" style={{ alignItems: "center" }}>
                    {/* <Button
                    className="buttoncss"
                    disabled={(listData?.length - 1) > (user?.profile?.plan?.feature_count ? user?.profile?.plan?.feature_count- 1 : 0 )}
                    onClick={() => setOpenPostYardSign(true)}
                    style={{ minWidth: "auto" }}
                  >
                    ADD MANUAL
                  </Button> */}
                    <div className={classes.ImportMainDiv}>
                      {/* <input
                        type="file"
                        // onClick={() => {
                        //   setCsvFileData([]);
                        //   setCsvFileDataWithLatLog([]);
                        //   document.getElementById("fileInput").value = null;
                        // }}
                        // onChange={(event) => {
                        //   handleImportChange(event.target.files[0]);
                        // }}
                        className={classes.importTag}
                        id="fileInput"
                      /> */}
                      <Button
                        className="buttoncss"
                        style={{ width: "-webkit-fill-available" }}
                      >
                        {csvLoader ? (
                          <ButtonCircularProgress classes={classes} />
                        ) : (
                          `${
                            uploadedFileName
                              ? uploadedFileName?.length > 8
                                ? uploadedFileName?.slice(0, 8) + "..."
                                : uploadedFileName
                              : "Upload Excel Address File"
                          }`
                         )} 
                      </Button>
                    </div>
                    <Button
                      className="buttonDownloadcss"
                    //   onClick={() => downloadFile()}
                    >
                      Download Example&nbsp;
                      <FaDownload />
                    </Button>
                  </div>
                )}
              </Box>
  
              <Box>
                <Box className={classes.positionBox}>
                  {!openPostYardSign && !openPostYardSignEdit && (
                    <div style={{ height: "226px" }}>
                      <MyServicesMap
                        type="ViewServices"
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
                        //   onClick={() => {
                        //     childRef.current.getCurrentLocation();
                        //   }}
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
                  </div>
                </div>
                {listData && listData?.length !== 0
                  ? listData?.map((values, index) => {
                      return (
                        <Box className="backGroundCard">
                          <div className="alignDiv">
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              <img src="images/markerLocation.svg" alt="" />
                              <Typography
                                className="CardText"
                                style={{ fontSize: "14px" }}
                              >
                                {`${values.address}`}
                              </Typography>
                            </div>
                            <div className={classes.newFlex}>
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
                                style={{ cursor: "pointer" }}
                              
                              />
                              {index === 0 && (
                                <div
                                  style={{ width: "32px", height: "38px" }}
                                ></div>
                              )}
                              {index !== 0 && (
                                <img
                                  src="images/TrashSimple.svg"
                                  alt=""
                                  style={{ cursor: "pointer" }}
                               
                                />
                              )}
                            </div>
                          </div>
                        </Box>
                      );
                    })
                  : ""}
              </Box>
              <Box style={{ marginTop: "25px" }}>
              
                {user?.profile?.plan?.feature_count !== 0 && (
                  <Box className={classes.twobtnBox}>
                    <Button
                      disabled={
                        listData?.length - 1 >
                        (user?.profile?.plan?.feature_count
                          ? user?.profile?.plan?.feature_count - 1
                          : 0)
                      }
                  
                      className={classes.transButton}
                    >
                      Add Another
                    </Button>
              
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
  
      </Grid>
    );
  }
  