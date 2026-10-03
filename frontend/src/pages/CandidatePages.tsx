import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Link as ChakraLink,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  applyToJob,
  getCandidateApplications,
  getCandidateProfile,
  getJobById,
  getOpenJobs,
  getSavedJobs,
  saveJob,
  type CandidateProfile as CandidateProfileData,
  type Job,
  unsaveJob,
  updateCandidateProfile,
} from "../apis/query";
import ColorModeToggle from "../components/ColorModeToggle";
import SignOutButton from "../components/SignOutButton";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "Browse jobs", path: "/jobs", icon: "⌕" },
  { label: "Applications", path: "/applications", icon: "▤" },
  { label: "Saved jobs", path: "/saved-jobs", icon: "☆" },
  { label: "My profile", path: "/profile", icon: "♙" },
];

const companyName = (job: Job) => typeof job.companyId === "object" && job.companyId ? job.companyId.name : "Company";
const formatDate = (date: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
const mapsUrl = (location: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

const CandidatePage = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <Flex minH="100vh" bg="app.canvas" color="app.text" direction={{ base: "column", md: "row" }}>
    <Box as="aside" w={{ base: "full", md: "255px" }} flexShrink={0} bg="app.sidebar" borderRight={{ base: "none", md: "1px solid" }} borderBottom={{ base: "1px solid", md: "none" }} borderColor="app.border" p={{ base: 3, md: 5 }}>
      <HStack px={{ base: 1, md: 3 }} pb={{ base: 3, md: 10 }} spacing={3}>
        <Flex w="30px" h="30px" flexShrink={0} bg="#b7e36c" color="#172011" borderRadius="8px" align="center" justify="center" fontWeight="bold">C</Flex>
        <Text fontFamily="heading" fontWeight="bold">CareerConnect</Text>
        <Text ml="auto" display={{ base: "block", md: "none" }} color="app.muted" fontSize="xs">CANDIDATE</Text>
      </HStack>
      <Text display={{ base: "none", md: "block" }} px={3} pb={3} fontSize="xs" color="app.muted" textTransform="uppercase">Workspace</Text>
      <VStack align="stretch" spacing={1} direction={{ base: "row", md: "column" }} overflowX={{ base: "auto", md: "visible" }}>
        {navigation.map((item) => <Button key={item.path} as={NavLink} to={item.path} justifyContent={{ base: "center", md: "flex-start" }} gap={3} px={3} minW={{ base: "max-content", md: "auto" }} variant="ghost" color="app.muted" _hover={{ bg: "app.hover", color: "app.text" }} _activeLink={{ bg: "app.hover", color: "app.text", boxShadow: "inset 3px 0 #b7e36c" }}><Text fontSize="lg">{item.icon}</Text><Text>{item.label}</Text></Button>)}
      </VStack>
    </Box>
    <Box as="main" flex="1" w="full" maxW="1180px" mx="auto" px={{ base: 5, md: 12 }} py={{ base: 6, md: 10 }}>
      <Flex align="center" gap={4} pb={6} borderBottom="1px solid" borderColor="app.border">
        <Box><Text fontSize="xs" color="app.muted" textTransform="uppercase">CareerConnect / Candidate</Text><Heading mt={1} size="lg" fontFamily="heading">{title}</Heading></Box>
        <HStack ml="auto" spacing={3}><ColorModeToggle /><SignOutButton /></HStack>
      </Flex>
      <Stack spacing={7} pt={{ base: 6, md: 8 }} maxW="900px">
        <Text color="app.muted" fontSize="sm">{subtitle}</Text>
        {children}
      </Stack>
    </Box>
  </Flex>
);

const JobCard = ({ job, isSaved, onToggleSave, isSaving }: { job: Job; isSaved: boolean; onToggleSave: () => void; isSaving: boolean }) => (
  <Box p={5} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel" transition="all 160ms ease" _hover={{ transform: "translateY(-2px)", borderColor: "app.accentText", boxShadow: "md" }}>
    <Flex align="flex-start" justify="space-between" gap={3}>
      <Box minW={0}>
        <Text color="app.accentText" fontSize="xs" fontWeight="700" textTransform="uppercase">{job.jobType.replace("-", " ")}</Text>
        <Heading as={RouterLink} to={`/jobs/${job._id}`} display="block" mt={2} size="md" noOfLines={2} _hover={{ color: "app.accentText" }}>{job.title}</Heading>
        <Text mt={1} color="app.muted" fontSize="sm">{companyName(job)} · <ChakraLink href={mapsUrl(job.location)} isExternal color="app.accentText" textDecoration="underline">{job.location}</ChakraLink></Text>
      </Box>
      <IconButton aria-label={isSaved ? "Remove saved job" : "Save job"} title={isSaved ? "Remove saved job" : "Save job"} variant="ghost" color={isSaved ? "orange.400" : "app.muted"} icon={<Text fontSize="xl">{isSaved ? "★" : "☆"}</Text>} onClick={onToggleSave} isLoading={isSaving} />
    </Flex>
    <Text mt={4} color="app.muted" fontSize="sm" noOfLines={3}>{job.description}</Text>
    <Flex mt={5} align="center" justify="space-between" gap={3}>
      <Text color="app.subtle" fontSize="xs">{job.createdAt ? `Posted ${formatDate(job.createdAt)}` : "Open role"}</Text>
      <Button as={RouterLink} to={`/jobs/${job._id}`} size="sm" variant="outline" borderColor="app.border">View role</Button>
    </Flex>
  </Box>
);

const JobGrid = ({ jobs, savedIds, onToggleSave, isSaving }: { jobs: Job[]; savedIds: Set<string>; onToggleSave: (job: Job) => void; isSaving: boolean }) => (
  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
    {jobs.map((job) => <JobCard key={job._id} job={job} isSaved={savedIds.has(job._id)} onToggleSave={() => onToggleSave(job)} isSaving={isSaving} />)}
  </SimpleGrid>
);

export const BrowseJobs = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const jobsQuery = useQuery({ queryKey: ["open-jobs"], queryFn: getOpenJobs });
  const savedQuery = useQuery({ queryKey: ["candidate-saved-jobs"], queryFn: getSavedJobs });
  const saveMutation = useMutation({ mutationFn: ({ jobId, saved }: { jobId: string; saved: boolean }) => saved ? unsaveJob(jobId) : saveJob(jobId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }) });
  const savedIds = new Set((savedQuery.data ?? []).map((job) => job._id));
  const normalizedSearch = search.trim().toLowerCase();
  const jobs = (jobsQuery.data ?? []).filter((job) => {
    const matchesSearch = !normalizedSearch || `${job.title} ${job.location} ${companyName(job)}`.toLowerCase().includes(normalizedSearch);
    return matchesSearch && (jobType === "all" || job.jobType === jobType);
  });
  const toggleSaved = (job: Job) => saveMutation.mutate({ jobId: job._id, saved: savedIds.has(job._id) });

  return <CandidatePage title="Browse jobs" subtitle="Find a role that fits where you want to go next.">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
      <Input aria-label="Search jobs" placeholder="Search title, company, or location" value={search} onChange={(event) => setSearch(event.target.value)} bg="app.field" borderColor="app.border" />
      <Select aria-label="Filter by job type" value={jobType} onChange={(event) => setJobType(event.target.value)} bg="app.field" borderColor="app.border"><option value="all">All job types</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="remote">Remote</option><option value="internship">Internship</option></Select>
    </SimpleGrid>
    {jobsQuery.isLoading && <Text color="app.muted">Loading open roles...</Text>}
    {jobsQuery.isError && <Alert status="error">We couldn&apos;t load jobs. Please try again.</Alert>}
    {saveMutation.isError && <Alert status="error">We couldn&apos;t update your saved jobs. Please try again.</Alert>}
    {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No matching roles</Heading><Text mt={2} color="app.muted">Try a different search or job type.</Text></Box>}
    {jobs.length > 0 && <JobGrid jobs={jobs} savedIds={savedIds} onToggleSave={toggleSaved} isSaving={saveMutation.isPending} />}
  </CandidatePage>;
};

