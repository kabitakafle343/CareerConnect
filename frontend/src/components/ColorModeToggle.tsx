import { HStack, Switch, Text, useColorMode } from "@chakra-ui/react";

const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack spacing={2} flexShrink={0}>
      <Text fontSize="xs" color="app.muted">{colorMode === "dark" ? "Dark" : "Light"}</Text>
      <Switch
        aria-label="Toggle dark mode"
        colorScheme="green"
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode}
      />
    </HStack>
  );
};

export default ColorModeToggle;