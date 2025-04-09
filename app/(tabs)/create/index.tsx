import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Button,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { usePostStore } from "@/lib/PostStore";
import { ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const recipeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().optional(),
  ingredients: z
    .array(z.string().min(1, "Ingredient cannot be empty"))
    .min(1, "At least one ingredient is required"),
  procedure: z.string().min(2, "Procedure is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function RecipeForm() {
  const router = useRouter();
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { createPost, loading } = usePostStore();
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
      title: "",
      description: "",
      ingredients: [],
      procedure: "",
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
      Alert.alert(
        "Error uploading image",
        error?.message || "An error occurred"
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    try {
      if (loading) return;
      let imageUrl: string | undefined;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const post = {
        title: data.title,
        description: data.description,
        image_url: imageUrl ?? undefined,
        ingredients: data.ingredients,
        procedure: data.procedure,
      };

      setSelectedImage(null);
      setCurrentIngredient("");
      reset();

      await createPost(post);
      Alert.alert("Recipe created successfully!");

      router.push("/(tabs)");
    } catch (error) {
      console.log(error);

      Alert.alert("Error creating recipe");
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        reset();
        setCurrentIngredient('');
        setSelectedImage(null);
        setUploading(false);
      };
    }, [])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Add Recycle Ways</Text>
        <Text style={styles.desc}>
          You can add your own recycle ways on any fruit or vegetable you want
          and share your ideas to everyone
        </Text>

        {/* Title Input */}
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

        {/* Description Input */}
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInputDescription}
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

        {/* Procedure Input */}
        <Text style={styles.label}>Procedure</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInputProcedure}
              placeholder="Enter procedure"
              multiline
              numberOfLines={4}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="procedure"
        />
        {errors.procedure && (
          <Text style={styles.error}>{errors.procedure.message}</Text>
        )}

        {/* Ingredients Section */}
        <Text style={styles.label}>Ingredients</Text>
        <Text style={styles.descriptionLabel}>
          Add all the ingredient of your product including their measurements
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
        {errors.ingredients && (
          <Text style={styles.error}>{errors.ingredients.message}</Text>
        )}

        {/* Image Picker Section */}
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Image</Text>
          <Text style={styles.imageDescription}>
            Add image to present your product
          </Text>
          <View style={styles.imageButtonRow}>
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
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={styles.removeImageButton}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
              />
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Loading' : 'Submit Recipe'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00512C",
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
  textInputDescription: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "white",
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textInputProcedure: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "white",
    minHeight: 150,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
    color: "#00512C",
  },
  descriptionLabel: {
    fontSize: 12,
    marginBottom: 10,
    color: "#666",
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
    color: "#FF3B30",
    marginBottom: 10,
    fontSize: 12,
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
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#00512C",
    fontWeight: "600",
    fontSize: 14,
  },
  ingredientsList: {
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageDescription: {
    fontSize: 12,
    marginBottom: 15,
    color: "#666",
  },
  imageButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imageButton: {
    backgroundColor: "rgba(0, 81, 44, 0.1)",
    borderColor: "#00512C",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    flex: 1,
  },
  imageButtonText: {
    color: "#00512C",
    fontWeight: "600",
    textAlign: "center",
  },
  imagePreviewContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    backgroundColor: "rgba(197, 35, 35, 0.1)",
    borderColor: "#C52323",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    flex: 1,
  },
  removeText: {
    color: "#C52323",
    fontWeight: "600",
    width: "100%",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#00512C",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 20,
    width: "50%",
    alignSelf: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});