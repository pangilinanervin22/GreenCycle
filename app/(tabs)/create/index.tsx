import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from 'react-native';
import { set, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { usePostStore } from '@/lib/PostStore';

const recipeSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    image_url: z.string().optional(),
    ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'At least one ingredient is required'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function RecipeForm() {
    const [currentIngredient, setCurrentIngredient] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { createPost, loading } = usePostStore();
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<RecipeFormData>({
        resolver: zodResolver(recipeSchema),
        defaultValues: {
            title: '',
            description: '',
            ingredients: [],
        },
    });

    const addIngredient = () => {
        if (currentIngredient.trim()) {
            const currentIngredients = getValues('ingredients');
            setValue('ingredients', [...currentIngredients, currentIngredient.trim()]);
            setCurrentIngredient('');
        }
    };

    const removeIngredient = (index: number) => {
        const currentIngredients = getValues('ingredients');
        setValue('ingredients', currentIngredients.filter((_, i) => i !== index));
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
            const { data, error } = await supabase.storage.from('post_image')
                .upload(`${Date.now()}.jpg`, { uri, type: 'image/jpeg' } as any);

            if (error) throw error;
            const url = supabase.storage.from('post_image').getPublicUrl(data.path);
            setValue('image_url', url.data.publicUrl);

            console.log('Image uploaded:', url.data.publicUrl, url);

            return url.data.publicUrl;
        } catch (error: any) {
            Alert.alert('Error uploading image', error?.message || 'An error occurred');
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: RecipeFormData) => {
        try {
            let imageUrl: string | undefined;
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            const post = {
                title: data.title,
                description: data.description,
                image_url: imageUrl ?? undefined,
                ingredients: data.ingredients,
            }

            setSelectedImage(null);
            setCurrentIngredient('');
            reset();

            console.log(post);

            await createPost(post);
            Alert.alert('Recipe created successfully!');
        } catch (error) {
            Alert.alert('Error creating recipe');
        }
    };

    return (
        <View style={styles.container}>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} placeholder="Title" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
                name="title"
            />
            {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        multiline
                        numberOfLines={4}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
                name="description"
            />
            {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

            <View style={styles.ingredientContainer}>
                <TextInput
                    style={[styles.input, styles.ingredientInput]}
                    placeholder="Add ingredient"
                    value={currentIngredient}
                    onChangeText={setCurrentIngredient}
                    onSubmitEditing={addIngredient}
                />
                <Button title="Add" onPress={addIngredient} />
            </View>

            <View style={styles.ingredientsList}>
                {getValues('ingredients').map((ingredient, index) => (
                    <View key={index} style={styles.ingredientItem}>
                        <Text>{ingredient}</Text>
                        <TouchableOpacity onPress={() => removeIngredient(index)}>
                            <Text style={styles.removeText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
            {errors.ingredients && <Text style={styles.error}>{errors.ingredients.message}</Text>}

            {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            )}

            <View style={styles.buttonContainer}>
                <Button
                    title={uploading ? 'Uploading...' : 'Pick Image'}
                    onPress={pickImage}
                    disabled={uploading}
                />
                <Button title="Submit Recipe" onPress={handleSubmit(onSubmit)} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    ingredientContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    ingredientInput: {
        flex: 1,
    },
    ingredientsList: {
        marginBottom: 10,
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f5f5f5',
        marginBottom: 5,
        borderRadius: 4,
    },
    removeText: {
        color: 'red',
        fontSize: 20,
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
        borderRadius: 4,
    },
});