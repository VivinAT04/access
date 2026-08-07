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

export function RegisterScreen({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const {
    register,
  } =
    useAuth();

  const [
    fullName,
    setFullName,
  ] =
    useState("");

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
      !fullName.trim()
      || !email.trim()
      || !password
    ) {
      setError(
        "Complete all fields.",
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(
        fullName.trim(),
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
          : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>
        Create account
      </Title>

      <Subtitle>
        Your Aksess account works
        across web and mobile.
      </Subtitle>

      <Input
        onChangeText={
          setFullName
        }
        placeholder="Full name"
        value={
          fullName
        }
      />

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
          label="Create account"
          onPress={() =>
            void submit()
          }
        />
      )}

      <SecondaryButton
        label="Back to sign in"
        onPress={
          onLogin
        }
      />
    </Screen>
  );
}
