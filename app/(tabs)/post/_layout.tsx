import { Stack, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import DefaultTitleHeader from "@/components/DefaultHeader";
import { AnimatedBackButton } from "@/components/AnimatedBackButton";
import { useCallback } from "react";

export default function PostLayout() {
    const router = useRouter();

    const navigateToPosts = useCallback(() => {
        router.push("/(tabs)");
    }, [router]);

    return (
        <Stack
            screenOptions={{
                headerTitleStyle: {
                    color: 'black',
                    fontSize: 18
                }
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'All Posts',
                    headerTitle: () => <DefaultTitleHeader />,
                    headerLeft: () => <AnimatedBackButton trigger={navigateToPosts} />,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Profile",
                    header: () => null,
                    // headerTitle: () => <DefaultTitleHeader />,
                    // headerLeft: () => <AnimatedBackButton />,
                }}
            />
        </Stack>
    );
}