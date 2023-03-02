import { Alert, Anchor, Paper, Stack, Text, Title } from "@mantine/core";
import React, { useCallback, useLayoutEffect } from "react";
import keyboardImage from "../../assets/images/keyboard.jpg";
import { useNavigate } from "react-router";
import { useAppDispatch } from "../../redux/store";
import { fetchToken } from "../../redux/ducks/auth-duck/auth-duck.thunks";
import { useSelector } from "react-redux";
import {
  selectIsLoading,
  selectIsSignedIn,
} from "../../redux/ducks/auth-duck/auth.duck.selectors";
import { useSearchParams } from "react-router-dom";
import LoginForm from "../../forms/login";
import "./style.scss";
import { AlertCircle } from "tabler-icons-react";

const SignInPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isSignedIn = useSelector(selectIsSignedIn);
  const isLoading = useSelector(selectIsLoading);

  const signIn = useCallback(
    ({ username, password }) => {
      dispatch(fetchToken({ username, password }));
    },
    [dispatch]
  );

  // useLayoutEffect, weil dadurch ein unötiger rerender verhindert wird vor dem navigate
  useLayoutEffect(() => {
    if (isSignedIn) {
      if (searchParams.get("redirect")) {
        navigate(searchParams.get("redirect"));
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [isSignedIn, navigate, searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: `url(${keyboardImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="inside-center--top"
    >
      <Paper className="wbs-signin-container" shadow="lg" p="xl" withBorder>
        <Stack align="center" mb="md" spacing="xs">
          <Title order={3}>Login</Title>
          <Text color="dimmed" size="sm" align="center" mt={5}>
            {"Don't have an account yet? "}
            <Anchor href="/signup" size="sm">
              Request access here.
            </Anchor>
          </Text>
        </Stack>
        {!isSignedIn && (
          <Alert mb="md" icon={<AlertCircle size={16} />} color="orange">You are now signed out!</Alert>
        )}
        <LoginForm onSuccess={signIn} isLoading={isLoading} />
      </Paper>
    </div>
  );
};

export default SignInPage;
