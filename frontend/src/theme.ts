import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    body: "'DM Sans', sans-serif",
    heading: "'Space Grotesk', sans-serif",
  },
  semanticTokens: {
    colors: {
      "app.canvas": { default: "#f5f7f2", _dark: "#101210" },
      "app.sidebar": { default: "#ffffff", _dark: "#151715" },
      "app.panel": { default: "#ffffff", _dark: "#171917" },
      "app.field": { default: "#f7f9f5", _dark: "#111311" },
      "app.text": { default: "#20261e", _dark: "#f7f9f5" },
      "app.muted": { default: "#65705f", _dark: "#9ca3af" },
      "app.subtle": { default: "#788174", _dark: "#6b7280" },
      "app.border": { default: "#dfe5db", _dark: "rgba(255, 255, 255, 0.14)" },
      "app.hover": { default: "rgba(32, 38, 30, 0.06)", _dark: "rgba(255, 255, 255, 0.10)" },
      "app.accentText": { default: "#45651a", _dark: "#b7e36c" },
      "app.warningBg": { default: "#fff4e5", _dark: "#542d0a" },
      "app.warningText": { default: "#8a4b08", _dark: "#ffe0b2" },
      "app.warningBorder": { default: "#f3c98a", _dark: "#87531d" },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "md",
        transitionProperty: "common",
        transitionDuration: "fast",
        _focusVisible: { boxShadow: "0 0 0 3px rgba(183, 227, 108, 0.35)" },
      },
      defaultProps: { colorScheme: "green" },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "app.field",
            borderColor: "app.border",
            _hover: { borderColor: "app.muted" },
            _focusVisible: { borderColor: "#8ebd4c", boxShadow: "0 0 0 1px #8ebd4c" },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "app.field",
          borderColor: "app.border",
          _hover: { borderColor: "app.muted" },
          _focusVisible: { borderColor: "#8ebd4c", boxShadow: "0 0 0 1px #8ebd4c" },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "app.canvas",
        color: "app.text",
      },
    },
  },
});

export default theme;