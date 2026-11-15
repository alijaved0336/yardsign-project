import React, { lazy } from "react";

import DashboardLayout from "src/layouts/DashboardLayout";
import KycLayout from "src/layouts/kycLayout";
import HomeLayout from "src/layouts/HomeLayout";
import LoginLayout from "src/layouts/LoginLayout";

export const routes = [
  {
    exact: true,
    path: "/",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/home")),
  },
  {
    exact: true,
    path: "/about-us",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/AboutUs")),
  },
  {
    exact: true,
    path: "/home-services",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/HomeServices")),
  },
  {
    exact: true,
    path: "/home-service-providers",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/HomeServiceProviders/index")),
  },
  {
    exact: true,
    path: "/aec-consultants",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/AECConsultants/index")),
  },
  {
    exact: true,
    path: "/refund",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/refund/index")),
  },
  {
    exact: true,
    path: "/pro-network",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/ProUser")),
  },
  {
    exact: true,
    path: "/contact-us",
    layout: HomeLayout,
    component: lazy(() => import("src/views/pages/home/getInTouch")),
  },
  {
    exact: true,
    path: "/register",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/signup/signup.js")),
  },
  {
    exact: true,
    path: "/company-information",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/signup/companyInformation")),
  },
  {
    exact: true,
    path: "/login",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/LogIn")),
  },
  {
    exact: true,
    path: "/verify/",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/LogIn/verify")),
  },
  {
    exact: true,
    path: "/verify-otp",
    layout: HomeLayout,
    component: lazy(() =>
      import("src/views/auth/forget-password-link/OtpVerify")
    ),
  },
  {
    exact: true,
    path: "/reset-password",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/reset-password/index")),
  },
  {
    exact: true,
    path: "/forget-password",
    layout: HomeLayout,
    component: lazy(() => import("src/views/auth/forget-password/index")),
  },
  {
    exact: true,
    path: "/map",
    layout: HomeLayout,
    // guard: true,
    component: lazy(() => import("src/views/pages/dashBoard/Dashboard")),
  },
  {
    exact: true,
    path: "/edit-profile",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() => import("src/views/pages/dashBoard/Settings/Profile")),
  },
  {
    exact: true,
    path: "/add-services",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() => import("src/views/pages/dashBoard/AddServices")),
  },
  {
    exact: true,
    path: "/user-details",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() =>
      import("src/views/pages/dashBoard/admin/UserDetails")
    ),
  },
  {
    exact: true,
    path: "/handle-user-details",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() =>
      import("src/views/pages/dashBoard/admin/UaserListServices")
    ),
  },
  {
    exact: true,
    path: "/my-subscriptions",
    layout: DashboardLayout,
    // guard: true,
    component: lazy(() =>
      import("src/views/pages/dashBoard/pricing/MySubscriptionPlan")
    ),
  },
  {
    exact: true,
    path: "/success",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() =>
      import("src/views/pages/dashBoard/Joyride/SuccessPage")
    ),
  },
  {
    exact: true,
    path: "/failed",
    layout: DashboardLayout,
    guard: true,
    component: lazy(() =>
      import("src/views/pages/dashBoard/Joyride/FailedPage")
    ),
  },
  {
    exact: true,
    path: "/membership-agreement",
    guard: false,
    // layout: LoginLayout,
    component: lazy(() => import("src/views/pages/license/riskNotice")),
  },
  {
    exact: true,
    path: "/terms&condition",
    guard: false,
    // layout: LoginLayout,
    component: lazy(() => import("src/views/pages/license/termsCondition")),
  },
  {
    exact: true,
    path: "/posting-rules",
    guard: false,
    // layout: LoginLayout,
    component: lazy(() => import("src/views/pages/license/postingRules")),
  },
  // {
  //   exact: true,
  //   path: "/userserviceagreement",
  //   guard: false,
  //   // layout: LoginLayout,
  //   component: lazy(() => import("src/views/pages/license/userService")),
  // },
  {
    exact: true,
    path: "/privacy&policy",
    guard: false,
    // layout: LoginLayout,
    component: lazy(() => import("src/views/pages/license/privacyPolicy")),
  },
  {
    exact: true,
    path: "/404",
    component: lazy(() => import("src/views/errors/NotFound")),
  },
  // {
  //   component: () => <Redirect to="/404" />,
  // },
];
