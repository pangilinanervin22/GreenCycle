import "dotenv/config";

export default {
    name: "GreenCycle",
    slug: "GreenCycle",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "myapp",
    sdkVersion: "52.0.0",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    jsEngine: "hermes",
    splash: {
        image: "./assets/images/logo.png",
        resizeMode: "fill",
        backgroundColor: "#ffffff",
    },
    ios: {
        supportsTablet: true,
        jsEngine: "jsc",
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.jpg",
            backgroundColor: "#ffffff",
        },
        package: "com.pangilinanervin22.GreenCycle",
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/logo.png",
    },
    plugins: ["expo-router", "expo-secure-store"],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        router: {
            origin: false,
        },
        eas: {
            projectId: "db0d206b-0b38-420e-b5d5-f499a8b090d6",
        },
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY,
        SAMPLE_ENVIRONMENT: process.env.SAMPLE_ENVIRONMENT,
        DEFAULT_POST_IMAGE: process.env.DEFAULT_POST_IMAGE,
    },
};

// eas build --platform android --profile preview