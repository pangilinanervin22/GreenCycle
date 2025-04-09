import { Stack } from "expo-router";
import React from "react";

export default function Profile() {
    return (
        <Stack
            screenOptions={{
                headerTitleStyle: {
                    color: 'black',
                    fontSize: 18
                },
                contentStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    header: () => null,
                }}
            />
            <Stack.Screen
                name="edit"
                options={{
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


