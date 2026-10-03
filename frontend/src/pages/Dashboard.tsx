import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { deleteAdminCompany, deleteAdminJob, getAdminOverview, getEmployerDashboard, getOpenJobs, type AdminOverview, type EmployerDashboard } from "../apis/query";
import TokenService from "../apis/tokenservice";
import ColorModeToggle from "../components/ColorModeToggle";
import SignOutButton from "../components/SignOutButton";
import { useRef, useState } from "react";

type Role = "admin" | "employer" | "candidate";
type NavItem = { label: string; path: string; icon: string };
type DeleteTarget =
  | { kind: "company"; id: string; name: string; jobsCount: number }
  | { kind: "job"; id: string; name: string };

const navigation: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  ],
  employer: [
    { label: "Dashboard", path: "/dashboard", icon: "⌂" },
    { label: "Post a job", path: "/create-job", icon: "+" },
    { label: "My jobs", path: "/my-jobs", icon: "▤" },
    { label: "Applicants", path: "/applicants", icon: "♧" },
    { label: "Company profile", path: "/company", icon: "▥" },
  ],
  candidate: [
    { label: "Dashboard", path: "/dashboard", icon: "⌂" },
    { label: "Browse jobs", path: "/jobs", icon: "⌕" },
    { label: "Applications", path: "/applications", icon: "▤" },
    { label: "Saved jobs", path: "/saved-jobs", icon: "☆" },
    { label: "My profile", path: "/profile", icon: "♙" },
  ],
};

const roleTitles: Record<Role, string> = {
  admin: "Admin dashboard",
  employer: "Employer dashboard",
  candidate: "Candidate dashboard",
};

const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  employer: "Employer",
  candidate: "Candidate",
};

const Dashboard = () => {
  const details = TokenService.getTokenDetails();
  const role: Role = details?.role ?? "candidate";
  const name = details?.name ?? details?.email?.split("@")[0] ?? roleLabels[role];
  const employerQuery = useQuery({ queryKey: ["employer-dashboard"], queryFn: getEmployerDashboard, enabled: role === "employer" });
  const jobsQuery = useQuery({ queryKey: ["open-jobs"], queryFn: getOpenJobs, enabled: role === "candidate" });
  const adminQuery = useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview, enabled: role === "admin" });

  return (
    <Flex minH="100vh" bg="app.canvas" color="app.text">
      <Box as="aside" w={{ base: "72px", md: "255px" }} flexShrink={0} bg="app.sidebar" borderRight="1px solid" borderColor="app.border" p={{ base: 2, md: 5 }}>
        <HStack px={{ base: 2, md: 3 }} pb={{ base: 7, md: 12 }} spacing={3}>
          <Flex w="30px" h="30px" bg="#b7e36c" color="#172011" borderRadius="9px" align="center" justify="center" fontWeight="bold">C</Flex>
          <Text display={{ base: "none", md: "block" }} fontFamily="heading" fontWeight="bold">CareerConnect</Text>
        </HStack>
        <Text display={{ base: "none", md: "block" }} px={3} pb={3} fontSize="xs" color="app.muted" textTransform="uppercase" letterSpacing="0.14em">Workspace</Text>
        <VStack align="stretch" spacing={1}>
          {navigation[role].map((item) => <Button key={item.path} as={NavLink} to={item.path} justifyContent={{ base: "center", md: "flex-start" }} gap={3} px={3} variant="ghost" color="app.muted" _hover={{ bg: "app.hover", color: "app.text" }} _activeLink={{ bg: "app.hover", color: "app.text", boxShadow: "inset 3px 0 #b7e36c" }}><Text fontSize="lg">{item.icon}</Text><Text display={{ base: "none", md: "block" }}>{item.label}</Text></Button>)}
        </VStack>
        <Text display={{ base: "none", md: "block" }} mt="auto" pt={10} px={3} fontSize="xs" color="app.muted">● All systems operational</Text>
      </Box>

      <Box flex="1" maxW="1180px" mx="auto" px={{ base: 5, md: 12 }} py={{ base: 6, md: 10 }}>
        <Flex as="header" align="center" gap={5} pb={6} mb={8} borderBottom="1px solid" borderColor="app.border">
          <Box minW={0}>
            <Text fontSize="xs" color="app.muted" textTransform="uppercase">{roleLabels[role]} workspace</Text>
            <Heading mt={1} size="lg" fontFamily="heading">{roleTitles[role]}</Heading>
          </Box>
          <Spacer />
          <HStack spacing={3}>
            <ColorModeToggle />
            <Flex flexShrink={0} w="36px" h="36px" borderRadius="full" bg="#323c31" color="#c9ee8e" align="center" justify="center" fontWeight="bold" aria-label={`${name}, ${roleLabels[role]}`}>
              {name.charAt(0).toUpperCase()}
            </Flex>
            <Box display={{ base: "none", sm: "block" }} maxW={{ sm: "130px", md: "180px" }}>
              <Text noOfLines={1} fontSize="sm" fontWeight="bold">{name}</Text>
              <Text noOfLines={1} fontSize="xs" color="app.muted">{roleLabels[role]}</Text>
            </Box>
            <SignOutButton />
          </HStack>
        </Flex>
        {role === "employer" && <EmployerView data={employerQuery.data} isLoading={employerQuery.isLoading} isError={employerQuery.isError} />}
        {role === "candidate" && <CandidateView jobs={jobsQuery.data ?? []} isLoading={jobsQuery.isLoading} />}
        {role === "admin" && <AdminView data={adminQuery.data} isLoading={adminQuery.isLoading} isError={adminQuery.isError} />}
      </Box>
    </Flex>
  );
};

