import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, router, Tabs } from "expo-router";

import { useAuthStore } from "@/lib/AuthStore";
import DefaultLoading from "@/components/DefaultLoading";
import DefaultTitleHeader from "@/components/DefaultHeader";

function AnimatedBackButton() {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => router.back()}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ padding: 20 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <FontAwesome name="arrow-left" size={24} color="#00512C" />
      </Animated.View>
    </Pressable>
  );
}

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
          backgroundColor: "white",
          height: 60,
          position: "absolute",
          paddingTop: 5,
        },
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#ECE9E5",
          elevation: 0,
          height: 70,
        },
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
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          headerTitle: () => <DefaultTitleHeader />,
          headerLeft: () => <AnimatedBackButton />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
          headerTitle: () => <DefaultTitleHeader />,
          headerLeft: () => <AnimatedBackButton />,
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          title: "Profile",
          href: null,
          header: () => null,
          // headerTitle: () => <DefaultTitleHeader />,
          // headerLeft: () => <AnimatedBackButton />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: () => <DefaultTitleHeader />,
          headerLeft: () => <AnimatedBackButton />,
        }}
      />
    </Tabs>
  );
}
