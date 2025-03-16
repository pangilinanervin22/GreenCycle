import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/AuthStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface ProfileFormData {
  name: string;
  description?: string;
  email?: string;
}

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  email: z.string().email().optional(),
});

export default function ProfileDetails() {
  const { user, updateAccount } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      description: user?.description || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateAccount(data.name, data.description);
    alert("Profile updated successfully!");
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                      <FontAwesome name="arrow-left" size={20} color="#00512C" />
                  </TouchableOpacity>
      <Text style={styles.title}>Edit Your Profile</Text>
      {/* Name Field */}
      <Text style={styles.label}>Name: </Text>
      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {/* Description Field */}

      <Text style={styles.label}>Description</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.inputdescription}
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

      {/* Email Field (Read-Only) */}
      <Text style={styles.label}>Email: </Text>
      <Controller
        name="email"
        control={control}
        render={({ field: { value } }) => (
          <TextInput
            style={[styles.input, styles.disabledInput]}
            editable={false}
            value={value}
          />
        )}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,

},
  title: {
    marginTop: '20%',
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
    color: "#00512C",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#00000",
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  inputdescription: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "white",
    height: 80,
  },

  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
  },
  disabledInput: {
    backgroundColor: "#e9ecef",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#00512C",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