const StatCard = ({ label, value, color, hint }: { label: string; value: number | string; color: string; hint: string }) => <Box minH="150px" border="1px solid" borderColor="app.border" borderTop="3px solid" borderTopColor={color} borderRadius="md" bg="app.panel" p={5} transition="all 160ms ease" _hover={{ transform: "translateY(-2px)", borderColor: color, boxShadow: "md" }}><Text color="app.muted" fontSize="sm" fontWeight="600">{label}</Text><Heading mt={3} size="xl" fontFamily="heading">{value}</Heading><Text mt={2} color="app.subtle" fontSize="xs">{hint}</Text></Box>;

const EmployerView = ({ data, isLoading, isError }: { data?: Awaited<ReturnType<typeof getEmployerDashboard>>; isLoading: boolean; isError: boolean }) => <Stack spacing={10} pt={10}><Flex align={{ base: "flex-start", md: "center" }} gap={5} direction={{ base: "column", md: "row" }}><Box><Heading size="md" fontFamily="heading">Good morning, {data?.company.name ?? "employer"}</Heading><Text mt={2} color="app.muted" fontSize="sm">Here is what is happening with your hiring pipeline.</Text></Box><Spacer /><Button as={NavLink} to="/create-job" bg="#b7e36c" color="#172011" _hover={{ bg: "#c9ee8e" }}>+ Post a job</Button></Flex>{isError && <Box p={4} borderRadius="md" bg="app.warningBg" color="app.warningText" fontSize="sm">Create your company profile to start posting jobs.</Box>}<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}><StatCard label="Active jobs" value={isLoading ? "-" : data?.stats.activeJobs ?? 0} color="#b7e36c" hint="Across your workspace" /><StatCard label="Total applicants" value={isLoading ? "-" : data?.stats.totalApplicants ?? 0} color="#7bb8ee" hint="Across your workspace" /><StatCard label="Hired" value={isLoading ? "-" : data?.stats.hired ?? 0} color="#f1a66b" hint="Across your workspace" /></SimpleGrid><Box><Flex mb={4} align="end"><Box><Text fontSize="xs" color="app.muted" textTransform="uppercase" letterSpacing="0.14em">Pipeline</Text><Heading mt={1} size="md" fontFamily="heading">Your job postings</Heading></Box><Spacer /><Button as={NavLink} to="/my-jobs" variant="link" color="app.accentText" size="sm">View all jobs →</Button></Flex><JobTable jobs={data?.jobs ?? []} isLoading={isLoading} /></Box></Stack>;

