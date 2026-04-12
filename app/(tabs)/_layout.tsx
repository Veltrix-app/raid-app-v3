import { Tabs } from "expo-router";
import AuthGate from "@/components/AuthGate";
import { COLORS } from "@/constants/theme";
import { House, Megaphone, ScrollText, Gift, Trophy, User } from "lucide-react-native";
import { useProgressSync } from "@/hooks/useProgressSync";
import { useActionSync } from "@/hooks/useActionSync";

function TabsContent() {
  useProgressSync();
  useActionSync();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#05070B",
          borderTopColor: "#161B22",
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="raids"
        options={{
          title: "Raids",
          tabBarIcon: ({ color, size }) => <Megaphone color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => <Gift color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return (
    <AuthGate>
      <TabsContent />
    </AuthGate>
  );
}