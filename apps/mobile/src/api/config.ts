import {
  Platform,
} from "react-native";

const localhost =
  Platform.OS === "android"
    ? "10.0.2.2"
    : "127.0.0.1";

export const API_BASE_URL =
  (
    process.env.EXPO_PUBLIC_API_URL
    ?? `http://${localhost}:8000`
  ).replace(
    /\/+$/,
    "",
  );

export const API_V1 =
  `${API_BASE_URL}/api/v1`;
