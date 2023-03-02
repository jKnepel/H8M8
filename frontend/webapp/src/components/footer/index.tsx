import React from "react";
import { createStyles, Text, Container, ActionIcon, Group, Image } from "@mantine/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import htwLogo from "../../assets/images/S20_HTW_Berlin_Logo_neg_WEISS_RGB.png";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "tabler-icons-react";

const useStyles = createStyles((theme) => ({
  footer: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor: theme.black,
    position: "relative"
  },

  logo: {
    maxWidth: 200,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  project: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  wrapper: {
    width: 160,
    textAlign: "right"
  },

  link: {
    display: "block",
    color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xs / 2,
    color: theme.white,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  social: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
    },
  },

  iconContainer: {
    position: "absolute",
    color: "white",
    top: "5px",
    left: "50%"
  }
}));

interface FooterLinksProps {
  data: {
    title: string;
    links: { label: string; link: string, external?: boolean }[];
  }[];
}

export function Footer({ data }: FooterLinksProps) {
  const { classes } = useStyles();

  const groups = data.map((group) => {
    const links = group.links.map((link, index) => {
      return link.external ?
        <a
          rel="noopener noreferrer"
          key={index}
          className={classes.link}
          href={link.link}
          target={"_blank"}>
          {link.label}
        </a> :
        <NavLink
          rel="noopener noreferrer"
          key={index}
          className={classes.link}
          to={link.link}
        >
          {link.label}
        </NavLink>;
    });

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <div className={classes.iconContainer}>
        <ChevronDown />
      </div>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Image src={htwLogo} />
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.project}>
        <Text color="white">
          Dieses Gruppenprojekt entstand ium Rahmen des Moduls <i>System Frameworks and Development</i> an der HTW Berlin im Studiengang Angewandte Informatik (M).
        </Text>
      </Container>
      <Container className={classes.afterFooter}>
        <Text color="dimmed" size="sm">
          © 2023 H8M8 2022 All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}
