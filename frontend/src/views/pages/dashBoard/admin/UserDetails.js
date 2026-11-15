import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { makeStyles, styled } from "@mui/styles";
import React, { useContext, useEffect, useRef, useState } from "react";
import Page from "src/component/Page";
import { UserContext } from "src/context/User";
import Axios from "axios";
import ApiConfig from "src/config/APICongig";
import { IoMdArrowBack } from "react-icons/io";
import { MdVisibility } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";

const StyledTableCell = styled(TableCell, { name: "StyledTableCell" })(
  ({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: "#D19A1D",
      color: "#000",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  })
);

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#fff",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const rows = [
  { name: "Nilesh", amount: "100", status: "Active", yards: "25" },
  { name: "Aman", amount: "20", status: "Active", yards: "50" },
  { name: "Gyan", amount: "200", status: "Active", yards: "250" },
  { name: "Kunam", amount: "300", status: "Active", yards: "500" },
  { name: "Shriti", amount: "10", status: "Active", yards: "25" },
  { name: "Kunal", amount: "100", status: "Active", yards: "25" },
  { name: "Suhel", amount: "20", status: "Active", yards: "50" },
  { name: "Madhu", amount: "200", status: "Active", yards: "250" },
];

const useStyles = makeStyles((theme) => ({
  headbox: {
    padding: "42px 80px 20px 80px",
    "@media (max-width: 920px)": {
      padding: "30px 40px 20px 40px",
    },
    "@media (max-width: 599px)": {
      padding: "20px 20px 20px 20px",
    },
    "& .title": {
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
    "& .subTitle": {
      color: "#172624 !important",
      fontFamily: "Big Shoulders Display, sans-serif !important",
      fontSize: "28px !important",
      fontStyle: "normal !important",
      fontWeight: "800 !important",
      lineHeight: "40px !important",
      textTransform: "uppercase !important",
      "@media (max-width: 920px)": {
        fontSize: "26px !important",
        lineHeight: "44px !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "22px !important",
        lineHeight: "35px !important",
        marginBottom: "10px !important",
      },
    },
    "& .flexDiv": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    "& .newColorButtoncss": {
      fontFamily: "'Noto Sans', sans-serif ",
      borderRadius: "6px ",
      fontStyle: "normal ",
      fontWeight: "600 ",
      fontSize: "15.2381px ",
      lineHeight: "18px ",
      height: "48px ",
      color: "#102D0C ",
      cursor: "pointer ",
      padding: "16px 20px ",
      border: "1px solid #D19A1D ",
      background: "#D19A1D ",
      "&:hover": {
        color: "#102D0C !important",
        background: "#D19A1D !important",
      },
      "@media (max-width: 599px)": {
        fontSize: "13px !important",
        lineHeight: "13.5px !important",
      },
    },
    "& .iconImage": {
      position: "absolute",
      top: "-8px",
      right: "-12px",
    },
    "& .iconImageDiv": {
      position: "relative",
      maxWidth: "200px",
    },
    "& .backgroundBox": {
      background: "#EEF1EE !important",
      padding: "15px 8px",
      borderRadius: "15px",
    },
    "& .checkBoxDiv": {
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    "& .checkMainBox": {
      maxHeight: "300px",
      overflow: "auto",
    },
  },
  LoginTextBox: {
    borderRadius: "24px",
    background: " #fff",
    fontSize: "16px",
    color: "black",
    // marginTop: "19px",
    width: "-webkit-fill-available",
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.50) !important",
      fontFamily: "'Noto Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "125%",
    },
    "& .MuiInputBase-input": {
      color: "black !important",
      fontFamily: "'Noto Sans', sans-serif !important",
      fontSize: "16px",
      lineHeight: "125%",
      fontWeight: "400",
    },
    "& .MuiOutlinedInput-inputMarginDense": {
      padding: "12px 24px !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "12px 24px !important",
    },
  },
  CardText: {
    color: "#172624 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "16px !important",
    fontStyle: "normal !important",
    fontWeight: "500 !important",
    lineHeight: "20px !important",
    textAlign: "start",
    textTransform: "uppercase !important",
    "@media (max-width: 380px)": {
      wordBreak: "break-all",
    },
  },
  Logintextfiled: {
    color: "#fff !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: "12px",
    lineHeight: "24px",
    borderRadius: "10px",
    background: "#fff",
  },
  loaderCss: {
    border: "5px solid #D19A1D",
    borderTop: "5px solid transparent",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    animation: "$spin 1s linear infinite",
    margin: "auto",
  },
  TextBoxFormControl: {
    "& .MuiOutlinedInput-root": {
      background: "#fff !important",
      borderRadius: "10px !important",
    },
    "& .MuiOutlinedInput-input": {
      padding: "18px 16px !important",
    },
  },
  LoginlabelSub: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "18px !important",
    fontStyle: "normal !important",
    fontWeight: "500 !important",
    lineHeight: "150% !important",
    marginBottom: "10px !important",
  },
  Loginlabelall: {
    color: "#000000 !important",
    fontFamily: "'Noto Sans', sans-serif !important",
    fontSize: "14px !important",
    fontStyle: "normal !important",
    fontWeight: "400 !important",
    lineHeight: "125% !important",
    marginBottom: "10px !important",
    textAlign: "start !important",
  },
  subMain: {
    fontFamily: "'Noto Sans', sans-serif",
    fontStyle: "normal",
    fontWeight: "600",
    fontSize: "24px",
    lineHeight: "26px",
    color: "#000",
    marginBottom: "20px",
  },
  iconcss: {
    fontSize: "35px",
    cursor: "pointer",
  },
  editBox: {
    position: "relative",
  },
  editInput: {
    position: "absolute",
    top: "0",
    zIndex: "1",
    width: "-webkit-fill-available",
    overflow: "hidden",
    height: "100%",
    opacity: "0",
  },
  Explore: {
    fontFamily: "'Noto Sans', sans-serif !important",
    borderRadius: "6px !important",
    fontStyle: "normal",
    fontWeight: "700 !important",
    fontSize: "15.2381px !important",
    lineHeight: "18px !important",
    color: "#fff !important",
    cursor: "pointer",
    padding: "12px 24px !important",
    background: "#172624 !important",
    minHeight: "56px !important",
    minWidth: "207px !important",
    "&:hover": {
      color: "#fff !important",
      background: "#172624 !important",
    },
    "@media (max-width: 540px)": {
      width: "-webkit-fill-available !important",
      marginTop: "20px !important",
    },
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

export default function AddServices() {
  const classes = useStyles();
  const user = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [pagesCount, setPagesCount] = useState(1);
  const [page, setPage] = useState(1);
  const [sectorList, setSectorList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [deleteSectorList, setDeleteSectorList] = useState({ sector_id: [] });
  const [isloading, setLoader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [enterCategory, setEnterCategory] = useState("");
  const [enterSector, setEnterSector] = useState("");
  const [openPopUp, setOpenPopup] = useState(false);
  const [openSectorPopUp, setOpenSectorPopUp] = useState(false);
  const [openDeletePopUp, setOpenDeletePopUp] = useState(false);
  const [editEnable, setEditEnable] = useState(false);
  const [imageIconData, setImageIconData] = useState("");
  const [imageIconView, setImageIconView] = useState("");
  const [editSelectedSector, setEditSelectedSector] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editSelectedSectorID, setEditSelectedSectorID] = useState("");
  const navigate = useNavigate();
  const handleChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    if (Object.keys(user.profile).length > 0) {
      if (!user?.profile?.user_type?.is_admin) {
        toast.error("Only Admin can access this page");
        navigate("/login");
      } else {
        setIsAuthorized(true);
      }
    }
    setIsCheckingAuth(false); 
  }, [user, navigate]);
  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await Axios.post(
        ApiConfig.userinfosearch,
        {
          search_term: search,
          limit: 10,
          page_number: page,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setUserData(response?.data?.data || []);
        setPagesCount(response?.data?.total_pages || 1);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error.response);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [search, page]);

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
        setSelectedCategory(res?.data[0]?.category_name);
        setSelectedCategoryId(res?.data[0]?.id);
        getSectorData(res?.data[0]?.id);
      }
    } catch (error) {
      console.log(error.response);
    }
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
        setSectorList([
          { category_name: selectedCategory, category_data: res.data },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleIndustrySubmit = async (values) => {
    if (editEnable) {
      if (enterCategory) {
        try {
          setLoader(true);
          const res = await Axios({
            method: "PUT",
            url: ApiConfig.newcategory,
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            data: {
              category: enterCategory,
              id:selectedCategoryId
            },
          });
          if (res.status === 200 || res.status === 201) {
            setLoader(false);
            getCategoryData();
            toast.success("New Industry Added successfully.");
            setOpenPopup(false);
            setEnterCategory("");
            setEditEnable(false);
          } else {
            setLoader(false);
            toast.warn(res?.data?.responseMessage);
          }
        } catch (error) {
          if("Request failed with Status code 400"){
            toast.error("This is a default category. You cannot update this!!");
          }else{
            toast.error( "Something went wrong please try again later.");
          }
          setLoader(false);
          
        }
      } else {
        toast.error("Please Enter A Industry Name.");
      }
    } else {
      if (enterCategory) {
        try {
          setLoader(true);
          const res = await Axios({
            method: "POST",
            url: ApiConfig.newcategory,
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
            data: {
              category: enterCategory,
            },
          });
          if (res.status === 200 || res.status === 201) {
            setLoader(false);
            getCategoryData();
            toast.success("New Industry Added successfully.");
            setOpenPopup(false);
            setEnterCategory("");
          } else {
            setLoader(false);
            toast.warn(res?.data?.responseMessage);
          }
        } catch (error) {
          if("Request failed with Status code 400"){
            toast.error("This Sector is already in use and cannot be deleted!!");
          }else{
            toast.error( "Something went wrong please try again later.");
          }
          setLoader(false);
          // if (error?.response?.data) {
          //   toast.error(error.response?.data);
          // } else {
          toast.error("Something went wrong please try again later.");
          // }
        }
      } else {
        toast.error("Please Enter A Industry Name.");
      }
    }
  };
  const handleSectorSubmit = async (values) => {
    if (editEnable) {
      if (enterSector) {
        try {
          setLoader(true);
          const formData = new FormData();
          formData.append("sector_id", editSelectedSectorID);
          formData.append("sector", enterSector);
          if(imageIconData){
            formData.append("logo", imageIconData);
          }
          const res = await Axios.put(ApiConfig.newsector, formData, {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          });
          if (res.status === 200 || res.status === 201) {
            setLoader(false);
            getCategoryData();
            toast.success("Sector Edited successfully.");
            setOpenSectorPopUp(false);
            setEnterSector("");
            setImageIconView("");
            setEditEnable(false);
            setEditSelectedSector("");
            setEditSelectedSectorID("");
          } else {
            setLoader(false);
            toast.warn(res?.data?.responseMessage);
          }
        } catch (error) {
          if("Request failed with Status code 400"){
            toast.error("This is a default sector. You cannot update this sector!!");
          }else{
            toast.error( "Something went wrong please try again later.");
          }
          setLoader(false);
         
        }
      } else {
        toast.error("Please Enter A Sector Name & upload a logo image.");
      }
    } else {
      if (enterSector && imageIconView) {
        try {
          setLoader(true);
          const formData = new FormData();
          formData.append("category_id", selectedCategoryId);
          formData.append("sector_name", enterSector);
          // formData.append("category", enterCategory);
          formData.append("image", imageIconData);
          const res = await Axios.post(ApiConfig.newsector, formData, {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          });
          if (res.status === 200 || res.status === 201) {
            setLoader(false);
            getCategoryData();
            toast.success("New Sector Added successfully.");
            setOpenSectorPopUp(false);
            setEnterSector("");
            setImageIconView("");
          } else {
            setLoader(false);
            toast.warn(res?.data?.responseMessage);
          }
        } catch (error) {
          // if("HTTP error! Status: 400"){
          //   toast.error("This Sector is already in use and cannot be deleted!!");
          // }else{
          //   toast.error( "Something went wrong please try again later.");
          // }
          setLoader(false);
          // if (error?.response?.data) {
          //   toast.error(error.response?.data);
          // } else {
          toast.error("Something went wrong please try again later.");
          // }
        }
      } else {
        toast.error("Please Enter A Sector Name & upload a logo image.");
      }
    }
  };
  const handleDeleteSubmit = async () => {
    if (deleteSectorList.sector_id?.length > 0) {
      try {
        setLoader(true);
        const token = localStorage.getItem("token");
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Token ${token}`);
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          sector_id: deleteSectorList.sector_id, // Send only the sector_ids array
        });

        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        const response = await fetch(ApiConfig.newsector, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.text();
     
        setLoader(false);
        getSectorData(selectedCategoryId);
        toast.success("Sector Deleted successfully.");
        setOpenDeletePopUp(false);
        setDeleteSectorList({ sector_id: [] });
      } catch (error) {
        if("HTTP error! Status: 400"){
          toast.error("This Sector is already in use and cannot be deleted!!");
        }else{
          toast.error( "Something went wrong please try again later.");
        }
        setLoader(false);
       
      }
    } else {
      toast.error("Please Select A Sector You Want Delete.");
    }
  };

  const handleImageSelect = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      setImageIconData(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageIconView(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCheckboxChange = (id) => (event) => {
    if (event.target.checked) {
      // Add the id to the state
      setDeleteSectorList((prevState) => ({
        sector_id: [...prevState.sector_id, id],
      }));
    } else {
      // Remove the id from the state
      setDeleteSectorList((prevState) => ({
        sector_id: prevState.sector_id.filter((sectorId) => sectorId !== id),
      }));
    }
  };

  if (isCheckingAuth) {
    return <div>Loading...</div>; 
  }

  if (!isAuthorized) {
    return null;
  }
  return (
    <Page title="AddServices">
      <Box className={classes.headbox}>
        <Grid container spacing={2} style={{ alignItems: "center" }}>
          <Grid item xs={12}>
            <Box className="flexDiv">
              <Box
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <IoMdArrowBack
                  style={{ fontSize: "35px", cursor: "pointer" }}
                  onClick={() => {
                    navigate("/add-services");
                  }}
                />

                <Typography className="title">User Management</Typography>
              </Box>
              <div>
                <TextField
                  placeholder="Search by user"
                  size="small"
                  variant="outlined"
                  id="inputID"
                  type="text"
                  value={search}
                  inputProps={{ maxLength: 256 }}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    className: classes.LoginTextBox,
                    endAdornment: (
                      <Box className={classes.passsec}>
                        <img src="images/search.svg" alt="" />
                      </Box>
                    ),
                  }}
                />
              </div>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box mt={2} width="100%">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow style={{ backgroundColor: "#D19A1D" }}>
                      <StyledTableCell align="center">User</StyledTableCell>
                      <StyledTableCell align="center">
                        No. of Yards
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Plan / Amount
                      </StyledTableCell>
                      <StyledTableCell align="center">Date</StyledTableCell>
                      <StyledTableCell align="center">Status</StyledTableCell>
                      <StyledTableCell align="center">View</StyledTableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {userData.map((row) => (
                      <StyledTableRow key={row.email}>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center" }}
                        >
                          {row.email || "--"}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center" }}
                        >
                          {row.feature_count || 0}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center" }}
                        >
                          {row.price || "NA"}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center" }}
                        >
                          {row?.expiry_date
                            ? moment(row?.expiry_date).format("ll")
                            : "NA"}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center" }}
                        >
                          {row.status == "active" ? "Active" : "Inactive"}
                        </StyledTableCell>
                        <StyledTableCell
                          align="center"
                          style={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => {
                            navigate("/handle-user-details", {
                              state: {
                                userId: row.user_id,
                                userName: row.user_name,
                              },
                            });
                          }}
                        >
                          <MdVisibility />
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box
              style={{
                float: "right",
                marginTop: "15px",
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >
              {isLoading && <div className={classes.loaderCss}></div>}
              <Stack spacing={2}>
                <Pagination
                  count={pagesCount}
                  page={page}
                  defaultPage={1}
                  onChange={handleChange}
                />
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="backgroundBox">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography className="subTitle">
                    Industry & Sector Management
                  </Typography>
                </Grid>
                <Grid xs={12} item className={classes.firstGrid}>
                  <Box className="flexDiv">
                    <div
                      style={{
                        width: "-webkit-fill-available",
                        maxWidth: "400px",
                      }}
                    >
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
                                  setEditEnable(false);
                                  setEditSelectedSector("");
                                  setEditSelectedSectorID("");
                                }}
                              >
                                {data?.category_name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </div>
                    <Button
                      onClick={() => {
                        setOpenPopup(true);
                      }}
                      className="newColorButtoncss"
                    >
                      Add New Industry
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                      <TableHead>
                        <TableRow style={{ backgroundColor: "#D19A1D" }}>
                          <StyledTableCell
                            align="center"
                            style={{ border: "1px solid rgb(0 0 0 / 20%)" }}
                          >
                            Industry
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            style={{ border: "1px solid rgb(0 0 0 / 20%)" }}
                          >
                            Sectors
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            style={{ border: "1px solid rgb(0 0 0 / 20%)" }}
                          >
                            Action
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {sectorList?.map((row, rowIndex) => (
                          <StyledTableRow key={rowIndex}>
                            <StyledTableCell
                              align="center"
                              style={{
                                textAlign: "center",
                                border: "1px solid rgb(0 0 0 / 20%)",
                              }}
                            >
                              {selectedCategory || "--"}
                              {editEnable && (
                                <span style={{ cursor: "pointer" }}>
                                  <MdEdit
                                    style={{ fontSize: "15px" }}
                                    onClick={() => {
                                      setOpenPopup(true);
                                      setEnterCategory(selectedCategory);
                                    }}
                                  />
                                </span>
                              )}
                            </StyledTableCell>
                            <StyledTableCell
                              align="start"
                              style={{
                                textAlign: "start",
                                alignItems: "center",
                                display: "grid",
                                justifyContent: "center",
                                border: "1px solid rgb(0 0 0 / 20%)",
                              }}
                            >
                              <ol>
                                {row?.category_data?.map(
                                  (value, valueIndex) => (
                                    <li
                                      key={valueIndex}
                                      style={{
                                        margin: "7px 0",
                                      }}
                                    >
                                      {value.sector_name || 0}
                                      {editEnable && (
                                        <span style={{ cursor: "pointer" }}>
                                          <MdEdit
                                            style={{ fontSize: "15px" }}
                                            onClick={() => {
                                              setEditSelectedSector(
                                                value.sector_name
                                              );
                                              setEditSelectedSectorID(value.id);
                                              setOpenSectorPopUp(true);
                                              setEnterSector(value.sector_name)
                                              setImageIconView(`${ApiConfig.imagGet}${value.logo}`)
                                            }}
                                          />
                                        </span>
                                      )}
                                    </li>
                                  )
                                )}
                              </ol>
                            </StyledTableCell>
                            <StyledTableCell
                              align="center"
                              style={{
                                textAlign: "center",
                                border: "1px solid rgb(0 0 0 / 20%)",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  justifyContent: "center",
                                  gap: "25px",
                                }}
                              >
                                <MdEdit
                                  className={classes.iconcss}
                                  onClick={() => {
                                    setEditEnable(!editEnable);
                                  }}
                                />
                                <MdAddCircleOutline
                                  className={classes.iconcss}
                                  onClick={() => {
                                    setOpenSectorPopUp(true);
                                    setEditEnable(false);
                                  }}
                                />
                                <MdDelete
                                  className={classes.iconcss}
                                  style={{ color: "red" }}
                                  onClick={() => {
                                    setOpenDeletePopUp(true);
                                    setEditEnable(false);
                                  }}
                                />
                              </div>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
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
                  {editEnable
                    ? `Editing Industry: [${selectedCategory || "--"}]`
                    : `Add New Industry`}
                </Typography>
                <Box mt={3}>
                  <Typography className={classes.Loginlabelall}>
                    Industry
                  </Typography>
                  <TextField
                    placeholder="Please Enter New Industry"
                    type="text"
                    variant="outlined"
                    fullWidth
                    id="inputID"
                    size="small"
                    inputProps={{ maxLength: 256 }}
                    value={enterCategory}
                    className={classes.LoginTextBox}
                    disabled={isloading}
                    onChange={(e) => {
                      setEnterCategory(e.target.value);
                    }}
                    InputProps={{
                      className: classes.Logintextfiled,
                    }}
                  />
                </Box>
              </Box>

              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Button
                  className="newColorButtoncss"
                  fullWidth
                  disabled={isloading}
                  onClick={() => {
                    handleIndustrySubmit();
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Dialog>
        )}
        {openSectorPopUp && (
          <Dialog
            open={openSectorPopUp}
            onClose={() => {
              setOpenSectorPopUp(false);
              setImageIconView("");
              setEditSelectedSector("");
              setEditSelectedSectorID("");
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
                      setOpenSectorPopUp(false);
                      setImageIconView("");
                      setEditSelectedSector("");
                      setEditSelectedSectorID("");
                    }}
                    style={{ cursor: "pointer", width: "30px" }}
                  />
                </div>
                <Typography className={classes.subMain}>
                  {editEnable
                    ? `Editing Sector: [${editSelectedSector || "--"}]`
                    : `Add New Sector under (${selectedCategory || "--"})`}
                </Typography>
                <Box mt={3}>
                  <Typography className={classes.Loginlabelall}>
                    Sector
                  </Typography>
                  <TextField
                    placeholder="Please Enter New Sector"
                    type="text"
                    variant="outlined"
                    fullWidth
                    id="inputID"
                    size="small"
                    inputProps={{ maxLength: 256 }}
                    value={enterSector}
                    className={classes.LoginTextBox}
                    disabled={isloading}
                    onChange={(e) => {
                      setEnterSector(e.target.value);
                    }}
                    InputProps={{
                      className: classes.Logintextfiled,
                    }}
                  />
                </Box>
                {imageIconView ? (
                  <Box
                    mt={2}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div className="iconImageDiv">
                      <img
                        src={imageIconView}
                        alt=""
                        style={{
                          width: "-webkit-fill-available",
                          borderRadius: "8px",
                          margin: "8px 0",
                          maxHeight: "100px",
                          maxWidth: "180px",
                        }}
                      />
                      <img
                        src="images/XCircle.svg"
                        alt="x"
                        className="iconImage"
                        onClick={() => {
                          setImageIconView("");
                        }}
                      />
                    </div>
                  </Box>
                ) : (
                  <Box className={classes.editBox} mt={2}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple="false"
                      className={classes.editInput}
                      onChange={(e) => handleImageSelect(e)}
                    />
                    <Button className={classes.Explore}>
                      Upload Logo Image
                    </Button>
                  </Box>
                )}
              </Box>

              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Button
                  className="newColorButtoncss"
                  fullWidth
                  disabled={isloading}
                  onClick={() => {
                    handleSectorSubmit();
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Dialog>
        )}
        {openDeletePopUp && (
          <Dialog
            open={openDeletePopUp}
            onClose={() => {
              setOpenDeletePopUp(false);
              setDeleteSectorList({ sector_id: [] });
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
                      setOpenDeletePopUp(false);
                      setDeleteSectorList({ sector_id: [] });
                    }}
                    style={{ cursor: "pointer", width: "30px" }}
                  />
                </div>
                <Typography className={classes.subMain}>
                  Select Industry / Sectors to Delete
                </Typography>
                <Box mt={3} className="checkMainBox">
                  {sectorList[0].category_data?.map((value) => {
                    return (
                      <div className="checkBoxDiv">
                        <Checkbox onChange={handleCheckboxChange(value.id)} />
                        <Typography className={classes.CardText}>
                          {value.sector_name}
                        </Typography>
                      </div>
                    );
                  })}
                </Box>
              </Box>

              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Button
                  className="newColorButtoncss"
                  fullWidth
                  disabled={isloading}
                  onClick={() => {
                    handleDeleteSubmit();
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Dialog>
        )}
      </Box>
    </Page>
  );
}
