import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { toast, ToastContainer } from "react-toastify";
import CustomDropZone from "src/views/pages/dashBoard/UploadBox";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import MyServicesMap from "src/views/pages/dashBoard/map/NewUploadServicesMap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { UserContext } from "src/context/User";
import { useLocation, useNavigate } from "react-router-dom";
// import Joyride, { STATUS } from "react-joyride";
import { IoMdArrowBack } from "react-icons/io";
import a11yChecker from "a11y-checker";
import { useMount, useSetState } from "react-use";
import { IoInformationCircle } from "react-icons/io5";
// import { makeStyles } from "@mui/styles";
import Carousel from "react-material-ui-carousel";



export default function UserSectorData({
  userSProfileData,
  uploadData,
  ImageVideo,
  getUploadFileData,
  setSubmit,
  getUploadFile,
  getUserProfileData,
  getUploadData,
  classes
}) {
  const navigate = useNavigate();
  const [loaderViewVideo, setloaderViewVideo] = useState(true);

  const user = useContext(UserContext);
  const childRef = useRef();
  const [isloading, setLoader] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [latLon, setLatLon] = useState("");
  const [disabledVideo, setDisabledVideo] = useState(false);

  const [selectItem, setSelectItem] = useState(
    uploadData[0]?.sector_name || ""
  );
  const [checked, setChecked] = useState(false);
  const [imgIcon, setImgIcon] = useState("images/icons/defaultIconLogo.svg");
  const [sectorId, setSectorId] = useState();
  const [profilePic, setProfilePic] = useState("/images/newStatic.jpg");

  useEffect(() => {
    setProfilePic(
      userSProfileData?.image
        ? `${ApiConfig.imagGet}${userSProfileData?.image}`
        : "/images/newStatic.jpg"
    );
  }, [userSProfileData?.image]);

  const [profileData, setProfileData] = useState(profilePic);
  // const [frontImagePreview, setFrontImagePreview] = useState([]);
  const [frontSide, setFrontSide] = useState([]);
  const [frontVideoPreview, setFrontVideoPreview] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [frontSideVideo, setFrontSideVideo] = useState([]);
  const [listItems, setListItems] = useState([]);
  // const [loaderView, setloaderView] = useState(true);
  const [openLogo, setOpenLogo] = useState(false);
  const [sectorList, setSectorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [Icon, setIcon] = useState("images/icons/defaultIconLogo.svg");
  const location = useLocation();

  // defing image constant
  const [loaderView, setLoaderView] = useState(true);
  const [frontImagePreview, setFrontImagePreview] = useState([]);
  const [mediaData, setMediaData] = useState([]);


  const [selectedCategory, setSelectedCategory] = useState(
    user?.profile?.profile?.category_name || ""
  );
  const consumerInfoData = [
    { file: "images/first.png" },
    { file: "images/second.png" },
    { file: "images/third.png" },
  ];
  function Item(props) {
    if (props.item != null) {
      return (
        // <Paper style={{
        //   // height: "190px"
        //   }}>
        <img
          className={classes.imgCustom}
          src={`${props.item}`}
          alt="DashImage"
          style={{ height: "200px" }}
        />
        //  </Paper>
      );
    } else {
      return null;
    }
  }
  console.log(uploadData, "uploadData");
  useEffect(() => {
    if (uploadData) {
      getSectorData(uploadData[0]?.category_id);
      setSelectedCategoryId(uploadData[0]?.category_id);
      setSelectedCategory(uploadData[0]?.category_name);
      setSelectItem(uploadData[0]?.sector_name);
    }
  }, [uploadData]);
  //image
  useEffect(() => {
    const getImageAsBase64 = async (imageUrl) => {
      console.log('Attempting to fetch image from:', imageUrl);

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch image, HTTP status ' + response.status);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    };

    if (ImageVideo) {
      const getImagePromises = ImageVideo
        .map((value, index) => {
          if (value?.file != null) {
            return getImageAsBase64(`${ApiConfig.imagGet}${value.file}`);
          } else {
            return null; // Returning null for images with null or undefined files
          }

        })
        .filter((promise) => promise !== null); // Filtering out null promises
      // console.log('ApiConfig.imagGet:', ApiConfig.imagGet.value.file);

      Promise.all(getImagePromises)
        .then((base64Images) => {
          setFrontImagePreview(base64Images);
          setLoaderView(false);
        })
        .catch((error) => {
          console.error("Error converting images to base64:", error);
          setLoaderView(false);
        });
    } else {
      console.log("No ImageVideo provided.");
    }
  }, [ImageVideo]);

  // video
  useEffect(() => {
    const getImageAsBase64 = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.onerror = reject;
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    };

    if (ImageVideo) {
      const getImagePromises = ImageVideo
        .map((value, index) => {
          if (value?.video_file != null) {
            return getImageAsBase64(`${ApiConfig.imagGet}${value.video_file}`);
          } else {
            return null; // Returning null for images with null or undefined files
          }
        })
        .filter((promise) => promise !== null); // Filtering out null promises

      Promise.all(getImagePromises)
        .then((base64Images) => {
          setFrontVideoPreview(base64Images);
          setloaderViewVideo(false);
        })
        .catch((error) => {
          console.error("Error converting images to base64:", error);
          setloaderViewVideo(false);
        });
    } else {
      console.log("No ImageVideo provided.");
    }
  }, [ImageVideo]);

  const handleLatAndLog = (lat, long) => {
    setLongitude(long || NaN);
    setLatitude(lat || NaN);
  };
  useEffect(() => {
    if (userSProfileData?.address) {
      handleListLocation(userSProfileData?.address);
    }
  }, [ImageVideo]);

  const handleListLocation = async (values) => {
    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${values}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setListItems(result.features);
      setLongitude(result?.features[0]?.center[0]);
      setLatitude(result?.features[0]?.center[1]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlesetLat = (values) => {
    setLatLon(values);
  };

  useEffect(() => {
    if (frontImagePreview?.length >= 3) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [frontImagePreview]);
  useEffect(() => {
    if (frontImagePreview?.length >= 3) {
      setDisabledVideo(true);
    } else {
      setDisabledVideo(false);
    }
  }, [frontVideoPreview]);

  const acceptedFileTypesVideo = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "video/mp4",
    "video/x-matroska",
    "video/svg+xml",
  ];
  const acceptedFileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  const handleFormSubmit = async (values) => {
    if (selectItem == "") {
      toast.error("Please select a sector.");
    } else if (frontImagePreview?.length === 0) {
      toast.error("Please upload at least one slider photo.");
    } else if (frontVideoPreview?.length === 0) {
      toast.error("Please upload at least one image or video.");
    } else if (!checked) {
      toast.error("Please agree to the Terms & Condition and Posting Rules.");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();

        frontImagePreview.forEach((imageBase64, index) => {
          const getMimeTypeFromBase64 = (base64) =>
            base64?.substring(5, base64.indexOf(";base64"));
          const blob = base64ToBlob(
            imageBase64,
            getMimeTypeFromBase64(imageBase64)
          );
          formData.append(`uploadedfile1`, blob, `image${index}.png`);
        });
        frontVideoPreview.forEach((videoBase64, index) => {
          const exten = videoBase64?.substring(
            5,
            videoBase64.indexOf(";base64")
          );
          const getMimeTypeFromBase64 = (base64) =>
            base64?.substring(5, base64.indexOf(";base64"));
          const blob = base64ToBlob(
            videoBase64,
            getMimeTypeFromBase64(videoBase64)
          );
          if (exten == "video/mp4") {
            formData.append(`uploadedfile2`, blob, `video${index}.mp4`);
          } else {
            formData.append(`uploadedfile2`, blob, `image${index}.png`);
          }
        });
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("sector", parseInt(sectorId));
        formData.append("category_id", selectedCategoryId);
        formData.append("category_name", selectedCategory);
        formData.append("sector_name", selectItem);
        formData.append("sector_id", parseInt(sectorId));
        formData.append("user_email", localStorage.getItem("email"));
        // formData.append("state", user?.profile?.user_info?.state);
        // formData.append("zipcode", user?.profile?.user_info?.zipcode);
        // formData.append("city", user?.profile?.user_info?.city);
        formData.append("address", user?.profile?.user_info?.company_address);
        formData.append("user_id", location.state.userId);

        const res = await Axios.put(ApiConfig.updateUserInfo, formData, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          getUploadFile();
          setSubmit(false)
          getUserProfileData();
          getUploadData();
        }
      } catch (error) {
        setLoader(false);
        if (error.response?.data?.error) {
          // const errorMessage = await error.response.json().message; // Parse error response JSON
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later."); // Handle unexpected errors
        }
      }
    }
  };
  const handleUploadSub = async (values) => {
    if (selectItem == "") {
      toast.error("Please select a sector.");
    } else if (frontImagePreview?.length === 0) {
      toast.error("Please upload at least one slider photo.");
    } else if (frontVideoPreview?.length === 0) {
      toast.error("Please upload at least one image or video.");
    } else if (!checked) {
      toast.error("Please agree to the Terms & Condition and Posting Rules.");
    } else {
      setLoader(true);
      try {
        const formData = new FormData();

        frontImagePreview.forEach((imageBase64, index) => {
          const getMimeTypeFromBase64 = (base64) =>
            base64?.substring(5, base64.indexOf(";base64"));
          const blob = base64ToBlob(
            imageBase64,
            getMimeTypeFromBase64(imageBase64)
          );
          formData.append(`uploadedfile1`, blob, `image${index}.png`);
        });

        frontVideoPreview.forEach((videoBase64, index) => {
          const exten = videoBase64?.substring(
            5,
            videoBase64?.indexOf(";base64")
          );
          const getMimeTypeFromBase64 = (base64) =>
            base64?.substring(5, base64.indexOf(";base64"));
          const blob = base64ToBlob(
            videoBase64,
            getMimeTypeFromBase64(videoBase64)
          );
          if (exten == "video/mp4") {
            formData.append(`uploadedfile2`, blob, `video${index}.mp4`);
          } else {
            formData.append(`uploadedfile2`, blob, `image${index}.png`);
          }
        });
        formData.append("sector", parseInt(sectorId));
        formData.append("category_id", selectedCategoryId);
        formData.append("category_name", selectedCategory);
        formData.append("sector_name", selectItem);
        formData.append("sector_id", parseInt(sectorId));
        const res = await Axios.post(ApiConfig.updateUserInfo, formData, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          //return screen
          getUploadFileData();
        }
      } catch (error) {
        setLoader(false);
        if (error.response?.data?.error) {
          // const errorMessage = await error.response.json().message; // Parse error response JSON
          toast.error(error.response?.data?.error);
        } else {
          toast.error("Something went wrong please try again later."); // Handle unexpected errors
        }
      }
    }
  };
  function base64ToBlob(base64, type) {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString?.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString?.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
  }

  const previewImage = (file) => {
    return URL.createObjectURL(file);
  };
  const handleFrontSideChange = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFrontSide([...frontSide, file]);
  };
  const handleVideoUploader = (acceptedFiles) => {
    const file = acceptedFiles[0];

    setFrontSideVideo([...frontVideoPreview, previewImage(file)]);
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
      }
    } catch (error) { }
  };
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
        res.data.map((values) => {
          if (userSProfileData?.sector_name == values?.sector_name) {
            setSectorId(values.id);
            setImgIcon(`${ApiConfig.imagGet}${values.logo}`);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };


  useMount(() => {
    a11yChecker();
  });
  useEffect(() => {
    if (uploadData?.length == 0) {
      handleClickStart();
    }
  }, []);
  const handleClickStart = (event) => {
    // event.preventDefault();


  };

  const handleImageSelect = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setProfileData(file);
      handleProfilePicSubmit(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileData(profilePic);
    }
  };

  const handleProfilePicSubmit = async (values) => {
    setLoader(true);
    try {
      const formData = new FormData();
      if (profileData) {
        formData.append(`image`, values);
      }

      const res = await Axios.put(`${ApiConfig.editprofilephotoAdmin}?user_id=${location.state.userId}`, formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("You are successfully updated profile logo");
        setLoader(false);
        getUserProfileData();
      }
    } catch (error) {
      setLoader(false);
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Something went wrong please try again later.");
      }
    }
  };




  return (
    <Box className={classes.headbox}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="flexBox">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {uploadData?.length > 0 ? (
                <>
                  <IoMdArrowBack
                    style={{ fontSize: "35px", cursor: "pointer" }}
                    onClick={() => {
                      setSubmit(false)
                    }}
                  />
                  <Typography className="title">
                    Revise Company Yard Sign Here
                  </Typography>
                </>
              ) : (
                <Typography className="title">
                  Create Your Company Yard Sign Here{" "}
                </Typography>
              )}
              <IoInformationCircle
                style={{
                  color: "#D19A1D",
                  cursor: "pointer",
                  fontSize: "45px",
                }}
                onClick={handleClickStart}
              />
            </div>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box className="backGroundCard">
            <Box className={classes.positionBox}>
              <div style={{ height: "300px" }}>
                <MyServicesMap
                  type="UploadServices"
                  ref={childRef}
                  listItems={listItems}
                  imgIcon={imgIcon}
                  selectItem={selectItem}
                  handleLatAndLog={handleLatAndLog}
                  setOpenLogo={setOpenLogo}
                // CsvFileDataWithLatLog={CsvFileDataWithLatLog}
                />
                {openLogo && (
                  <Box className="openBoxTag">
                    <div>
                      <Typography
                        className="body"
                        textAlign={"center"}
                        style={{ lineHeight: "28px" }}
                      >
                        {user?.profile?.user_info?.company_name || "--"}
                      </Typography>
                      <img
                        src={
                          profilePic
                            ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                              profilePic == `${ApiConfig.imagGet}/media/None`
                              ? "/images/newStatic.jpg"
                              : profilePic
                            : "/images/newStatic.jpg"
                        }
                        alt=""
                        style={{
                          width: "-webkit-fill-available",
                          borderRadius: "8px",
                          margin: "8px 0",
                          height: "135px",
                        }}
                      />
                      <Button
                        onClick={() => {
                          setOpenLogo(false);
                        }}
                        className="buttonCss"
                      >
                        Contact Now
                      </Button>
                    </div>
                  </Box>
                )}
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

            <div style={{ width: "-webkit-fill-available" }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    className="manageCssResponsiveness">
                    <div
                      style={{
                        background: "#ECF3F2",
                        padding: "5px",
                        borderRadius: "8px",
                      }}
                    >
                      <Carousel
                        style={{
                          maxHeight: "140px",
                          width: "-webkit-fill-available",
                        }}
                        duration={600}
                        animation="slide"
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
                        {consumerInfoData?.map((item, i) => (
                          <div
                            key={i}
                            style={{ maxHeight: "180px", width: "auto" }}
                          >
                            <img
                              src={item.file}
                              alt={`carousel-item-${i}`}
                              style={{
                                height: "140px",
                                width: "auto",
                                display: "block",
                                margin: "0 auto",
                              }}
                            />
                          </div>
                        ))}
                      </Carousel>
                      <div style={{ marginTop: "5px" }}>
                        <Typography className="fenceTitle">
                          {"Upload Company Yard Sign 'Slider' Images"}
                        </Typography>
                        {/* <Typography className="fence">
                          {"Upload Company 'Slider' Images"}
                        </Typography> */}
                      </div>
                    </div>

                    <div
                      className="innerScrollDiv">
                      <div className="imgvideoList">
                        {consumerInfoData?.map((item, i) => {
                          return (
                            <img
                              src={item.file}
                              alt=""
                              style={{
                                height: "140px",
                                width: "180px",
                                borderRadius: "12px",
                              }}
                            />
                          );
                        })}{" "}
                      </div>{" "}
                      <Typography className="fenceTitle">
                        {"Upload Additional Images and Video "}
                      </Typography>
                    </div>
                    <div
                      style={{
                        background: "#ECF3F2",
                        padding: "10px",
                        borderRadius: "16px",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={
                          profilePic
                            ? profilePic == `${ApiConfig.imagGet}/media/null` ||
                              profilePic == `${ApiConfig.imagGet}/media/None`
                              ? "/images/yourlogoupdated.svg"
                              : profilePic
                            : "/images/yourlogoupdated.svg"
                        }
                        alt=""
                        style={{
                          width: "-webkit-fill-available",
                          borderRadius: "8px",
                          margin: "8px 0",
                          maxHeight: "100px",
                          maxWidth: "180px",
                        }}
                      />
                      <div className={classes.editBox}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple="false"
                          className={classes.editInput}
                          onChange={(e) => handleImageSelect(e)}
                        />
                        <Button className={`${classes.Explore2} step4`}>
                          Upload Logo Image
                        </Button>
                      </div>
                      <Button className="buttonCss2">
                        <a
                          href="https://www.brandcrowd.com/maker/tag/house"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#007bff" }}
                        >
                          Don't Have a Logo?
                        </a>
                      </Button>
                    </div>
                  </Box>
                </Grid>
                {/* <Grid item xs={12}>
                  <Box
                    style={{
                      textAlign: "center", // Centering vertically
                      border: "1px solid black", // Example border style
                      padding: "10px", // Example padding
                      maxWidth: "350px",
                      borderRadius: "10px",
                      margin: "auto",
                    }}
                  >
                    <Typography className="fenceTitle">
                      {"Upload 'Best' Company Images and Info Videos"}
                    </Typography>
                  </Box>
                </Grid> */}

                <Grid xs={12} sm={6} item className={classes.firstGrid}>
                  <div style={{ width: "-webkit-fill-available" }}>
                    <Typography
                      className={classes.LoginlabelSub}
                      style={{ marginBottom: "7px" }}
                    >
                      {"Industry "}
                      <span style={{ color: "#FE3B3B" }}>*</span>
                    </Typography>
                    <FormControl
                      className={classes.TextBoxFormControl}
                      fullWidth
                      variant="outlined"
                    >
                      <Select
                        margin="dense"
                        variant="outlined"
                        displayEmpty
                        disabled={isloading}
                        value={selectedCategory}
                        InputProps={{
                          className: classes.TextBox,
                        }}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                        }}
                      >
                        <MenuItem
                          value=""
                          disabled
                          style={{
                            fontSize: "12px",
                            opacity: "0.5 !important",
                          }}
                        >
                          Select Industry
                        </MenuItem>
                        {categoryList?.map((data) => {
                          return (
                            <MenuItem
                              value={data?.category_name}
                              style={{ fontSize: "12px" }}
                              onClick={() => {
                                getSectorData(data.id);
                                setSelectedCategoryId(data.id);
                              }}
                            >
                              {data?.category_name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
                <Grid xs={12} sm={6} item className={classes.firstGrid}>
                  <div style={{ width: "-webkit-fill-available" }}>
                    <Typography
                      className={classes.LoginlabelSub}
                      style={{ marginBottom: "7px" }}
                    >
                      {"Sector"}
                      <span style={{ color: "#FE3B3B" }}>*</span>
                    </Typography>
                    <FormControl
                      className={classes.TextBoxFormControl}
                      fullWidth
                      variant="outlined"
                    >
                      <Select
                        margin="dense"
                        variant="outlined"
                        displayEmpty
                        disabled={isloading}
                        value={selectItem}
                        InputProps={{
                          className: classes.TextBox,
                        }}
                        onChange={(e) => {
                          setSelectItem(e.target.value);
                        }}
                      >
                        <MenuItem value="">Select sector</MenuItem>
                        {sectorList?.map((data) => {
                          return (
                            <MenuItem
                              value={data?.sector_name}
                              style={{ fontSize: "12px" }}
                              onClick={() => {
                                setImgIcon(`${ApiConfig.imagGet}${data.logo}`);
                                setSectorId(data.id);
                              }}
                            >
                              {data?.sector_name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
              </Grid>
            </div>
            <Box className={classes.mainBox}>
              <Box
                className={`${classes.imageBox} step1`}
                style={{ width: "-webkit-fill-available" }}
                id="step1"
              >
                <div>
                  <Typography className="labelTitle">
                    Upload Company 'SLIDER' Images Here{" "}
                    <span style={{ color: "#FE3B3B" }}>*</span>
                  </Typography>
                  <CustomDropZone
                    setSide={handleFrontSideChange}
                    frontImagePreview={frontImagePreview}
                    setBase64={(items) => {
                      setFrontImagePreview([...frontImagePreview, items]);
                    }}
                    acceptedFileTypes={acceptedFileTypes}
                    typeFormate="photo"
                    loaderView={loaderView}
                  />
                </div>


                {loaderView ? (
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: "15px",
                    }}
                  >
                    <div class="three-body">
                      <div class="three-body__dot"></div>
                      <div class="three-body__dot"></div>
                      <div class="three-body__dot"></div>
                    </div>
                  </Box>
                ) : (
                  <Box className="imageFlex">
                    {frontImagePreview.map((values, index) => {
                      return (
                        <div className="iconImageDiv">
                          <img src={values} alt="" className="imagesList" />
                          <img
                            src="images/XCircle.svg"
                            alt=""
                            className="iconImage"
                            onClick={() => {
                              setFrontImagePreview((prevState) =>
                                prevState.filter((word, i) => i !== index)
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </Box>
                )}
              </Box>
              <Box
                className={`${classes.imageBox} step2`}
                style={{ width: "-webkit-fill-available" }}
                id="step2"
              >
                <div>
                  <Typography className="labelTitle">
                    Upload Additional Images and Video &nbsp;
                    <span style={{ color: "#FE3B3B" }}>*</span>
                    <span className={classes.handlespace}> &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;</span>

                  </Typography>
                  <CustomDropZone
                    setSide={handleVideoUploader}
                    frontImagePreview={frontVideoPreview}
                    disabled={disabled}
                    setBase64={(items) => {
                      setFrontVideoPreview([...frontVideoPreview, items]);
                    }}
                    acceptedFileTypes={acceptedFileTypesVideo}
                    typeFormate="video"
                    loaderView={loaderViewVideo}
                  />
                </div>
                {loaderViewVideo ? (
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: "15px",
                    }}
                  >
                    <div class="three-body">
                      <div class="three-body__dot"></div>
                      <div class="three-body__dot"></div>
                      <div class="three-body__dot"></div>
                    </div>
                  </Box>
                ) : (
                  <Box className="imageFlex">
                    {frontVideoPreview.map((values, index) => {
                      const getMimeTypeFromBase64 = values?.substring(
                        5,
                        values.indexOf(";base64")
                      );

                      return (
                        <div className="iconImageDiv">
                          {getMimeTypeFromBase64 === "image/png" ||
                            getMimeTypeFromBase64 === "image/jpg" ||
                            getMimeTypeFromBase64 === "image/jpeg" ||
                            getMimeTypeFromBase64 === "image/webp" ? (
                            <img src={values} alt="" className="imagesList" />
                          ) : (
                            <video
                              controls
                              className="imagesList"
                              style={{ width: "140px" }}
                            >
                              <source
                                src={values}
                                type={getMimeTypeFromBase64}
                              />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <img
                            src="images/XCircle.svg"
                            alt=""
                            className="iconImage"
                            onClick={() => {
                              setFrontVideoPreview((prevState) =>
                                prevState.filter((word, i) => i !== index)
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box>
            <div className={`${classes.checkDiv} step3`}>
              <Checkbox
                type="checkbox"
                name="check"
                onChange={() => {
                  setChecked((prevState) => !prevState);
                }}
                value={checked}
                checked={checked}
                style={{ width: "20px", height: "20px" }}
              />
              <Typography className={classes.alreadyAccount}>
                By clicking you agree to the{" "}
                <span
                  onClick={() => {
                    window.open("/terms&condition", "_blank");
                  }}
                  className={classes.newbox}
                >
                  Terms & Condition
                </span>{" "}
                and{" "}
                <span
                  onClick={() => {
                    window.open("/posting-rules", "_blank");
                  }}
                  className={classes.newbox}
                >
                  Posting Rules.
                </span>
              </Typography>
            </div>
            <Box className={`${classes.twobtnBox}`}>
              {/* <Button className={classes.transButton}>Add Another</Button> */}
              <Button
                className={`${classes.Explore} step5`}
                disabled={isloading || loaderView || loaderViewVideo}
                onClick={() => {

                  handleFormSubmit();

                }}
              >
                Submit {isloading && <ButtonCircularProgress />}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
