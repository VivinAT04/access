import {
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  Message,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

import {
  colors,
} from "../theme/colors";

const moods = [
  "😞",
  "😕",
  "😐",
  "🙂",
  "😊",
];

export function MoodScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [
    selected,
    setSelected,
  ] =
    useState<
      string | null
    >(null);

  return (
    <Screen>
      <SecondaryButton
        label="Back"
        onPress={
          onBack
        }
      />

      <Title>
        Mood check-in
      </Title>

      <Subtitle>
        Notice how you feel without judgement.
      </Subtitle>

      <Card>
        <View
          style={
            styles.row
          }
        >
          {moods.map(
            (
              mood,
            ) => (
              <Pressable
                key={
                  mood
                }
                onPress={() =>
                  setSelected(
                    mood,
                  )
                }
                style={[
                  styles.mood,

                  selected === mood
                    ? styles.selected
                    : null,
                ]}
              >
                <Text
                  style={
                    styles.emoji
                  }
                >
                  {mood}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </Card>

      {selected ? (
        <Message>
          Check-in recorded locally: {selected}
        </Message>
      ) : null}
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    row: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "center",

      gap: 10,
    },

    mood: {
      borderColor:
        colors.border,

      borderRadius:
        14,

      borderWidth:
        1,

      padding: 12,
    },

    selected: {
      backgroundColor:
        colors.primarySoft,

      borderColor:
        colors.primary,
    },

    emoji: {
      fontSize: 30,
    },
  });
