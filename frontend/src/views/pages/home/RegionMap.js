import { Container, Typography, Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  regionMap: {
    display: "flex",
    justifyContent: "center",
    marginTop: "2%",
    marginBottom: "2%",
    "@media (max-width: 599px)": {
      flexDirection:"column !important"
    },

  },
  textSection:
  {
    display:"flex",
    flexDirection:"column",
    justifyContent:"center"
  },
  heading:
  {
    fontFamily: "Big Shoulders Display",
    fontSize: "35px",
    fontWeight: 700,    
  },
  subHeading:
  {
    fontFamily: "Big Shoulders Display",
    fontSize: "25px",
    fontWeight: 700,   
    marginLeft:"15%", 
    marginBottom:"1%",
  
  }  ,
  image: {
    maxWidth: "100%",
    height: "auto",
    display: "block",
    margin: "0 auto",
  },
  para:
  {
    fontFamily: "Big Shoulders Display",
    fontSize: "20px",
    color:"#7F7F7F",
    fontWeight: 700,
    marginLeft:"20%"    
  }
  }));
const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function RegionMap() {
  const classes = useStyles();
  return (
    <Container className={classes.regionMap}>
      <Box flex={1} className={classes.textSection}>
        <Typography className={classes.heading}>New Mapps Coming Soon:</Typography>
        <Typography className={classes.subHeading}>Geodaka.com</Typography>{" "}
        <Typography className={classes.para}>- Geospatial Services Provider</Typography>{" "}
        <Typography className={classes.subHeading}>Geodaka.Home.com</Typography>{" "}
        <Typography className={classes.para}>- Homeowners Services Maaplication</Typography>{" "}
        <Typography className={classes.subHeading}>Geodaka.Biz.com</Typography>{" "}
        <Typography className={classes.para}>- Bussiness Services Mapplication</Typography>{" "}
        <Typography className={classes.subHeading}>Geodaka.Reality.com</Typography>{" "}
        <Typography className={classes.para}>- Reality Services Mapplication</Typography>
      </Box>
      <Box flex={1} >
      <img src={"images/regionMap.jpg"} alt="Region Map" className={classes.image} />
      </Box>
    </Container>
  );
}