const JobTable = ({ jobs, isLoading }: { jobs: EmployerDashboard["jobs"]; isLoading: boolean }) => <Box overflowX="auto" border="1px solid" borderColor="app.border" borderRadius="md" bg="app.sidebar"><Grid minW="620px" templateColumns="1.6fr 1fr .8fr .7fr" gap={4} px={5} py={4} borderBottom="1px solid" borderColor="app.border" color="app.muted" fontSize="xs" textTransform="uppercase"><GridItem>Job title</GridItem><GridItem>Location</GridItem><GridItem>Applicants</GridItem><GridItem>Status</GridItem></Grid>{jobs.length ? jobs.map((job) => <Grid key={job._id} minW="620px" templateColumns="1.6fr 1fr .8fr .7fr" gap={4} px={5} py={4} borderBottom="1px solid" borderColor="app.border" alignItems="center" fontSize="sm"><Text fontWeight="bold">{job.title}</Text><Text color="app.muted">{job.location}</Text><Text color="app.muted">{job.applicantCount}</Text><Badge w="fit-content" colorScheme={job.status === "open" ? "green" : "gray"} borderRadius="full">{job.status}</Badge></Grid>) : <Text p={6} color="app.muted" fontSize="sm">{isLoading ? "Loading your postings..." : "No job postings yet. Your next great hire starts here."}</Text>}</Box>;

