import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useAuth,
} from "../auth/auth-context";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

import {
  colors,
} from "../theme/colors";

export type MobileSection =
  | "dashboard"
  | "tasks"
  | "focus"
  | "mood"
  | "calm"
  | "wearables"
  | "offline";

const tools: {
  id: MobileSection;
  title: string;
  description: string;
}[] = [
  {
    id: "tasks",
    title: "Tasks",
    description:
      "Break your day into manageable steps.",
  },

  {
    id: "focus",
    title: "Focus",
    description:
      "Start a calm focus session.",
  },

  {
    id: "mood",
    title: "Mood",
    description:
      "Pause and notice how you feel.",
  },

  {
    id: "calm",
    title: "Calm",
    description:
      "Use breathing and grounding tools.",
  },

  {
    id: "wearables",
    title: "Wearables",
    description:
      "View optional heart-rate insights.",
  },

  {
    id: "offline",
    title: "Offline",
    description:
      "Keep useful drafts on this device.",
  },
];

export function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (
    section: MobileSection,
  ) => void;
}) {
  const {
    user,
    logout,
  } =
    useAuth();

  const firstName =
    user
      ?.full_name
      ?.split(" ")[0]
    ?? "there";

  return (
    <Screen>
      <Title>
        Welcome, {firstName}.
      </Title>

      <Subtitle>
        Choose what would help you right now.
      </Subtitle>

      <View
        style={
          styles.list
        }
      >
        {tools.map(
          (
            tool,
          ) => (
            <Card
              key={
                tool.id
              }
            >
              <Text
                style={
                  styles.title
                }
              >
                {
                  tool.title
                }
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                {
                  tool.description
                }
              </Text>

              <SecondaryButton
                label="Open"
                onPress={() =>
                  onNavigate(
                    tool.id,
                  )
                }
              />
            </Card>
          ),
        )}
      </View>

      <SecondaryButton
        label="Sign out"
        onPress={() =>
          void logout()
        }
      />
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    list: {
      gap: 12,
    },

    title: {
      color:
        colors.text,

      fontSize:
        20,

      fontWeight:
        "800",
    },

    description: {
      color:
        colors.muted,

      lineHeight:
        21,
    },
  });
