import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { Alert, Avatar, Badge, Box, Button, Flex, FormControl, FormLabel, Heading, HStack, Input, Select, SimpleGrid, Stack, Text, Textarea, VStack } from "@chakra-ui/react";
import { createCompany, createJob, deleteJob, getEmployerApplications, getEmployerDashboard, getMyCompany, updateApplicationStatus, updateCompany, type CandidateApplication, type Company } from "../apis/query";
import ColorModeToggle from "../components/ColorModeToggle";
import SignOutButton from "../components/SignOutButton";
import LeafletLocationField from "../components/LeafletLocationField";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "Post a job", path: "/create-job", icon: "+" },
  { label: "My jobs", path: "/my-jobs", icon: "▤" },
  { label: "Applicants", path: "/applicants", icon: "♧" },
  { label: "Company profile", path: "/company", icon: "▥" },
];

type CompanyMutation = Omit<Company, "_id"> | { id: string; company: Partial<Company> };

const Field = ({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) => <FormControl isRequired={required}><FormLabel color="app.muted" fontSize="sm" fontWeight="600">{label}</FormLabel><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} bg="app.field" borderColor="app.border" _hover={{ borderColor: "app.muted" }} _focusVisible={{ borderColor: "#b7e36c", boxShadow: "0 0 0 1px #b7e36c" }} /></FormControl>;

export const CreateJob = () => {
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: createJob, onSuccess: () => navigate("/my-jobs") });
  const [form, setForm] = useState({ title: "", description: "", location: "", jobType: "full-time" });
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <Page title="Post a job" subtitle="Create a role and start building your hiring pipeline."><Box as="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); mutation.mutate(form); }} p={{ base: 5, md: 7 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel"><Stack spacing={5}><SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}><Field label="Job title" value={form.title} onChange={set("title")} required /><LeafletLocationField value={form.location} onChange={set("location")} required /></SimpleGrid><FormControl><FormLabel color="app.muted" fontSize="sm" fontWeight="600">Job type</FormLabel><Select value={form.jobType} onChange={(event) => set("jobType")(event.target.value)} bg="app.field" borderColor="app.border" _hover={{ borderColor: "app.muted" }}><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="remote">Remote</option><option value="internship">Internship</option></Select></FormControl><FormControl isRequired><FormLabel color="app.muted" fontSize="sm" fontWeight="600">Description</FormLabel><Textarea value={form.description} onChange={(event) => set("description")(event.target.value)} bg="app.field" borderColor="app.border" minH="180px" _hover={{ borderColor: "app.muted" }} /></FormControl>{mutation.isError && <Text color="red.300" fontSize="sm">Unable to create the job. Make sure your company profile exists.</Text>}<Button type="submit" alignSelf="flex-start" isLoading={mutation.isPending} bg="#b7e36c" color="#172011" _hover={{ bg: "#c9ee8e" }}>Publish job</Button></Stack></Box></Page>;
};

