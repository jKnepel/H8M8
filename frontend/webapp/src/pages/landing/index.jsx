import React, { useCallback, useEffect } from "react";
import {
  Button,
  Container,
  createStyles,
  Flex,
  Group,
  Image,
  Menu,
  Overlay,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate } from "react-router";
import keyboardImage from "../../assets/images/keyboard.jpg";
import logo from "../../assets/icons/favicon.png";
import "./style.scss";
import { Logout, UserCircle } from "tabler-icons-react";
import IdenticonAvatar from "../../components/identicon_avatar";
import { Footer } from "../../components/footer";
import { useSelector } from "react-redux";
import {
  selectIsSignedIn,
  selectIsSignedOut,
  selectUsername,
} from "../../redux/ducks/auth-duck/auth.duck.selectors";
import { hydrate } from "../../redux/ducks/auth-duck/auth-duck.thunks";
import { useAppDispatch } from "../../redux/store";
import { useLandingPageStyles } from "./styles";

const LandingPage = () => {
  const { classes } = useLandingPageStyles();
  const username = useSelector(selectUsername);
  const isSignedIn = useSelector(selectIsSignedIn);
  const isSignedOut = useSelector(selectIsSignedOut);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const goToSignIn = useCallback(() => {
    navigate("/signin");
  }, [navigate]);
  const goToSignUp = useCallback(() => {
    navigate("/signup");
  }, [navigate]);
  const goToDashboard = useCallback(() => {
    navigate("/home");
  }, [navigate]);
  const goToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  useEffect(() => {
    if (!isSignedOut) dispatch(hydrate());
  }, [dispatch, isSignedOut]);

  const signOut = useCallback(() => {
    dispatch({ type: "AUTH/SIGN_OUT" });
  }, [dispatch]);

  return (
    <div className={classes.pageContainer}>
      <Group position="apart" className={classes.header}>
        <Group>
          <Image
            src={logo}
            height={30}
            width={30}
            radius="sm"
            fit="contain"
            className="wbs-landing-header__logo"
          />
          <div className="wbs-landing-header-primary-text">
            <Text color="white" fw={500} fz="md">
              H8 M8
            </Text>
            <Text color="white" fw={500} fz="md">
              HATE MATE
            </Text>
          </div>
          <Text color="white" fz="md" className={classes.headerSecondaryText}>
            Automatic Hatespeech Detection
          </Text>
        </Group>
        {isSignedIn ? (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group>
                  <Group spacing="xs" className={classes.headerUserInfotext}>
                    <Text color="gray.4" fw={600}>
                      {username}
                    </Text>
                  </Group>
                  <IdenticonAvatar id={username} size="md" radius="xs" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item icon={<Logout size={14} />} onClick={signOut}>
                Sign Out
              </Menu.Item>
              <Menu.Item
                component="a"
                onClick={goToProfile}
                icon={<UserCircle size={14} />}
              >
                Profile
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group>
            <Button
              variant="gradient"
              size="sm"
              radius="sm"
              onClick={goToSignIn}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              radius="sm"
              onClick={goToSignUp}
            >
              Sign Up
            </Button>
          </Group>
        )}
      </Group>
      <div className={classes.hero}>
        <Overlay
          gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
          opacity={1}
          zIndex={0}
        />
        <Container className={classes.container}>
          <Title className={classes.title}>Protect your chats with H8M8</Title>
          <Text className={classes.description} size="xl" mt="xl">
            Take action of your chats and use artificial intelligence to protect
            your favourite chat groups from hate speech. Gain detailed analytics
            about what is happening in your chat groups.
          </Text>

          <Flex
            gap="md"
            justify="flex-start"
            align="flex-start"
            direction="row"
            wrap="wrap"
            className={classes.control}
          >
            {isSignedIn && (
              <Button
                variant="gradient"
                size="lg"
                radius="md"
                onClick={goToDashboard}
              >
                Show Dashboard
              </Button>
            )}
          </Flex>
        </Container>
      </div>
      <Footer
        data={[
          {
            title: "About",
            links: [
              {
                label: "Project Info",
                link: "/info",
              },
              {
                label: "HTW Berlin",
                link: "https://www.htw-berlin.de",
                external: true,
              },
            ],
          },
          {
            title: "Dashboard",
            links: [
              {
                label: "Home",
                link: "/home",
              },
              {
                label: "Statistics",
                link: "/dashboard",
              },
              {
                label: "Project",
                link: "/info",
              },
            ],
          },
          {
            title: "Join Us!",
            links: [
              {
                label: "Sign in",
                link: "/signin",
              },
              {
                label: "Sign up",
                link: "/signup",
              },
            ],
          },
        ]}
      ></Footer>
    </div>
  );
};

export default LandingPage;
