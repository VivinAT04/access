import {
  ReactNode,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import {
  colors,
} from "../theme/colors";

export function Title({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Text
      style={
        styles.title
      }
    >
      {children}
    </Text>
  );
}

export function Subtitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Text
      style={
        styles.subtitle
      }
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <View
      style={
        styles.card
      }
    >
      {children}
    </View>
  );
}

export function Input(
  props: TextInputProps,
) {
  return (
    <TextInput
      placeholderTextColor={
        colors.muted
      }
      style={
        styles.input
      }
      {...props}
    />
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={({ pressed }) => [
        styles.primaryButton,

        disabled
          ? styles.disabled
          : null,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <Text
        style={
          styles.primaryButtonText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={({ pressed }) => [
        styles.secondaryButton,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <Text
        style={
          styles.secondaryButtonText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Message({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <Text
      style={
        error
          ? styles.error
          : styles.success
      }
    >
      {children}
    </Text>
  );
}

const styles =
  StyleSheet.create({
    title: {
      color:
        colors.text,

      fontSize:
        32,

      fontWeight:
        "800",
    },

    subtitle: {
      color:
        colors.muted,

      fontSize:
        16,

      lineHeight:
        23,
    },

    card: {
      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderRadius:
        18,

      borderWidth:
        1,

      gap:
        12,

      padding:
        16,
    },

    input: {
      backgroundColor:
        colors.surface,

      borderColor:
        colors.border,

      borderRadius:
        12,

      borderWidth:
        1,

      color:
        colors.text,

      fontSize:
        16,

      paddingHorizontal:
        14,

      paddingVertical:
        13,
    },

    primaryButton: {
      alignItems:
        "center",

      backgroundColor:
        colors.primary,

      borderRadius:
        12,

      padding:
        14,
    },

    primaryButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        16,

      fontWeight:
        "700",
    },

    secondaryButton: {
      alignItems:
        "center",

      backgroundColor:
        colors.primarySoft,

      borderRadius:
        12,

      padding:
        14,
    },

    secondaryButtonText: {
      color:
        colors.primary,

      fontSize:
        16,

      fontWeight:
        "700",
    },

    pressed: {
      opacity:
        0.75,
    },

    disabled: {
      opacity:
        0.5,
    },

    success: {
      color:
        colors.success,

      fontWeight:
        "600",
    },

    error: {
      color:
        colors.danger,

      fontWeight:
        "600",
    },
  });
