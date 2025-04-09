import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const StarRating = ({ rating, onRate }: { rating: number; onRate: (rating: number) => void }) => {
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

    return (
        <View style={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = roundedRating >= star;

                return (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRate(star)}
                        activeOpacity={0.6}
                    >
                        <FontAwesome
                            name={filled ? 'star' : 'star-o'}
                            size={24}
                            color="#FFD700"
                            style={styles.star}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};


const styles = StyleSheet.create({
    starRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center' as const,
    },
    star: {
        marginHorizontal: 2,
    },
});