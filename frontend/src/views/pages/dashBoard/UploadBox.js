import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Dropzone from "react-dropzone";
import { convertToBase64 } from "src/utils/index";
import { ToastContainer, toast } from "react-toastify";
const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "1px dashed rgba(177,191,208)",
    background: "#FFF",
  },
  icon: {},
  drag: {
    color: "rgba(33, 33, 33, 0.65)",
    textAlign: "center",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "24px",
    margin: "30px 0 10px 0",
    "& span": {
      color: "#0B1426",
    },
  },
  format: {
    color: "#676767",
    textAlign: "center",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "18px",
  },
});

const UploadBox = ({
  setSide,
  frontImagePreview,
  setBase64,
  acceptedFileTypes,
  typeFormate,
  loaderView
}) => {
  const classes = useStyles();

  const handleDrop = async (acceptedFiles, rejectedFiles) => {
   
    if (frontImagePreview?.length > 2) {
      toast.error(`You can only upload up to 3 files at a time.`);
    } else {
      const file = acceptedFiles[0];
      if (file?.size > 20 * 1024 * 1024) {
        toast.error(`Maximum file size allowed is 20 MB.`);
      } else if (acceptedFileTypes?.includes(file?.type)) {
        const imageBase64 = await convertToBase64(file);
        setBase64(imageBase64);
      } else {
        toast.error(
          `Unsupported file format: ${
            file?.type
          }. Please upload files in PNG, JPG, JPEG, WEBP${
            typeFormate === "video" ? ", MP4" : ""
          } format.`
        );
      }
    }
  };

  return (
    <>
      {/* <ToastContainer /> */}
      <Dropzone onDrop={handleDrop} disabled={loaderView}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className={classes.container}>
            <input {...getInputProps()} />
            <div>
              <img
                src="images/UploadIcon.svg"
                alt="upload"
                style={{ width: "100%", height: "160px" }}
              />
            </div>
            {/* <p className={classes.drag}>
              1 Drop your image here, or <span>Browse</span>
            </p>
            <p className={classes.format}>
              Supports: PNG, JPG, JPEG, WEBP{typeFormate == "video" && ", MP4"}
            </p> */}
            {/* <p className={classes.format}>Max 3</p> */}
          </div>
        )}
      </Dropzone>
    </>
  );
};

export default UploadBox;
