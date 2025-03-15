import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    StyleSheet,
    TextInput,
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { usePostStore } from "@/lib/PostStore";
import { ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const recipeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    image_url: z.string().optional(),
    ingredients: z
        .array(z.string().min(1, "Ingredient cannot be empty"))
        .min(1, "At least one ingredient is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function RecipeFormEdit() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [currentIngredient, setCurrentIngredient] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [postId, setPostId] = useState<string | null>(null);
    const { createPost, updatePost, findPost } = usePostStore();

    const currentPost = findPost(id as string);

    useEffect(() => {
        if (id) {
            setPostId(id as string);
            if (currentPost) {
                const { title, description, ingredients, image_url } = currentPost;
                setValue("title", title);
                setValue("description", description);
                setValue("ingredients", ingredients);
                setValue("image_url", image_url);
                setSelectedImage(image_url);
            } else {
                Alert.alert("Post not found", "The post you are trying to edit does not exist");
                router.push("/(tabs)/profile");
            }
        }
    }, [id]);

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<RecipeFormData>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            title: currentPost?.title || "",
            description: currentPost?.description || "",
            ingredients: currentPost?.ingredients || [],
            image_url: currentPost?.image_url || "",
        },
    });

    const ingredients = watch("ingredients", []);

    const addIngredient = () => {
        if (currentIngredient.trim()) {
            setValue("ingredients", [...ingredients, currentIngredient.trim()]);
            setCurrentIngredient("");
        }
    };

    const removeIngredient = (index: number) => {
        setValue(
            "ingredients",
            ingredients.filter((_, i) => i !== index)
        );
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const image = result.assets[0];
            setSelectedImage(image.uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const { data, error } = await supabase.storage
                .from("post_image")
                .upload(`${Date.now()}.jpg`, { uri, type: "image/jpeg" } as any);

            if (error) throw error;
            const url = supabase.storage.from("post_image").getPublicUrl(data.path);
            setValue("image_url", url.data.publicUrl);
            return url.data.publicUrl;
        } catch (error: any) {
            Alert.alert("Error uploading image", error?.message || "An error occurred");
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: RecipeFormData) => {
        try {
            let imageUrl = data.image_url;

            if (selectedImage && !selectedImage.startsWith("https://")) {
                imageUrl = await uploadImage(selectedImage);
            } else {
                console.log("Image URL: ", imageUrl);
                console.log("no image uploaded");
            }

            const post = {
                title: data.title,
                description: data.description,
                image_url: imageUrl ?? undefined,
                ingredients: data.ingredients,
            };

            if (postId) {
                await updatePost(postId, post);
                Alert.alert("Recipe updated successfully!");
            } else {
                await createPost(post);
                Alert.alert("Recipe created successfully!");
            }

            router.push("/(tabs)");
        } catch (error) {
            Alert.alert("Error saving recipe");
        } finally {
            setSelectedImage(null);
            reset();
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.container}>
                <Text style={styles.title}>
                    {postId ? "Edit Recycle Ways" : "Add Recycle Ways"}
                </Text>
                <Text style={styles.desc}>
                    {postId
                        ? "Edit your recycling method below"
                        : "Share your recycling ideas with everyone"}
                </Text>

                <Text style={styles.label}>Name of Product</Text>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Name of Product"
                            placeholderTextColor="grey"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="title"
                />
                {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

                <Text style={styles.label}>Description</Text>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.inputdesc}
                            placeholder="Enter description"
                            multiline
                            numberOfLines={4}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="description"
                />
                {errors.description && (
                    <Text style={styles.error}>{errors.description.message}</Text>
                )}

                <Text style={styles.label}>Ingredients</Text>
                <Text style={styles.labeldesc}>
                    {postId
                        ? "Edit your product's ingredients"
                        : "Add all ingredients including measurements"}
                </Text>
                <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                    <Text style={styles.addButtonText}>+ Add Ingredients</Text>
                </TouchableOpacity>
                <View style={styles.ingredientContainer}>
                    <TextInput
                        style={[styles.input, styles.ingredientInput]}
                        placeholder="Add ingredient"
                        value={currentIngredient}
                        onChangeText={setCurrentIngredient}
                        onSubmitEditing={addIngredient}
                    />
                </View>

                <View style={styles.ingredientsList}>
                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <Text>{ingredient}</Text>
                            <TouchableOpacity onPress={() => removeIngredient(index)}>
                                <Text style={styles.removeText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Image</Text>
                    <Text style={styles.imagedesc}>
                        {postId ? "Update product image" : "Add product image"}
                    </Text>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        <Text style={styles.imageButtonText}>
                            {uploading ? "Uploading..." : "Pick Image"}
                        </Text>
                    </TouchableOpacity>
                    {selectedImage && (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.imagePreview}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedImage(null);
                                    setValue("image_url", "");
                                }}
                                style={styles.removeImageButton}
                            >
                                <Text style={styles.removeText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text style={styles.submitButtonText}>
                        {postId ? "Update Recipe" : "Submit Recipe"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 50,
    },
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: "#F8F8F8",
        paddingBottom: '20%',
        marginBottom: '20%',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#00512C",
        textAlign: "center",
    },
    desc: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    inputdesc: {
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: "white",
        height: '20%',
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 10,
        fontWeight: "bold",
        color: "#333",
    },
    labeldesc: {
        fontSize: 12,
        marginBottom: 10,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        backgroundColor: "white",
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
    ingredientContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    ingredientInput: {
        flex: 1,
    },
    addButton: {
        padding: 2,
        borderRadius: 6,
        marginLeft: 230,
        marginBottom: 10,
    },
    addButtonText: {
        color: "#00512C",
        fontWeight: "bold",
        fontSize: 16,
    },
    ingredientsList: {
        marginBottom: 10,
    },
    ingredientItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "transparent",
        marginBottom: 8,
        borderRadius: 6,
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.8)",
    },

    imageContainer: {
        backgroundColor: "transparent",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.46)",
        alignItems: "flex-start",
    },
    imageLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#444",
        textAlign: "left",
    },
    imagedesc: {
        fontSize: 12,
        marginBottom: 15,
        color: "#333",
        textAlign: "left",
    },
    imageButton: {
        alignSelf: "center",
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#00512C",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
    },
    imageButtonText: {
        color: "#00512C",
        fontWeight: "bold",
        fontSize: 14,
    },
    imagePreviewContainer: {
        marginTop: 10,
        alignItems: "center",
        alignSelf: "center",
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.65)",
        marginBottom: 10,
        marginTop: 10,
    },
    removeImageButton: {
        marginTop: 5,
        padding: 8,
        backgroundColor: "transparent",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#C52323",
        color: "white",
    },
    removeText: {
        color: "#C52323",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: "#00512C",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: "center",
        alignSelf: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    submitButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
});
