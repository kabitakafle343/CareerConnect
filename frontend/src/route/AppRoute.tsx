import { Navigate, useRoutes } from "react-router-dom";
import { routes } from "./route.constant";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import Dashboard from "../pages/Dashboard.tsx";
import { ProtectedRoute } from "./proctedRoute";
import { Applicants, CompanyProfile, CreateJob, MyJobs } from "../pages/EmployerPages";
import { BrowseJobs, CandidateApplications, CandidateProfile, JobDetails, SavedJobs } from "../pages/CandidatePages";

const route = [
    {
        path:routes.LOGIN,
      element:<SignIn/>
    },
      {
        path:routes.SIGNUP,
      element:<SignUp/>
    },
    {
      path: routes.DASHBOARD,
      element: <ProtectedRoute component={Dashboard} />,
    },
    {
      path: routes.CREATE_JOB,
      element: <ProtectedRoute component={CreateJob} />,
    },
    {
      path: routes.MY_JOBS,
      element: <ProtectedRoute component={MyJobs} />,
    },
    {
      path: routes.APPLICANTS,
      element: <ProtectedRoute component={Applicants} />,
    },
    {
      path: routes.COMPANY,
      element: <ProtectedRoute component={CompanyProfile} />,
    },
    {
      path: routes.JOBS,
      element: <ProtectedRoute component={BrowseJobs} role="candidate" />,
    },
    {
      path: routes.JOB_DETAILS,
      element: <ProtectedRoute component={JobDetails} role="candidate" />,
    },
    {
      path: routes.APPLICATIONS,
      element: <ProtectedRoute component={CandidateApplications} role="candidate" />,
    },
    {
      path: routes.SAVED_JOBS,
      element: <ProtectedRoute component={SavedJobs} role="candidate" />,
    },
    {
      path: routes.PROFILE,
      element: <ProtectedRoute component={CandidateProfile} role="candidate" />,
    },
    {
      path: "*",
      element: <Navigate to={routes.LOGIN} replace />,
    },
];

export const Approute = () => useRoutes(route);