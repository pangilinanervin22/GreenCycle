import { Stack, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useNavigation } from "expo-router";

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
                    title: 'Post Details',
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.5 : 1,
                                padding: 102,
                                backgroundColor: '#ff000020' // Visual debug
                            })}
                        >
                            <Text style={{ fontSize: 16, color: 'red' }}>Back</Text>
                        </Pressable>
                    )
                }}
            />
        </Stack>
    );
}