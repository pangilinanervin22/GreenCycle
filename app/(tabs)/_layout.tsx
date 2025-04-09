import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, router, Tabs } from "expo-router";

import { useAuthStore } from "@/lib/AuthStore";
import DefaultLoading from "@/components/DefaultLoading";
import DefaultTitleHeader from "@/components/DefaultHeader";
import { AnimatedBackButton } from "@/components/AnimatedBackButton";


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return (
    <FontAwesome
      size={28}
      style={{ color: props.color, position: "absolute" }}
      {...props}
    />
  );
}

export default function TabLayout() {
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) return <DefaultLoading loading={loading} />;
  if (!user) return <Redirect href="/start" />;
  if (user.role === "admin") return <Redirect href="/(admin)" />;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "green",
        tabBarStyle: {
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          height: 60,
          position: "absolute",
          paddingTop: 5,
          backgroundColor: "white",

        },
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "white",

          elevation: 0,
          height: 70,
        },
        sceneStyle: {
          backgroundColor: "#e4f0e9",

        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          header: () => null,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Likes",
          href: "/post",
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          header: () => null,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: "/create",
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
          headerTitle: () => <DefaultTitleHeader />,
          headerLeft: () => <AnimatedBackButton trigger={() => router.push("/(tabs)")} />,
        }}
      />
      {/* <Tabs.Screen
        name="[id]"
        options={{
          title: "Profile",
          href: null,
          header: () => null,
          // headerTitle: () => <DefaultTitleHeader />,
          // headerLeft: () => <AnimatedBackButton />,
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          href: "/profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: () => <DefaultTitleHeader />,
          headerLeft: () => <AnimatedBackButton trigger={() => router.back()} />,
        }}
      />
    </Tabs>
  );
}