export const MyJobs = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["employer-dashboard"], queryFn: getEmployerDashboard });
  const { data: applications = [], isLoading: applicationsLoading, isError: applicationsError } = useQuery({ queryKey: ["employer-applications"], queryFn: getEmployerApplications });
  const remove = useMutation({ mutationFn: deleteJob, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employer-dashboard"] }) });
  return <Page title="My jobs" subtitle="Manage the roles your company has published.">
    <Stack spacing={3}>
      {isLoading && <Text color="app.muted">Loading jobs...</Text>}
      {isError && <Box p={5} border="1px solid" borderColor="app.warningBorder" borderRadius="md" bg="app.warningBg" color="app.warningText">Create a company profile before managing jobs.</Box>}
      {!isLoading && !isError && data?.jobs.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No jobs posted yet</Heading><Text mt={2} color="app.muted">Your published roles will appear here.</Text></Box>}
      {data?.jobs.map((job) => {
        const jobApplications = applications.filter((application) => application.job?._id === job._id);
        const recentApplicants = jobApplications.slice(0, 3).map((application) => application.candidate?.name ?? "Candidate");
        return <Flex key={job._id} align={{ base: "flex-start", sm: "center" }} justify="space-between" gap={4} direction={{ base: "column", sm: "row" }} p={5} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
          <Box>
            <Heading size="sm">{job.title}</Heading>
            <Text mt={2} color="app.muted" fontSize="sm">{job.location} · {job.jobType}</Text>
            {applicationsLoading ? <Text mt={2} color="app.muted" fontSize="sm">Loading applicants...</Text> : applicationsError ? <Text mt={2} color="app.muted" fontSize="sm">Applicants could not be loaded.</Text> : <Text mt={2} color="app.muted" fontSize="sm">
              {jobApplications.length === 0 ? "No applicants yet" : `${jobApplications.length} ${jobApplications.length === 1 ? "applicant" : "applicants"}: ${recentApplicants.join(", ")}${jobApplications.length > recentApplicants.length ? ` +${jobApplications.length - recentApplicants.length} more` : ""}`}
            </Text>}
          </Box>
          <HStack>
            <Button as={NavLink} to="/applicants" size="sm" variant="outline">View applicants</Button>
            <Button size="sm" colorScheme="red" variant="outline" onClick={() => remove.mutate(job._id)} isLoading={remove.isPending}>Delete</Button>
          </HStack>
        </Flex>;
      })}
    </Stack>
  </Page>;
};

const applicationStatuses: CandidateApplication["status"][] = ["pending", "reviewing", "shortlisted", "rejected", "hired"];

const statusColor: Record<CandidateApplication["status"], string> = {
  pending: "orange",
  reviewing: "blue",
  shortlisted: "purple",
  rejected: "red",
  hired: "green",
};

export const Applicants = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const { data: applications = [], isLoading, isError } = useQuery({ queryKey: ["employer-applications"], queryFn: getEmployerApplications });
  const updateStatus = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] }),
      queryClient.invalidateQueries({ queryKey: ["employer-dashboard"] }),
    ]),
  });
  const jobs = Array.from(new Map(applications.filter((application) => application.job).map((application) => [application.job!._id, application.job!])).values());
  const filteredApplications = applications.filter((application) =>
    (statusFilter === "all" || application.status === statusFilter) &&
    (jobFilter === "all" || application.job?._id === jobFilter),
  );
  const pendingCount = applications.filter((application) => application.status === "pending").length;
  const shortlistedCount = applications.filter((application) => application.status === "shortlisted").length;
  const hiredCount = applications.filter((application) => application.status === "hired").length;

  return <Page title="Applicants" subtitle="Review candidates and keep each application moving.">
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
      {[{ label: "Total", value: applications.length }, { label: "Needs review", value: pendingCount }, { label: "Shortlisted", value: shortlistedCount }, { label: "Hired", value: hiredCount }].map((item) => <Box key={item.label} p={4} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel"><Text color="app.muted" fontSize="xs">{item.label}</Text><Heading mt={1} size="lg">{isLoading ? "-" : item.value}</Heading></Box>)}
    </SimpleGrid>
    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
      <FormControl><FormLabel color="app.muted" fontSize="sm">Filter by job</FormLabel><Select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)} bg="app.field" borderColor="app.border"><option value="all">All jobs</option>{jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}</Select></FormControl>
      <FormControl><FormLabel color="app.muted" fontSize="sm">Filter by status</FormLabel><Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} bg="app.field" borderColor="app.border"><option value="all">All statuses</option>{applicationStatuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</Select></FormControl>
    </SimpleGrid>
    {isError && <Alert status="error">We couldn&apos;t load applicants. Please try again.</Alert>}
    {updateStatus.isError && <Alert status="error">The application status could not be updated.</Alert>}
    {isLoading && <Text color="app.muted">Loading applicants...</Text>}
    {!isLoading && !isError && applications.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No applications yet</Heading><Text mt={2} color="app.muted">Candidate applications will appear here.</Text></Box>}
    {!isLoading && !isError && applications.length > 0 && filteredApplications.length === 0 && <Box p={7} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No matching applications</Heading><Text mt={2} color="app.muted">Try changing the job or status filters.</Text></Box>}
    <Stack spacing={4}>
      {filteredApplications.map((application) => {
        const candidate = application.candidate;
        const profile = application.candidateProfile;
        const resume = application.resume || profile?.resume;
        return <Box key={application._id} p={{ base: 4, md: 5 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
          <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" gap={4} direction={{ base: "column", md: "row" }}>
            <HStack align="flex-start" spacing={3}>
              <Avatar size="md" name={candidate?.name ?? "Candidate"} src={candidate?.profileImage} />
              <Box><Heading size="sm">{candidate?.name ?? "Candidate account unavailable"}</Heading><Text mt={1} color="app.muted" fontSize="sm">{candidate?.email ?? "Contact details unavailable"}</Text><Text mt={2} color="app.subtle" fontSize="xs">{application.job?.title ?? "Job unavailable"}{application.job?.location ? ` · ${application.job.location}` : ""} · Applied {new Date(application.createdAt).toLocaleDateString()}</Text></Box>
            </HStack>
            <HStack spacing={3} align={{ base: "flex-start", md: "center" }}>
              <Badge colorScheme={statusColor[application.status]}>{application.status}</Badge>
              <Select aria-label={`Update status for ${candidate?.name ?? "candidate"}`} value={application.status} onChange={(event) => updateStatus.mutate({ applicationId: application._id, status: event.target.value as CandidateApplication["status"] })} isDisabled={updateStatus.isPending} size="sm" bg="app.field" borderColor="app.border" minW="150px">{applicationStatuses.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</Select>
            </HStack>
          </Flex>
          {(profile?.phone || profile?.address || profile?.bio || profile?.skills?.length || resume) && <Box mt={5} pt={4} borderTop="1px solid" borderColor="app.border">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>{profile?.phone && <Text color="app.muted" fontSize="sm">Phone: {profile.phone}</Text>}{profile?.address && <Text mt={1} color="app.muted" fontSize="sm">Location: {profile.address}</Text>}{resume && <Text mt={2} fontSize="sm"><a href={resume} target="_blank" rel="noreferrer">View resume</a></Text>}</Box>
              {profile?.skills?.length ? <Box><Text color="app.muted" fontSize="xs" textTransform="uppercase">Skills</Text><HStack mt={2} spacing={2} flexWrap="wrap">{profile.skills.map((skill) => <Badge key={skill} variant="subtle" colorScheme="green">{skill}</Badge>)}</HStack></Box> : null}
            </SimpleGrid>
            {profile?.bio && <Text mt={4} color="app.muted" fontSize="sm" whiteSpace="pre-wrap">{profile.bio}</Text>}
          </Box>}
          {application.coverLetter && <Box mt={4} p={4} borderRadius="md" bg="app.field"><Text color="app.muted" fontSize="xs" fontWeight="700" textTransform="uppercase">Cover letter</Text><Text mt={2} fontSize="sm" whiteSpace="pre-wrap">{application.coverLetter}</Text></Box>}
        </Box>;
      })}
    </Stack>
  </Page>;
};

export const CompanyProfile = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-company"], queryFn: getMyCompany, retry: false });
  const mutation = useMutation<Company, Error, CompanyMutation>({ mutationFn: (values) => "id" in values ? updateCompany(values) : createCompany(values), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-company"] }) });
  const [form, setForm] = useState<{ name: string; description: string; location: string; website: string } | null>(null);
  const values = form ?? { name: data?.name ?? "", description: data?.description ?? "", location: data?.location ?? "", website: data?.website ?? "" };
  const set = (key: keyof typeof values) => (value: string) => setForm((current) => ({ ...(current ?? values), [key]: value }));
  if (isLoading) return <Page title="Company profile" subtitle="Loading your company profile..." />;
  return <Page title="Company profile" subtitle="Keep the information candidates see up to date."><Box as="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (data) mutation.mutate({ id: data._id, company: values }); else mutation.mutate(values); }} p={{ base: 5, md: 7 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel"><Stack spacing={5}><Field label="Company name" value={values.name} onChange={set("name")} required /><SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}><Field label="Location" value={values.location} onChange={set("location")} /><Field label="Website" type="url" value={values.website} onChange={set("website")} /></SimpleGrid><FormControl><FormLabel color="app.muted" fontSize="sm" fontWeight="600">Description</FormLabel><Textarea value={values.description} onChange={(event) => set("description")(event.target.value)} bg="app.field" borderColor="app.border" minH="140px" _hover={{ borderColor: "app.muted" }} /></FormControl>{isError && <Text color="app.muted" fontSize="sm">No profile yet. Create one to unlock job posting.</Text>}{mutation.isError && <Text color="red.300" fontSize="sm">Unable to save your company profile. Please try again.</Text>}<Button type="submit" alignSelf="flex-start" isLoading={mutation.isPending} bg="#b7e36c" color="#172011" _hover={{ bg: "#c9ee8e" }}>{data ? "Save changes" : "Create company"}</Button></Stack></Box></Page>;
};

const Page = ({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) => <Flex minH="100vh" bg="app.canvas" color="app.text" direction={{ base: "column", md: "row" }}>
  <Box as="aside" w={{ base: "full", md: "255px" }} flexShrink={0} bg="app.sidebar" borderRight={{ base: "none", md: "1px solid" }} borderBottom={{ base: "1px solid", md: "none" }} borderColor="app.border" p={{ base: 3, md: 5 }}>
    <HStack px={{ base: 1, md: 3 }} pb={{ base: 3, md: 10 }} spacing={3}>
      <Flex w="30px" h="30px" flexShrink={0} bg="#b7e36c" color="#172011" borderRadius="8px" align="center" justify="center" fontWeight="bold">C</Flex>
      <Text fontFamily="heading" fontWeight="bold">CareerConnect</Text>
      <Text ml="auto" display={{ base: "block", md: "none" }} color="app.muted" fontSize="xs">EMPLOYER</Text>
    </HStack>
    <Text display={{ base: "none", md: "block" }} px={3} pb={3} fontSize="xs" color="app.muted" textTransform="uppercase">Workspace</Text>
    <VStack align="stretch" spacing={1} direction={{ base: "row", md: "column" }} overflowX={{ base: "auto", md: "visible" }}>
      {navigation.map((item) => <Button key={item.path} as={NavLink} to={item.path} justifyContent={{ base: "center", md: "flex-start" }} gap={3} px={3} minW={{ base: "max-content", md: "auto" }} variant="ghost" color="app.muted" _hover={{ bg: "app.hover", color: "app.text" }} _activeLink={{ bg: "app.hover", color: "app.text", boxShadow: "inset 3px 0 #b7e36c" }}><Text fontSize="lg">{item.icon}</Text><Text>{item.label}</Text></Button>)}
    </VStack>
  </Box>
  <Box as="main" flex="1" w="full" maxW="1180px" mx="auto" px={{ base: 5, md: 12 }} py={{ base: 6, md: 10 }}>
    <Flex align="center" gap={4} pb={6} borderBottom="1px solid" borderColor="app.border">
      <Box><Text fontSize="xs" color="app.muted" textTransform="uppercase">CareerConnect / Employer</Text><Heading mt={1} size="lg" fontFamily="heading">{title}</Heading></Box>
      <HStack ml="auto" spacing={3}><ColorModeToggle /><SignOutButton /></HStack>
    </Flex>
    <Stack spacing={7} pt={{ base: 6, md: 8 }} maxW="820px">
      <Text color="app.muted" fontSize="sm">{subtitle}</Text>
      {children}
    </Stack>
  </Box>
</Flex>;