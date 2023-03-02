import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import VALIDATION_PATTERNS, { createValidation } from "../validation";

const SignupForm = (props) => {
  const { onSuccess, isLoading } = props;

  const form = useForm({
    initialValues: {
      email: "",
      confirmemail: "",
    },

    validate: {
      email: (v) => createValidation(VALIDATION_PATTERNS.email, v),
      confirmemail: (value, values) => {
        return value === values.email ? null : "Emails do not match.";
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSuccess?.(values))}>
      <TextInput
        required
        label="Email"
        placeholder="your@email.com"
        variant="filled"
        {...form.getInputProps("email")}
      />

      <TextInput
        required
        label="Confirm Email"
        placeholder="your@email.com"
        variant="filled"
        {...form.getInputProps("confirmemail")}
      />
      <Button type="submit" fullWidth mt="xl" disabled={isLoading}>
        Request Access
      </Button>
    </form>
  );
};

export default SignupForm;
