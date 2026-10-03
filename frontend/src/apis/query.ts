import HttpClient from "./Intercept";
interface LoginI{
  email:string,
  password:string
}

export const userLogin = (loginData: LoginI) => {
  return HttpClient.post("/auth/login", {
    email: loginData.email,
    password: loginData.password,
  });
};

export const userLogout = async () => {
  await HttpClient.post("/auth/logout");
};

export type Job = {
  _id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  status: "open" | "closed";
  companyId?: { _id: string; name: string } | string;
  requiredSkills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  createdAt?: string;
};

export type CandidateProfile = {
  _id?: string;
  user?: { _id: string; name: string; email: string; profileImage?: string } | string;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  resume?: string;
  savedJobs?: string[];
  education?: { degree?: string; institution?: string; year?: number }[];
  position?: { company?: string; position?: string; year?: number }[];
};

export type CandidateApplication = {
  _id: string;
  job: Job | null;
  coverLetter?: string;
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  createdAt: string;
};

export type EmployerApplication = {
  _id: string;
  candidate: { _id: string; name: string; email: string; profileImage?: string } | null;
  candidateProfile: Pick<CandidateProfile, "phone" | "address" | "bio" | "skills" | "resume"> | null;
  job: { _id: string; title: string; location: string } | null;
  resume?: string;
  coverLetter?: string;
  status: CandidateApplication["status"];
  createdAt: string;
};

export const getEmployerApplications = async () => {
  const response = await HttpClient.get<{ applications: EmployerApplication[] }>("/company/job/applications");
  return response.data.applications;
};

export const updateApplicationStatus = async ({ applicationId, status }: { applicationId: string; status: CandidateApplication["status"] }) => {
  const response = await HttpClient.patch<{ application: EmployerApplication }>(`/company/job/applications/${applicationId}/status`, { status });
  return response.data.application;
};

export type EmployerDashboard = {
  company: { name: string };
  jobs: (Job & { applicantCount: number })[];
  stats: { activeJobs: number; totalApplicants: number; hired: number };
};

export const getEmployerDashboard = async () => {
  const response = await HttpClient.get<EmployerDashboard>("/company/job/dashboard");
  return response.data;
};

export type AdminCompany = Company & {
  owner: { _id: string; name: string; email: string } | null;
  isApproved: boolean;
  createdAt: string;
  jobs: Job[];
};

export type AdminOverview = {
  companies: AdminCompany[];
  stats: {
    users: number;
    companies: number;
    jobs: number;
    openJobs: number;
    applications: number;
  };
};

export const getAdminOverview = async () => {
  const response = await HttpClient.get<AdminOverview>("/admin/overview");
  return response.data;
};

export const deleteAdminCompany = async (companyId: string) => {
  await HttpClient.delete(`/admin/companies/${companyId}`);
};

export const deleteAdminJob = async (jobId: string) => {
  await HttpClient.delete(`/admin/jobs/${jobId}`);
};

export const getOpenJobs = async () => {
  const response = await HttpClient.get<{ jobs: Job[] }>("/company/job");
  return response.data.jobs;
};

export const getJobById = async (id: string) => {
  const response = await HttpClient.get<{ job: Job }>(`/company/job/${id}`);
  return response.data.job;
};

export const getCandidateProfile = async () => {
  const response = await HttpClient.get<{ profile: CandidateProfile }>("/candidate/profile");
  return response.data.profile;
};

export const updateCandidateProfile = async (profile: CandidateProfile) => {
  const response = await HttpClient.put<{ profile: CandidateProfile }>("/candidate/profile", profile);
  return response.data.profile;
};

export const getCandidateApplications = async () => {
  const response = await HttpClient.get<{ applications: CandidateApplication[] }>("/candidate/applications");
  return response.data.applications;
};

export const applyToJob = async ({ jobId, coverLetter }: { jobId: string; coverLetter: string }) => {
  const response = await HttpClient.post<{ application: CandidateApplication }>(`/candidate/jobs/${jobId}/applications`, { coverLetter });
  return response.data.application;
};

export const getSavedJobs = async () => {
  const response = await HttpClient.get<{ jobs: Job[] }>("/candidate/saved-jobs");
  return response.data.jobs;
};

export const saveJob = async (jobId: string) => {
  await HttpClient.post(`/candidate/saved-jobs/${jobId}`);
};

export const unsaveJob = async (jobId: string) => {
  await HttpClient.delete(`/candidate/saved-jobs/${jobId}`);
};

export type Company = {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  website?: string;
};

export const getMyCompany = async () => {
  const response = await HttpClient.get<{ company: Company }>("/company");
  return response.data.company;
};

export const createCompany = async (company: Omit<Company, "_id">) => {
  const response = await HttpClient.post<{ company: Company }>("/company/create", company);
  return response.data.company;
};

export const updateCompany = async ({ id, company }: { id: string; company: Partial<Company> }) => {
  const response = await HttpClient.put<{ company: Company }>(`/company/${id}`, company);
  return response.data.company;
};

export const createJob = async (job: Omit<Job, "_id" | "status" | "createdAt">) => {
  const response = await HttpClient.post<{ job: Job }>("/company/job/create", job);
  return response.data.job;
};

export const deleteJob = async (id: string) => {
  await HttpClient.delete(`/company/job/${id}`);
};