import { FontAwesome } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable } from "react-native";

export function AnimatedBackButton(props: { trigger: () => void }) {
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
            onPress={() => props.trigger()}
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