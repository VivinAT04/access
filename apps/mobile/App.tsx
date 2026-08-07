import {
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  StatusBar,
} from "expo-status-bar";

import {
  AuthProvider,
  useAuth,
} from "./src/auth/auth-context";

import {
  CalmScreen,
} from "./src/screens/calm-screen";

import {
  DashboardScreen,
  MobileSection,
} from "./src/screens/dashboard-screen";

import {
  FocusScreen,
} from "./src/screens/focus-screen";

import {
  LoginScreen,
} from "./src/screens/login-screen";

import {
  MoodScreen,
} from "./src/screens/mood-screen";

import {
  OfflineScreen,
} from "./src/screens/offline-screen";

import {
  RegisterScreen,
} from "./src/screens/register-screen";

import {
  TasksScreen,
} from "./src/screens/tasks-screen";

import {
  WearablesScreen,
} from "./src/screens/wearables-screen";

type AuthPage =
  | "login"
  | "register";

function Application() {
  const {
    user,
    loading,
  } =
    useAuth();

  const [
    authPage,
    setAuthPage,
  ] =
    useState<AuthPage>(
      "login",
    );

  const [
    section,
    setSection,
  ] =
    useState<MobileSection>(
      "dashboard",
    );

  if (loading) {
    return (
      <View
        style={
          styles.loading
        }
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    if (
      authPage ===
      "register"
    ) {
      return (
        <RegisterScreen
          onLogin={() =>
            setAuthPage(
              "login",
            )
          }
        />
      );
    }

    return (
      <LoginScreen
        onRegister={() =>
          setAuthPage(
            "register",
          )
        }
      />
    );
  }

  const back =
    () =>
      setSection(
        "dashboard",
      );

  if (
    section === "tasks"
  ) {
    return (
      <TasksScreen
        onBack={
          back
        }
      />
    );
  }

  if (
    section === "focus"
  ) {
    return (
      <FocusScreen
        onBack={
          back
        }
      />
    );
  }

  if (
    section === "mood"
  ) {
    return (
      <MoodScreen
        onBack={
          back
        }
      />
    );
  }

  if (
    section === "calm"
  ) {
    return (
      <CalmScreen
        onBack={
          back
        }
      />
    );
  }

  if (
    section === "wearables"
  ) {
    return (
      <WearablesScreen
        onBack={
          back
        }
      />
    );
  }

  if (
    section === "offline"
  ) {
    return (
      <OfflineScreen
        onBack={
          back
        }
      />
    );
  }

  return (
    <DashboardScreen
      onNavigate={
        setSection
      }
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar
        style="dark"
      />

      <Application />
    </AuthProvider>
  );
}

const styles =
  StyleSheet.create({
    loading: {
      alignItems:
        "center",

      flex: 1,

      justifyContent:
        "center",
    },
  });
