

import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, Link as ChakraLink, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import HttpClient from "../apis/Intercept";
import ColorModeToggle from "../components/ColorModeToggle";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  role: "candidate" | "employer";
  phone?: string;
  profileImage?: FileList;
};

const signUpSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  role: yup.mixed<SignUpValues["role"]>().oneOf(["candidate", "employer"]).required("Choose an account type"),
  phone: yup.string().trim().optional(),
  profileImage: yup.mixed<FileList>().optional(),
});

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Unable to create your account. Please try again.";
};

export const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "candidate";
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { role: initialRole },
  });

  const onSubmit = async (values: SignUpValues) => {
    setServerError("");
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("role", values.role);
    if (values.phone) formData.append("phone", values.phone);
    if (values.profileImage?.[0]) formData.append("profileImage", values.profileImage[0]);

    try {
      await HttpClient.post("/auth/signup", formData);
      navigate("/");
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <Box minH="100vh" display="grid" placeItems="center" p={{ base: 4, md: 8 }} bg="app.canvas" color="app.text">
      <Box position="fixed" top={4} right={4} zIndex={2}><ColorModeToggle /></Box>
      <Box as="section" w="full" maxW="2xl" p={{ base: 6, md: 10 }} bg="app.panel" borderWidth="1px" borderColor="app.border" boxShadow="2xl">
        <Text mb={4} color="orange.600" fontSize="xs" fontWeight="800" letterSpacing="0.14em" textTransform="uppercase">CareerConnect</Text>
        <Heading size="xl" color="app.text">Build what comes next</Heading>
        <Text mt={3} mb={8} color="app.muted">Create your account and find your next opportunity.</Text>
        <VStack as="form" align="stretch" spacing={4} onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">Full name</FormLabel>
            <Input id="name" autoComplete="name" {...register("name")} />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          <HStack align="start" spacing={4} flexDir={{ base: "column", md: "row" }}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="signup-email">Email</FormLabel>
              <Input id="signup-email" type="email" autoComplete="email" {...register("email")} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="phone">Phone <Text as="span" color="gray.500" fontWeight="400">(optional)</Text></FormLabel>
              <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            </FormControl>
          </HStack>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="signup-password">Password</FormLabel>
            <Input id="signup-password" type="password" autoComplete="new-password" {...register("password")} />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.role}>
            <FormLabel>Account type</FormLabel>
            <RadioGroup defaultValue="candidate">
              <HStack spacing={6}><Radio value="candidate" {...register("role")}>Candidate</Radio><Radio value="employer" {...register("role")}>Employer</Radio></HStack>
            </RadioGroup>
            <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="profileImage">Profile image <Text as="span" color="gray.500" fontWeight="400">(optional)</Text></FormLabel>
            <Input id="profileImage" type="file" accept="image/*" p={1} {...register("profileImage")} />
          </FormControl>
          {serverError && <Text p={3} bg="red.50" color="red.600" fontSize="sm" role="alert">{serverError}</Text>}
          <Button type="submit" colorScheme="orange" isLoading={isSubmitting} loadingText="Creating account...">Create account</Button>
        </VStack>
        <Text mt={6} color="app.muted" fontSize="sm" textAlign="center">Already have an account? <ChakraLink as={Link} to="/" color="app.accentText" fontWeight="700">Sign in</ChakraLink></Text>
      </Box>
    </Box>
  );
};

export default SignUp