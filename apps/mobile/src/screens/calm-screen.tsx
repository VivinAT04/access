import {
  StyleSheet,
  Text,
} from "react-native";

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

export function CalmScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <Screen>
      <SecondaryButton
        label="Back"
        onPress={
          onBack
        }
      />

      <Title>
        Calm
      </Title>

      <Subtitle>
        Ground yourself at your own pace.
      </Subtitle>

      <Card>
        <Text
          style={
            styles.heading
          }
        >
          Slow breathing
        </Text>

        <Text
          style={
            styles.copy
          }
        >
          Breathe in gently for 4 seconds.
          {"\n"}
          Pause for 2.
          {"\n"}
          Breathe out slowly for 6.
        </Text>
      </Card>

      <Card>
        <Text
          style={
            styles.heading
          }
        >
          Five senses
        </Text>

        <Text
          style={
            styles.copy
          }
        >
          5 things you can see.
          {"\n"}
          4 things you can feel.
          {"\n"}
          3 things you can hear.
          {"\n"}
          2 things you can smell.
          {"\n"}
          1 thing you can appreciate.
        </Text>
      </Card>
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    heading: {
      color:
        colors.text,

      fontSize:
        20,

      fontWeight:
        "800",
    },

    copy: {
      color:
        colors.muted,

      fontSize:
        16,

      lineHeight:
        25,
    },
  });
