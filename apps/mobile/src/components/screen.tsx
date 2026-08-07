import {
  ReactNode,
} from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  colors,
} from "../theme/colors";

export function Screen({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SafeAreaView
      style={
        styles.safe
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        colors.background,
    },

    content: {
      flexGrow: 1,

      paddingHorizontal:
        20,

      paddingVertical:
        24,

      gap: 16,
    },
  });
