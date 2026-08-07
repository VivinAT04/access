import {
  useState,
} from "react";

import {
  ActivityIndicator,
} from "react-native";

import {
  useAuth,
} from "../auth/auth-context";

import {
  Screen,
} from "../components/screen";

import {
  Input,
  Message,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

export function LoginScreen({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const {
    login,
  } =
    useAuth();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  async function submit() {
    if (
      !email.trim()
      || !password
    ) {
      setError(
        "Enter your email and password.",
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(
        email.trim(),
        password,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : "Sign in failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>
        Aksess
      </Title>

      <Subtitle>
        Your focus and wellbeing space,
        wherever you are.
      </Subtitle>

      <Input
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={
          setEmail
        }
        placeholder="Email"
        value={
          email
        }
      />

      <Input
        onChangeText={
          setPassword
        }
        placeholder="Password"
        secureTextEntry
        value={
          password
        }
      />

      {error ? (
        <Message error>
          {error}
        </Message>
      ) : null}

      {loading ? (
        <ActivityIndicator />
      ) : (
        <PrimaryButton
          label="Sign in"
          onPress={() =>
            void submit()
          }
        />
      )}

      <SecondaryButton
        label="Create account"
        onPress={
          onRegister
        }
      />
    </Screen>
  );
}
