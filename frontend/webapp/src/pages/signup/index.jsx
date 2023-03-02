import { Anchor, Button, Paper, Stack, Text, Title } from "@mantine/core";
import React, { useMemo } from "react";
import SignupForm from "../../forms/signup";
import keyboardImage from "../../assets/images/keyboard.jpg";
import "./style.scss";
import { MailForward } from "tabler-icons-react";

const SignupPage = () => {
  const mailtoUrl = useMemo(() => {
    return "mailto:s056820@htw-berlin.de?subject=%5BH8%20M8%20Access%20Request%5D&body=Hello%2C%20I%20would%20like%20to%20receive%20infos%20about%20the%20H8%20M8%20project.%20Please%20get%20back%20to%20me!%0D%0A%0D%0A%5BENTER%20YOUR%20CUSTOM%20TEXT%20HERE%5D";
  }, []);

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
      <Paper className="wbs-signup-container" shadow="lg" p="xl" withBorder>
        <Stack align="center" mb="md" spacing="xs">
          <Title order={3}>Request Access</Title>
          <Text color="dimmed" size="sm" align="center" mt={5}>
            If you would like receive info about the H8 M8 project and request
            access to the statistics dashboard, please get in contact with us.
          </Text>
          <Text color="dimmed" size="sm" align="center" mt={5}>
            {"Already own an account? "}
            <Anchor href="/signin" size="sm">
              Sign in here.
            </Anchor>
          </Text>
        </Stack>
        {/* <SignupForm onSuccess={handleFormSubmitSuccess} /> */}
        <Button
          mt="lg"
          component="a"
          href={mailtoUrl}
          fullWidth
          variant="gradient"
          gradient={{ from: "teal", to: "blue", deg: 60 }}
          radius="xl"
          size="xl"
          rightIcon={<MailForward size={28} strokeWidth={1.8} />}
        >
          Contact Us
        </Button>
      </Paper>
    </div>
  );
};

export default SignupPage;