const CandidateView = ({ jobs, isLoading }: { jobs: Awaited<ReturnType<typeof getOpenJobs>>; isLoading: boolean }) => <Stack spacing={10} pt={10}><Flex align={{ base: "flex-start", md: "center" }} gap={5} direction={{ base: "column", md: "row" }}><Box><Heading size="md" fontFamily="heading">Find your next opportunity</Heading><Text mt={2} color="app.muted" fontSize="sm">Explore open roles matched to your career goals.</Text></Box><Spacer /><Button as={NavLink} to="/jobs" bg="#b7e36c" color="#172011">Browse jobs</Button></Flex><Box><Flex align="end" justify="space-between" mb={4}><Box><Text color="app.muted" fontSize="xs" textTransform="uppercase">Fresh opportunities</Text><Heading mt={1} size="md" fontFamily="heading">Latest open jobs</Heading></Box><Button as={NavLink} to="/jobs" variant="link" color="app.accentText" size="sm">See all jobs</Button></Flex><SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>{isLoading ? <Text color="app.muted">Loading open jobs...</Text> : jobs.slice(0, 6).map((job) => <Box key={job._id} minH="190px" p={5} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel" transition="all 160ms ease" _hover={{ transform: "translateY(-2px)", borderColor: "app.accentText", boxShadow: "md" }}><Text color="app.accentText" fontSize="xs" fontWeight="700" textTransform="uppercase">{job.jobType.replace("-", " ")}</Text><Heading mt={4} size="md" fontFamily="heading" noOfLines={2}>{job.title}</Heading><Text mt={2} color="app.muted" fontSize="sm">{job.location}</Text><Button as={NavLink} to={`/jobs/${job._id}`} mt={5} variant="link" color="app.accentText" size="sm">View role →</Button></Box>)}</SimpleGrid>{!isLoading && jobs.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No open roles yet</Heading><Text mt={2} color="app.muted">New opportunities will appear here.</Text></Box>}</Box></Stack>;

const AdminView = ({ data, isLoading, isError }: { data?: AdminOverview; isLoading: boolean; isError: boolean }) => {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<"all" | "with-jobs" | "without-jobs">("all");
  const [jobStatusFilter, setJobStatusFilter] = useState<"all" | "open" | "closed">("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const closeDeleteDialog = () => {
    setDeleteTarget(undefined);
    onClose();
  };
  const companyDelete = useMutation({
    mutationFn: deleteAdminCompany,
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      closeDeleteDialog();
    },
    onError: () => setActionError("Could not delete the company. Please try again."),
  });
  const jobDelete = useMutation({
    mutationFn: deleteAdminJob,
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      closeDeleteDialog();
    },
    onError: () => setActionError("Could not delete the job. Please try again."),
  });
  const openDeleteDialog = (target: DeleteTarget) => {
    setActionError("");
    setDeleteTarget(target);
    onOpen();
  };
  const confirmDelete = () => {
    if (deleteTarget?.kind === "company") companyDelete.mutate(deleteTarget.id);
    if (deleteTarget?.kind === "job") jobDelete.mutate(deleteTarget.id);
  };
  const isDeleting = companyDelete.isPending || jobDelete.isPending;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleCompanies = (data?.companies ?? []).flatMap((company) => {
    const companyMatchesSearch = !normalizedSearch || [
      company.name,
      company.owner?.name,
      company.owner?.email,
      company.location,
      company.website,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    const matchesCompanyFilter = companyFilter === "all"
      || (companyFilter === "with-jobs" && company.jobs.length > 0)
      || (companyFilter === "without-jobs" && company.jobs.length === 0);
    const matchingJobs = company.jobs.filter((job) => {
      const matchesStatus = jobStatusFilter === "all" || job.status === jobStatusFilter;
      const matchesSearch = !normalizedSearch || companyMatchesSearch || [job.title, job.location, job.jobType].some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesStatus && matchesSearch;
    });

    if (!matchesCompanyFilter || (!companyMatchesSearch && matchingJobs.length === 0)) return [];
    return [{ ...company, jobs: matchingJobs }];
  });

  return <Stack spacing={8} pt={10}>
  <Box><Heading size="md" fontFamily="heading">Platform overview</Heading><Text mt={2} color="app.muted" fontSize="sm">Review all registered companies and their job listings.</Text></Box>
  {isError && <Box p={4} borderRadius="md" bg="app.warningBg" color="app.warningText" fontSize="sm">Admin overview could not be loaded. Confirm that you are signed in as an admin.</Box>}
  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
    <StatCard label="Registered users" value={isLoading ? "-" : data?.stats.users ?? 0} color="#b7e36c" hint="All account types" />
    <StatCard label="Companies" value={isLoading ? "-" : data?.stats.companies ?? 0} color="#7bb8ee" hint="Registered on the platform" />
    <StatCard label="Jobs" value={isLoading ? "-" : data?.stats.jobs ?? 0} color="#f1a66b" hint={`${data?.stats.openJobs ?? 0} currently open`} />
    <StatCard label="Applications" value={isLoading ? "-" : data?.stats.applications ?? 0} color="#c58ee8" hint="Across all companies" />
  </SimpleGrid>
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
    <FormControl>
      <FormLabel htmlFor="admin-search" mb={1} fontSize="xs" color="app.muted">Search</FormLabel>
      <Input id="admin-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Company, owner, or job" bg="app.panel" />
    </FormControl>
    <FormControl>
      <FormLabel htmlFor="company-filter" mb={1} fontSize="xs" color="app.muted">Companies</FormLabel>
      <Select id="company-filter" value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value as typeof companyFilter)} bg="app.panel">
        <option value="all">All companies</option>
        <option value="with-jobs">With jobs</option>
        <option value="without-jobs">Without jobs</option>
      </Select>
    </FormControl>
    <FormControl>
      <FormLabel htmlFor="job-status-filter" mb={1} fontSize="xs" color="app.muted">Job status</FormLabel>
      <Select id="job-status-filter" value={jobStatusFilter} onChange={(event) => setJobStatusFilter(event.target.value as typeof jobStatusFilter)} bg="app.panel">
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </Select>
    </FormControl>
  </SimpleGrid>
  {data && <Text mt={-5} color="app.muted" fontSize="xs">Showing {visibleCompanies.length} of {data.companies.length} companies</Text>}
  {isLoading && <Text color="app.muted">Loading companies and jobs...</Text>}
  {!isLoading && !isError && data?.companies.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No companies registered yet</Heading><Text mt={2} color="app.muted">Company accounts will appear here.</Text></Box>}
  <Stack spacing={4}>
    {!isLoading && !isError && data && data.companies.length > 0 && visibleCompanies.length === 0 && <Box p={8} textAlign="center" border="1px dashed" borderColor="app.border" borderRadius="md"><Heading size="sm">No matching results</Heading><Text mt={2} color="app.muted">Try a different search or filter.</Text></Box>}
    {visibleCompanies.map((company) => <Box key={company._id} id={`company-${company._id}`} p={{ base: 4, md: 5 }} border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel">
      <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" gap={3} direction={{ base: "column", md: "row" }}>
        <Box><Heading size="sm">{company.name}</Heading><Text mt={1} color="app.muted" fontSize="sm">{company.owner?.name ?? "Owner unavailable"}{company.owner?.email ? ` · ${company.owner.email}` : ""}</Text></Box>
        <HStack>
          <Button
            size="sm"
            colorScheme="red"
            variant="ghost"
            isLoading={companyDelete.isPending && companyDelete.variables === company._id}
            onClick={() => openDeleteDialog({ kind: "company", id: company._id, name: company.name, jobsCount: company.jobs.length })}
          >
            Delete company
          </Button>
        </HStack>
      </Flex>
      <SimpleGrid mt={4} columns={{ base: 1, sm: 2 }} spacing={3} color="app.muted" fontSize="sm">
        <Text>Location: {company.location || "Not provided"}</Text>
        <Text>Website: {company.website || "Not provided"}</Text>
      </SimpleGrid>
      {company.description && <Text mt={3} color="app.muted" fontSize="sm">{company.description}</Text>}
      <Box mt={5} pt={4} borderTop="1px solid" borderColor="app.border">
        <Flex align="center" justify="space-between" mb={3}><Heading size="xs" color="app.muted" textTransform="uppercase">Job listings</Heading><Badge>{company.jobs.length}</Badge></Flex>
        {company.jobs.length === 0 ? <Text color="app.subtle" fontSize="sm">{jobStatusFilter === "all" && !normalizedSearch ? "No jobs posted." : "No jobs match the current filters."}</Text> : <Stack spacing={2}>{company.jobs.map((job) => <Flex key={job._id} align={{ base: "flex-start", sm: "center" }} justify="space-between" gap={3} p={3} borderRadius="md" bg="app.field" direction={{ base: "column", sm: "row" }}>
          <Box><Text fontWeight="600" fontSize="sm">{job.title}</Text><Text mt={1} color="app.muted" fontSize="xs">{job.location} · {job.jobType.replace("-", " ")}</Text></Box>
          <HStack>
            <Badge colorScheme={job.status === "open" ? "green" : "gray"}>{job.status}</Badge>
            <Button
              size="xs"
              colorScheme="red"
              variant="ghost"
              isLoading={jobDelete.isPending && jobDelete.variables === job._id}
              onClick={() => openDeleteDialog({ kind: "job", id: job._id, name: job.title })}
            >
              Delete job
            </Button>
          </HStack>
        </Flex>)}</Stack>}
      </Box>
    </Box>)}
  </Stack>
  <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteDialog} isCentered>
    <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(3px)">
      <AlertDialogContent mx={4} overflow="hidden" border="1px solid" borderColor="app.border" borderRadius="xl" bg="app.panel" boxShadow="2xl">
        <Box h="2px" bg="red.500" />
        <AlertDialogHeader pt={6} pb={2} fontFamily="heading" fontSize="xl">
          Delete {deleteTarget?.kind === "company" ? "company" : "job"}?
        </AlertDialogHeader>
        <AlertDialogBody pb={2}>
          <Box p={4} border="1px solid" borderColor="red.200" borderRadius="md" bg="red.50" _dark={{ bg: "rgba(150, 35, 35, 0.16)", borderColor: "rgba(255, 130, 130, 0.35)" }}>
            <Text color="red.700" _dark={{ color: "red.200" }} fontWeight="700">{deleteTarget?.name}</Text>
            <Text mt={2} color="red.700" _dark={{ color: "red.200" }} fontSize="sm">
              {deleteTarget?.kind === "company"
                ? `This will also remove ${deleteTarget.jobsCount} job${deleteTarget.jobsCount === 1 ? "" : "s"} and all related applications.`
                : "All applications for this job will also be removed."}
            </Text>
          </Box>
          <Text mt={4} color="app.muted" fontSize="sm">This action cannot be undone.</Text>
          {actionError && <Text mt={3} color="red.600" fontSize="sm" role="alert">{actionError}</Text>}
        </AlertDialogBody>
        <AlertDialogFooter pt={5}>
          <Button ref={cancelRef} variant="ghost" onClick={closeDeleteDialog}>Cancel</Button>
          <Button ml={3} colorScheme="red" onClick={confirmDelete} isLoading={isDeleting} loadingText="Deleting...">Delete</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
</Stack>;
};

export default Dashboard;
