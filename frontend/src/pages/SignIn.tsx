

import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input, InputGroup, InputRightElement, Link as ChakraLink, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import TokenService from "../apis/tokenservice";
import { userLogin } from "../apis/query";
import { routes } from "../route/route.constant";
import ColorModeToggle from "../components/ColorModeToggle";

type SignInValues = {
  email: string;
  password: string;
};

const signInSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "Unable to sign in. Please check your credentials and try again.";
};



export const SignIn = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: yupResolver(signInSchema) });
  const onSubmit = async (values: SignInValues) => {
    setServerError("");

    try {
      const response= await userLogin(values)
    TokenService.setToken({access:response.data?.accessToken});

   

    
      navigate(routes.DASHBOARD);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <Box minH="100vh" display="grid" placeItems="center" p={{ base: 0, md: 6, lg: 8 }} bg="app.canvas" color="app.text">
      <Box
        position="relative"
        w="full"
        maxW="7xl"
        minH={{ base: "100vh", lg: "min(790px, calc(100vh - 64px))" }}
        display="grid"
        gridTemplateColumns={{ base: "1fr", lg: "1.12fr 0.88fr" }}
        bg="app.panel"
        borderWidth={{ base: 0, md: 1 }}
        borderColor="app.border"
        borderRadius={{ base: 0, md: "2xl" }}
        boxShadow={{ base: "none", md: "0 28px 80px rgba(17, 34, 24, 0.16)" }}
        overflow="hidden"
      >
        <Box position="absolute" top={{ base: 5, md: 7 }} right={{ base: 5, md: 7 }} zIndex={2}>
          <ColorModeToggle />
        </Box>

        <Box
          as="section"
          position="relative"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          p={{ base: 6, md: 10, lg: 12 }}
          color="#f4f4e9"
          bg="#143c2d"
          backgroundImage="radial-gradient(rgba(225, 242, 205, 0.09) 1px, transparent 1px), linear-gradient(145deg, #194633 0%, #143c2d 54%, #102f25 100%)"
          backgroundSize="22px 22px, cover"
        >
          <HStack mb={{ base: 10, md: 14 }} spacing={3}>
            <Box display="grid" placeItems="center" w={10} h={10} borderRadius="md" bg="#d9f278" color="#173a2a" fontWeight="900" fontSize="sm">CC</Box>
            <Text fontFamily="heading" fontWeight="700" fontSize="lg">CareerConnect</Text>
          </HStack>

          <Text color="#d9f278" fontSize="xs" fontWeight="800" letterSpacing="0.14em" textTransform="uppercase">For job seekers and employers</Text>
          <Heading mt={3} maxW="xl" fontSize={{ base: "3xl", md: "4xl" }} lineHeight="1.08" color="#f4f4e9">
            Find work. Hire people.
          </Heading>
          <Text mt={4} maxW="lg" color="whiteAlpha.800" fontSize={{ base: "md", md: "lg" }}>
            CareerConnect brings job seekers and employers together.
          </Text>

          <SimpleGrid mt={8} maxW="md" columns={2} spacing={5}>
            <Box pt={3} borderTopWidth="1px" borderColor="whiteAlpha.400">
              <Text color="#d9f278" fontSize="xs" fontWeight="800" letterSpacing="0.1em">CANDIDATES</Text>
              <Text mt={2} fontWeight="700">Find a job</Text>
              <Text mt={1} color="whiteAlpha.800" fontSize="sm">Search and apply.</Text>
            </Box>
            <Box pt={3} borderTopWidth="1px" borderColor="whiteAlpha.400">
              <Text color="#d9f278" fontSize="xs" fontWeight="800" letterSpacing="0.1em">EMPLOYERS</Text>
              <Text mt={2} fontWeight="700">Hire people</Text>
              <Text mt={1} color="whiteAlpha.800" fontSize="sm">Post jobs and review applicants.</Text>
            </Box>
          </SimpleGrid>

        </Box>

        <Box as="section" display="flex" alignItems="center" justifyContent="center" p={{ base: 6, md: 10, lg: 14 }} pt={{ base: 8, md: 12, lg: 16 }}>
          <Box w="full" maxW="sm">
            <Text mb={3} color="app.accentText" fontSize="xs" fontWeight="800" letterSpacing="0.14em" textTransform="uppercase">Your account</Text>
            <Heading size="xl" color="app.text">Welcome back.</Heading>
            <Text mt={3} mb={8} color="app.muted">Sign in to continue.</Text>
            <VStack as="form" align="stretch" spacing={5} onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input id="email" type="email" autoComplete="email" size="lg" {...register("email")} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <InputGroup size="lg">
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" pr="4.5rem" {...register("password")} />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" variant="ghost" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              {serverError && <Text p={3} borderRadius="md" bg="red.50" color="red.600" fontSize="sm" role="alert">{serverError}</Text>}

              <Button type="submit" h={12} colorScheme="green" isLoading={isSubmitting} loadingText="Signing in...">Sign in</Button>
            </VStack>
            <Text mt={8} color="app.muted" fontSize="sm" textAlign="center">
              New here? <ChakraLink as={Link} to="/signup" color="app.accentText" fontWeight="700">Create an account</ChakraLink>
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignIn