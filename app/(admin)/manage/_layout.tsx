import { Stack, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

export default function PostLayout() {
    const router = useRouter();

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
                    header: () => null,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    header: () => null,
                }}
            />
        </Stack>
    );
}