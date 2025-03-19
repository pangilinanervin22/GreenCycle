import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/lib/AuthStore";
import {
  View,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DefaultLoading from "@/components/DefaultLoading";

const SignupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(9, "Password must be at least 9 characters"),
    confirmPassword: z
      .string()
      .min(9, "Password must be at least 9 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const { signup, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(SignupSchema) });

  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await signup(data.email, data.password, data.name);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Signup Failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Pressable
          onPress={() => router.push("/start")}
          style={styles.backButton}
        >
          <FontAwesome name="arrow-left" size={24} color={"#00512C"} />
        </Pressable>
        <Image
          source={require("../assets/images/logo.svg")}
          style={styles.logo}
          cachePolicy="memory-disk"
          contentFit="contain"
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Create Account</Text>
        <Text style={styles.subText}>Sign up to get started</Text>
      </View>

      <Text style={styles.label}>Name</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Enter your name"
            style={styles.input}
            placeholderTextColor={"#00512C"}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && (
        <Text style={{ color: "red" }}>{errors.name.message}</Text>
      )}

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Enter email"
            style={styles.input}
            placeholderTextColor={"#00512C"}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && (
        <Text style={{ color: "red" }}>{errors.email.message}</Text>
      )}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!showPassword}
              placeholder="Enter password"
              style={[styles.input, { paddingRight: 35 }]}
              placeholderTextColor={"#00512C"}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color="#00512C"
              />
            </Pressable>
          </View>
        )}
      />
      {errors.password && (
        <Text style={{ color: "red" }}>{errors.password.message}</Text>
      )}

      <Text style={styles.label}>Confirm Password</Text>
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm password"
              style={[styles.input, { paddingRight: 35 }]}
              placeholderTextColor={"#00512C"}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome
                name={showConfirmPassword ? "eye-slash" : "eye"}
                size={20}
                color="#00512C"
              />
            </Pressable>
          </View>
        )}
      />
      {errors.confirmPassword && (
        <Text style={{ color: "red" }}>{errors.confirmPassword.message}</Text>
      )}

      <View style={styles.buttonContainer}>
        <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
          {loading ? (
            <DefaultLoading loading={loading} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>
      </View>
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account?</Text>
        <Link href="/login" style={styles.link}>
          Login
        </Link>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/signupbg.png")}
          style={styles.backgroundImage}
          contentFit="fill"
          cachePolicy={"memory-disk"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-start",
    paddingInline: 24,
    paddingTop: "30%",
    backgroundColor: Colors.light.background,
  },
  topContainer: {
    position: "absolute",
    top: 40,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeContainer: {
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 4,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00512C",
  },
  subText: {
    fontSize: 16,
    color: "#00512C",
    fontWeight: "400",
  },
  label: {
    fontSize: 16,
    color: "#00512C",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 40,
    borderColor: "#00512C",
    borderWidth: 2,
    marginBottom: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    color: "#00512C",
    backgroundColor: "transparent",
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
  buttonContainer: {
    width: "50%",
    alignSelf: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "transparent",
    padding: 12,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00512C",
    marginTop: 8,
  },
  buttonText: {
    color: "#00512C",
    fontSize: 15,
    fontWeight: "bold",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  linkText: {
    color: "#00512C",
  },
  link: {
    fontSize: 16,
    color: "#00512C",
    marginLeft: 4,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  imageContainer: {
    display: "flex",
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: "40%",
  },
  backgroundImage: {
    width: "120%",
    height: "120%",
    zIndex: 10,
  },
});