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
import CustomDropZone from "./UploadBox";
import ButtonCircularProgress from "src/component/ButtonCircularProgress";
import MyServicesMap from "src/views/pages/dashBoard/map/NewUploadServicesMap";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { UserContext } from "src/context/User";
import { useNavigate } from "react-router-dom";
import Joyride, { STATUS } from "react-joyride";
import { IoMdArrowBack } from "react-icons/io";
import a11yChecker from "a11y-checker";
import { logGroup } from "./Joyride/JoyRideHelperFunction";
import { useMount, useSetState } from "react-use";
import { IoInformationCircle } from "react-icons/io5";
import Carousel from "react-material-ui-carousel";

export default function UploadServices({
  classes,
  handleCallBack,
  handleSelect,
  uploadData,
  setSubmit,
  getUploadFileData,
  uploadImageVideo,
}) {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const childRef = useRef();
  const [isloading, setLoader] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [latLon, setLatLon] = useState("");
  const [disabledVideo, setDisabledVideo] = useState(false);

  const [selectItem, setSelectItem] = useState(
    user?.profile?.profile?.sector_name || ""
  );
  const [checked, setChecked] = useState(false);
  const [imgIcon, setImgIcon] = useState("images/icons/defaultIconLogo.svg");
  const [sectorId, setSectorId] = useState();

  const [profilePic, setProfilePic] = useState("/images/newStatic.jpg");
  useEffect(() => {
    setProfilePic(
      user?.profile?.user_info?.image
        ? `${ApiConfig.imagGet}${user?.profile?.user_info?.image}`
        : "/images/newStatic.jpg"
    );
  }, [user?.profile?.user_info]);
  const [profileData, setProfileData] = useState(profilePic);
  const [frontImagePreview, setFrontImagePreview] = useState([]);
  const [frontSide, setFrontSide] = useState([]);
  const [frontVideoPreview, setFrontVideoPreview] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [frontSideVideo, setFrontSideVideo] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [loaderView, setloaderView] = useState(true);
  const [loaderViewVideo, setloaderViewVideo] = useState(true);
  const [openLogo, setOpenLogo] = useState(false);
  const [sectorList, setSectorList] = useState([]);
  const [mergedList, setMergedList] = useState([]);

  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
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
  useEffect(() => {
    if (user?.profile?.profile?.category_name) {
      getSectorData(user?.profile?.profile?.category_id);
      setSelectedCategoryId(user?.profile?.profile?.category_id);
      setSelectedCategory(user?.profile?.profile?.category_name);
      setSelectItem(user?.profile?.profile?.sector_name);
    }
  }, [user?.profile?.profile?.category_name]);
  // image
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

    if (uploadImageVideo) {
      const getImagePromises = uploadImageVideo
        .map((value, index) => {
          if (value?.file != null) {
            return getImageAsBase64(`${ApiConfig.imagGet}${value.file}`);
          } else {
            return null; // Returning null for images with null or undefined files
          }
        })
        .filter((promise) => promise !== null); // Filtering out null promises

      Promise.all(getImagePromises)
        .then((base64Images) => {
          setFrontImagePreview(base64Images);
          setloaderView(false);
        })
        .catch((error) => {
          console.error("Error converting images to base64:", error);
          setloaderView(false);
        });
    } else {
      console.log("No uploadImageVideo provided.");
    }
  }, [uploadImageVideo]);

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

    if (uploadImageVideo) {
      const getImagePromises = uploadImageVideo
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
      console.log("No uploadImageVideo provided.");
    }
  }, [uploadImageVideo]);

  const handleLatAndLog = (lat, long) => {
    setLongitude(long || NaN);
    setLatitude(lat || NaN);
  };

  useEffect(() => {
    if (user?.profile?.user_info?.company_address) {
      handleListLocation(user?.profile?.user_info?.company_address);
    }
  }, [user]);

  const handleListLocation = async (values) => {
    try {
      const response = await fetch(
        `${ApiConfig.mapboxUrl}${54810}.json?access_token=${ApiConfig.MAPBOXACCESS_TOKEN}`
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
          formData.append(`file`, blob, `image${index}.png`);
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
            formData.append(`video_file`, blob, `video${index}.mp4`);
          } else {
            formData.append(`video_file`, blob, `image${index}.png`);
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
        const res = await Axios.post(ApiConfig.uploadfile, formData, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          getUploadFileData();
          handleCallBack();
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
          formData.append(`file`, blob, `image${index}.png`);
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
            formData.append(`video_file`, blob, `video${index}.mp4`);
          } else {
            formData.append(`video_file`, blob, `image${index}.png`);
          }
        });
        formData.append("sector", parseInt(sectorId));  //bug
        formData.append("category_id", selectedCategoryId);
        formData.append("category_name", selectedCategory);
        formData.append("sector_name", selectItem);
        formData.append("sector_id", parseInt(sectorId));
        const res = await Axios.post(ApiConfig.replaceuploaded, formData, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 200 || res.status === 201) {
          toast.success("You have successfully uploaded Post Yard Sign");
          handleCallBack();
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
    getSectorData()
  }, []);

  useEffect(() => {
    if (categoryList.length && sectorList.length) {
      const mergedData = sectorList.map(sector => {
        const category = categoryList.find(cat => cat.id === sector.category_id);
        return {
          ...sector,
          category_name: category?.category_name
        };
      });
      
      setMergedList(mergedData);
    }
  }, [categoryList, sectorList]);

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
    } catch (error) {}
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
        res.data.map((values) => {
          if (user?.profile?.profile?.sector_name == values?.sector_name) {
            setSectorId(values.id);
            setImgIcon(`${ApiConfig.imagGet}${values.logo}`);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  //joyRide

  const [{ run, steps }, setState] = useSetState({
    run: false,
    steps: [
      {
        content: (
          <>
            <video
              autoPlay
              loop
              src="images/video/Example.mp4"
              style={{ width: "100%" }}
            ></video>{" "}
            <h4 style={{ textAlign: "left" }}>Build Company Yard Sign:</h4>
            <h4 style={{ textAlign: "left" }}>
              <p>{`Step 1)`}</p>
              <p>{`A) Choose Company Industry (Exterior, Interior or AEC).`}</p>
              <p>{`B) Choose Industry Sector from the Pull Down List.`}</p>
            </h4>
          </>
        ),
        locale: { skip: <strong aria-label="skip">Skip</strong> },
        placement: "center",
        target: "body",
      },
      {
        content: (
          <h4 style={{ textAlign: "left" }}>
            {`Step 2) Upload 3 Company 'Slider' Images`}
          </h4>
        ),
        floaterProps: {
          disableAnimation: true,
        },
        spotlightPadding: 20,
        target: ".step1",
      },
      {
        content: (
          <h4 style={{ textAlign: "left" }}>
            {` Step 3) Upload 3 Additional Company Images or Videos`}
          </h4>
        ),
        placement: "bottom",
        styles: {
          options: {
            width: 300,
          },
        },
        target: ".step2",
        // title: "Our projects",
      },

      {
        content: (
          <>
            <h4>{`Step 4) Upload Company Logo or Image`}</h4>
            <Button style={{
              background: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "13px",
              padding: "10px 10px",
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
              margin: "4px 1px",
              cursor: "pointer",
            }}>
              <a
                href="https://www.brandcrowd.com/maker/tag/house"
                target="_blank"
                rel="noopener noreferrer"
                style={{color:"#007bff"}}
              >
                Don't have a logo?
              </a>
            </Button>
          </>
        ),
        placement: "left",
        target: ".step4",
        title: "Submit ",
      },
      {
        content: <h4>{`Step 5) Terms and Conditions `}</h4>,
        placement: "top",
        target: ".step3",
        title: "Accept ",
      },
      {
        content: (
          <h4>
            Creates Your Company Account, Dashboard and Yard Sign Go to
            Subscriptions To Post Your Signs!
          </h4>
        ),
        placement: "left",
        target: ".step5",
        title: "Submit ",
      },
    ],
  });

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

    setState({
      run: true,
    });
  };

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setState({ run: false });
    }

    logGroup(type, data);
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

      const res = await Axios.post(ApiConfig.editprofilephoto, formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("You are successfully updated profile logo");
        setLoader(false);
        user.getViewMyProfile();
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
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        styles={{
          options: {
            arrowColor: "#D19A1D",
            primaryColor: "#D19A1D",
            textColor: "#172624",
            zIndex: 1000,
          },
        }}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="flexBox">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {uploadData?.length > 0 ? (
                <>
                  <IoMdArrowBack
                    style={{ fontSize: "35px", cursor: "pointer" }}
                    onClick={() => {
                      setSubmit(true);
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
                  className="manageCssResponsiveness"
                   
                  >
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
                    className="innerScrollDiv"
                    
                    >
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
                          style={{color:"#007bff"}}
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
                 {uploadData?.length > 0 ? "":
              
                <Grid xs={12} sm={6} item className={classes.firstGrid}>
                  <div style={{ width: "-webkit-fill-available" }}>
                    <Typography
                      className={classes.LoginlabelSub}
                      style={{ marginBottom: "7px" }}
                    >
                      {"Service "}
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
                          Select Service
                        </MenuItem>
                        {mergedList?.map((data) => {
                          return (
                            <MenuItem
                              value={data?.sector_name}
                              style={{ fontSize: "12px" }}
                              onClick={() => {
                                setSelectedCategoryId(data.id);
                                setSelectItem(data.sector_name)
                                setSectorId(data.id);
                                setImgIcon(`${ApiConfig.imagGet}${data.logo}`);
                                
                              }}
                            >
                              {data?.category_name} | {data?.sector_name}
                            </MenuItem>
                          );
                        })}
                      </Select>

                    </FormControl>
                  </div>
                </Grid>}
              
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
                      paddingTop:"15px",  
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
                    &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
                      paddingTop:"15px", }}
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
                  if (uploadData?.length > 0) {
                    handleUploadSub();
                  } else {
                    handleFormSubmit();
                  }
                }}
              >
                Submit {isloading && <ButtonCircularProgress />}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
