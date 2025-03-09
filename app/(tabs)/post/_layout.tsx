import { Stack } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useNavigation } from "expo-router";

export default function PostLayout() {
    const navigation = useNavigation();

    return (
        <Stack
            screenOptions={{
                headerTitleAlign: 'center',
                headerBackVisible: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'All Posts',
                    headerLeft: () => (
                        <View style={{ marginLeft: 16, zIndex: 99 }}>
                            <Pressable
                                onPress={() => { navigation.goBack(); Alert.alert('Back pressed!'); }}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1,
                                    padding: 10,
                                    backgroundColor: 'red', // Visual debug
                                    borderRadius: 5
                                })}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            >
                                <Text style={{ fontSize: 16 }}>Back</Text>
                            </Pressable>
                        </View>
                    )
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Post Details',
                    headerLeft: () => (
                        <Pressable
                            onPress={() => navigation.goBack()}
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