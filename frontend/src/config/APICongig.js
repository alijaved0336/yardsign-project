//MapBox
// const mapboxUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
const MAPBOXACCESS_TOKEN =
  "pk.eyJ1IjoiZ2VvZGFrYSIsImEiOiJjbHRoNnE2YWgwMXAxMmxwaG1wcnppZWphIn0.3YoeVGWEQ4Ux2ApJ_O23sQ";

//Live URL

const url = `${process.env.REACT_APP_BACKEND_DJANGO_URL}/api`;
const urlForImage = process.env.REACT_APP_BACKEND_DJANGO_URL; // Local image url
const siteKey = "6LcTknspAAAAAHaWMNABpURvD4aSeHdAGA1h-nyM"; // Live
const googleClientId =
  "155124422877-v7joggomgucmafnse3mn87i4rc2coj66.apps.googleusercontent.com"; //Live
const secretsKey = "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"; // Live
const apiKey = ""; //Live

// Local URL

// const url = "http://127.0.0.1:8000/api"; // Local
// const urlForImage = "http://127.0.0.1:8000"; // Local
// const siteKey = "6LdFNXEpAAAAACAH4Qp6cLrKR4DBR-W2Cex1iLns"; // Local
// const googleClientId =
//   "1013318501348-2venngeopqsqg8cnk4j9vk8gtsg3jqst.apps.googleusercontent.com"; //local
// const apiKey = "6LdFNXEpAAAAAPzlCdCxAsviqIsTGoyjwCJ426Ug"; //Local

const ApiConfig = {
  //authorization API
  successEmail: `${url}/welcomeemail/`,
  login: `${url}/login/`,
  googlLogin: `${url}/signupgoogle/`,
  signup: `${url}/signup/`,
  verification: `${url}/verification/`,
  logout: `${url}/logout/`,
  verificationConfirm: `${url}/verify_email_confirm/`,
  resend_verification: `${url}/resend_verification/`,
  verifyOTP: `${url}/verify_otp/`,
  resendOTP: `${url}/send_otp/`,
  forgotPassword: `${url}/send_otp/`,
  changepassword: `${url}/changepassword/`,
  resetPassword: `${url}/forgotpassword/`,
  //Map screen API
  mapboxUrl: `${process.env.REACT_APP_MAP_BOX_URL}`,
  MAPBOXACCESS_TOKEN: `${MAPBOXACCESS_TOKEN}`,
  imagGet: `${urlForImage}`,
  consumerinfo: `${url}/consumerinfo/`,
  consumerinfowms: `${url}/consumerinfowms/`,
  categorylist: `${url}/categorylist/`,
  sectorlist: `${url}/sectorlist/`,
  //Profile Edit
  editprofileinfo: `${url}/editprofileinfo/`,
  changeemail: `${url}/changeemail/`,
  //Add Services
  uploadmultiplefile: `${url}/uploadmultiplefile/`,
  uploadfile: `${url}/uploadfile/`,
  companyInfo: `${url}/userinfo/`,
  viewMyProfile: `${url}/userinfo/`,
  editprofilephoto: `${url}/editprofilephoto/`,
  replaceuploaded: `${url}/replaceuploaded/`,
  updateUserInfo: `${url}/updateUserInfo/`,
  //static
  captcha: `${siteKey}`,
  clientId: `${googleClientId}`,
  contactUS: `${url}/contactus/`,
  //stripe
  buyPlanData: `${url}/unlimited/`,
  buyFreePlanData: `${url}/freeplan/`,
  buyUnlimitedPlanData: `${url}/ulimitedActivate/`,
  subscription: `${url}/pricingplan/`,
  userinfosearch: `${url}/userinfosearch/`,
  useryards: `${url}/useryards/`,
  //admin
  useryardremove: `${url}/useryardremove/`,
  useryardedit: `${url}/useryardedit/`,
  useryardprofile: `${url}/useryardprofile/`,
  useryardadd: `${url}/useryardadd/`,
  newcategory: `${url}/newcategory/`,
  newsector: `${url}/newsector/`,
  //adding api to fetch the user data by user id
  userFiles: `${url}/userFiles/`,
  userFromId: `${url}/userdetails/`,
  editprofilephotoAdmin: `${url}/editprofilephotoAdmin/`,
};
export default ApiConfig;
