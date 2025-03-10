import { Slot } from "expo-router";
import React from "react";
import { Text } from "react-native";

export default function Profile() {
    return (
        <>
            <Slot />
            <Text>Profile</Text>
        </>
    );
}


