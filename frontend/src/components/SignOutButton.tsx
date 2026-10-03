import { useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { userLogout } from "../apis/query";
import TokenService from "../apis/tokenservice";

const SignOutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = () => {
    setIsLoggingOut(true);
    void userLogout().catch(() => undefined).finally(() => {
      TokenService.clearToken();
      window.location.replace("/");
    });
  };

  return <Button aria-label="Log out" variant="outline" color="app.text" borderColor="app.border" leftIcon={<Text fontSize="lg">↗</Text>} onClick={signOut} isLoading={isLoggingOut} loadingText="Signing out">Log out</Button>;
};

export default SignOutButton;