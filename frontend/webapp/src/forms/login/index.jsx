import { Button, Group, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useCallback } from "react";
import VALIDATION_PATTERNS, { createValidation } from "../validation";

const LoginForm = (props) => {
  const { onSuccess, isLoading } = props;

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      username: (v) => createValidation(VALIDATION_PATTERNS.basic, v),
      password: (v) => createValidation(VALIDATION_PATTERNS.basic, v),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSuccess?.(values))}>
      <TextInput
        required
        label="Username"
        placeholder="your username here"
        variant="filled"
        {...form.getInputProps("username")}
      />

      <PasswordInput
        required
        label="Password"
        placeholder="your password here"
        variant="filled"
        {...form.getInputProps("password")}
      />
      <Button type="submit" fullWidth mt="xl" disabled={isLoading}>
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