export const JobDetails = () => {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const jobQuery = useQuery({ queryKey: ["job", id], queryFn: () => getJobById(id), enabled: Boolean(id) });
  const profileQuery = useQuery({ queryKey: ["candidate-profile"], queryFn: getCandidateProfile, retry: false });
  const applicationsQuery = useQuery({ queryKey: ["candidate-applications"], queryFn: getCandidateApplications });
  const savedQuery = useQuery({ queryKey: ["candidate-saved-jobs"], queryFn: getSavedJobs });
  const [coverLetter, setCoverLetter] = useState("");
  const applyMutation = useMutation({ mutationFn: applyToJob, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-applications"] }) });
  const saveMutation = useMutation({ mutationFn: ({ jobId, saved }: { jobId: string; saved: boolean }) => saved ? unsaveJob(jobId) : saveJob(jobId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }) });
  const job = jobQuery.data;
  const isApplied = applicationsQuery.data?.some((application) => application.job?._id === id) ?? false;
  const isSaved = savedQuery.data?.some((savedJob) => savedJob._id === id) ?? false;

  return <CandidatePage title="Job details" subtitle="Review the role and send your application.">
    {jobQuery.isLoading && <Text color="app.muted">Loading role...</Text>}
    {jobQuery.isError && <Alert status="error">This role couldn&apos;t be loaded. It may have been removed.</Alert>}
    {job && <Stack spacing={5}>
      <Box p={{ base: 5, md: 7 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
        <Flex align="flex-start" justify="space-between" gap={4}>
          <Box><Badge colorScheme="green">{job.jobType.replace("-", " ")}</Badge><Heading mt={3} size="xl">{job.title}</Heading><Text mt={2} color="app.muted">{companyName(job)} · <ChakraLink href={mapsUrl(job.location)} isExternal color="app.accentText" textDecoration="underline">Open location in Google Maps</ChakraLink></Text></Box>
          <IconButton aria-label={isSaved ? "Remove saved job" : "Save job"} title={isSaved ? "Remove saved job" : "Save job"} variant="ghost" color={isSaved ? "orange.400" : "app.muted"} icon={<Text fontSize="xl">{isSaved ? "★" : "☆"}</Text>} onClick={() => saveMutation.mutate({ jobId: job._id, saved: isSaved })} isLoading={saveMutation.isPending} />
        </Flex>
        {(job.salaryMin || job.salaryMax) && <Text mt={5} fontWeight="600">{job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : ""}{job.salaryMin && job.salaryMax ? " - " : ""}{job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : ""}</Text>}
        {job.requiredSkills?.length ? <HStack mt={5} spacing={2} flexWrap="wrap">{job.requiredSkills.map((skill) => <Badge key={skill} variant="subtle" colorScheme="green">{skill}</Badge>)}</HStack> : null}
        <Text mt={6} whiteSpace="pre-wrap" lineHeight="1.8">{job.description}</Text>
      </Box>
      <Box p={{ base: 5, md: 7 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
        <Heading size="md">Apply for this role</Heading>
        {isApplied ? <Alert mt={4} status="success">Your application has been submitted.</Alert> : <Box as="form" mt={5} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); applyMutation.mutate({ jobId: job._id, coverLetter }); }}><Stack spacing={4}>
          <Text color="app.muted" fontSize="sm">Resume on file: {profileQuery.data?.resume ? <a href={profileQuery.data.resume} target="_blank" rel="noreferrer">View resume</a> : "None. You can add a resume link in your profile."}</Text>
          <FormControl><FormLabel color="app.muted">Cover letter</FormLabel><Textarea value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} bg="app.field" borderColor="app.border" minH="140px" placeholder="Tell the employer why this role interests you." /></FormControl>
          {applyMutation.isError && <Alert status="error">{(applyMutation.error as Error).message || "Your application could not be submitted."}</Alert>}
          {saveMutation.isError && <Alert status="error">Could not update your saved jobs.</Alert>}
          <HStack flexWrap="wrap"><Button type="submit" isLoading={applyMutation.isPending} isDisabled={job.status !== "open"}>Submit application</Button><Button variant="ghost" onClick={() => navigate("/jobs")}>Back to jobs</Button></HStack>
        </Stack></Box>}
      </Box>
    </Stack>}
  </CandidatePage>;
};

export const CandidateApplications = () => {
  const applicationsQuery = useQuery({ queryKey: ["candidate-applications"], queryFn: getCandidateApplications });
  return <CandidatePage title="Applications" subtitle="Keep track of every role you have applied for.">
    {applicationsQuery.isLoading && <Text color="app.muted">Loading applications...</Text>}
    {applicationsQuery.isError && <Alert status="error">We couldn&apos;t load your applications.</Alert>}
    {!applicationsQuery.isLoading && !applicationsQuery.isError && applicationsQuery.data?.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No applications yet</Heading><Text mt={2} color="app.muted">Roles you apply for will show up here.</Text><Button as={RouterLink} to="/jobs" mt={5}>Browse jobs</Button></Box>}
    <Stack spacing={3}>{applicationsQuery.data?.map((application) => <Flex key={application._id} align={{ base: "flex-start", sm: "center" }} justify="space-between" gap={4} direction={{ base: "column", sm: "row" }} p={5} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
      <Box><Heading size="sm">{application.job?.title ?? "Role no longer available"}</Heading><Text mt={1} color="app.muted" fontSize="sm">{application.job ? `${companyName(application.job)} · ${application.job.location}` : ""}</Text><Text mt={2} color="app.subtle" fontSize="xs">Applied {formatDate(application.createdAt)}</Text></Box>
      <Badge colorScheme={application.status === "hired" ? "green" : application.status === "rejected" ? "red" : "blue"}>{application.status}</Badge>
    </Flex>)}</Stack>
  </CandidatePage>;
};

export const SavedJobs = () => {
  const queryClient = useQueryClient();
  const savedQuery = useQuery({ queryKey: ["candidate-saved-jobs"], queryFn: getSavedJobs });
  const removeMutation = useMutation({ mutationFn: unsaveJob, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-saved-jobs"] }) });
  const savedIds = new Set((savedQuery.data ?? []).map((job) => job._id));
  return <CandidatePage title="Saved jobs" subtitle="Keep interesting roles close while you decide what is next.">
    {savedQuery.isLoading && <Text color="app.muted">Loading saved jobs...</Text>}
    {savedQuery.isError && <Alert status="error">We couldn&apos;t load your saved jobs.</Alert>}
    {removeMutation.isError && <Alert status="error">Could not remove that saved role.</Alert>}
    {!savedQuery.isLoading && !savedQuery.isError && savedQuery.data?.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">Nothing saved yet</Heading><Text mt={2} color="app.muted">Save a role to return to it later.</Text><Button as={RouterLink} to="/jobs" mt={5}>Browse jobs</Button></Box>}
    {!!savedQuery.data?.length && <JobGrid jobs={savedQuery.data} savedIds={savedIds} onToggleSave={(job) => removeMutation.mutate(job._id)} isSaving={removeMutation.isPending} />}
  </CandidatePage>;
};

export const CandidateProfile = () => {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["candidate-profile"], queryFn: getCandidateProfile, retry: false });
  const [draft, setDraft] = useState<CandidateProfileData | null>(null);
  const [skillsInput, setSkillsInput] = useState<string | null>(null);
  const profile = profileQuery.data;
  const values = draft ?? {
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    bio: profile?.bio ?? "",
    skills: profile?.skills ?? [],
    resume: profile?.resume ?? "",
  };
  const updateMutation = useMutation({ mutationFn: updateCandidateProfile, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate-profile"] }) });
  const user = typeof profile?.user === "object" ? profile.user : undefined;
  const notFound = (profileQuery.error as { response?: { status?: number } } | null)?.response?.status === 404;
  const set = (key: "phone" | "address" | "bio" | "resume") => (value: string) => setDraft((current) => ({ ...(current ?? values), [key]: value }));

  return <CandidatePage title="My profile" subtitle="Give employers a clear picture of your experience and strengths.">
    {profileQuery.isLoading && <Text color="app.muted">Loading your profile...</Text>}
    {profileQuery.isError && !notFound && <Alert status="error">We couldn&apos;t load your profile. Please try again.</Alert>}
    {!profileQuery.isLoading && <Box as="form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); updateMutation.mutate({ ...values, skills: (skillsInput ?? (values.skills ?? []).join(", ")).split(/[\\s,]+/).map((skill) => skill.trim()).filter(Boolean) }); }} p={{ base: 5, md: 7 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
      <Stack spacing={5}>
        {user && <Box><Text fontSize="xs" color="app.muted" textTransform="uppercase">Account</Text><Heading mt={1} size="sm">{user.name}</Heading><Text mt={1} color="app.muted" fontSize="sm">{user.email}</Text></Box>}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl><FormLabel color="app.muted">Phone</FormLabel><Input value={values.phone ?? ""} onChange={(event) => set("phone")(event.target.value)} bg="app.field" borderColor="app.border" /></FormControl>
          <FormControl><FormLabel color="app.muted">Location</FormLabel><Input value={values.address ?? ""} onChange={(event) => set("address")(event.target.value)} bg="app.field" borderColor="app.border" /></FormControl>
        </SimpleGrid>
        <FormControl><FormLabel color="app.muted">Skills</FormLabel><Input value={skillsInput ?? (values.skills ?? []).join(", ")} onChange={(event) => setSkillsInput(event.target.value)} bg="app.field" borderColor="app.border" placeholder="React, Node.js, SQL" /><Text mt={1} color="app.subtle" fontSize="xs">Separate skills with commas or spaces.</Text></FormControl>
        <FormControl><FormLabel color="app.muted">Resume link</FormLabel><Input type="url" value={values.resume ?? ""} onChange={(event) => set("resume")(event.target.value)} bg="app.field" borderColor="app.border" placeholder="https://..." /></FormControl>
        <FormControl><FormLabel color="app.muted">About</FormLabel><Textarea value={values.bio ?? ""} onChange={(event) => set("bio")(event.target.value)} bg="app.field" borderColor="app.border" minH="150px" placeholder="A short introduction about your work and goals." /></FormControl>
        {notFound && <Text color="app.muted" fontSize="sm">Your profile will be created when you save these details.</Text>}
        {updateMutation.isError && <Alert status="error">We couldn&apos;t save your profile. Please try again.</Alert>}
        {updateMutation.isSuccess && <Alert status="success">Profile saved.</Alert>}
        <Button type="submit" alignSelf="flex-start" isLoading={updateMutation.isPending}>Save profile</Button>
      </Stack>
    </Box>}
  </CandidatePage>;
};