import {createStyles} from "@mantine/core";
import keyboardImage from "../../assets/images/keyboard.jpg";

export const useLandingPageStyles = createStyles((theme) => ({
  hero: {
    position: "relative",
    backgroundImage: `url(${keyboardImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "calc(100vh - 60px - 40px)",
  },

  container: {
    height: 620,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingBottom: theme.spacing.xl * 6,
    zIndex: 1,
    position: "relative",

    [theme.fn.smallerThan("sm")]: {
      height: 500,
      paddingBottom: theme.spacing.xl * 3,
    },
  },

  title: {
    color: theme.white,
    fontSize: 60,
    fontWeight: 900,
    lineHeight: 1.1,

    [theme.fn.smallerThan("sm")]: {
      fontSize: 40,
      lineHeight: 1.2,
    },

    [theme.fn.smallerThan("xs")]: {
      fontSize: 28,
      lineHeight: 1.3,
    },
  },

  description: {
    color: theme.white,
    maxWidth: 600,

    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100%",
      fontSize: theme.fontSizes.sm,
    },
  },

  control: {
    display: "flex",
    marginTop: theme.spacing.xl * 1.5,
    textAlign: "left",
    [theme.fn.smallerThan("sm")]: {
      width: "100%",
    },
  },

  header: {
    height: 60,
    backdropFilter: "blur(4px) saturate(0.4)",
    position: "sticky",
    left: 0,
    top: 0,
    width: "100%",
    zIndex: 10,
    background: "#2929291a",
    padding: "0 20px",
    boxShadow:
      "rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px",
  },

  footer: {
    minHeight: 400,
    backgroundColor: theme.black,
    color: theme.white,
    padding: "10px 20px 40px 20px",
  },

  headerSecondaryText: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  headerUserInfotext: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  pageContainer: {
    width: "100vw",
    height: "100vh",
    overflowY: "auto",
    position: "relative",
    /* background-image: linear-gradient(to right, #a8caba 0%, #5d4157 100%); */
    backgroundImage: "linear-gradient(60deg, #29323c 0%, #485563 100%)",
  },
}));
