export default {
    name: "my-task-buddy",
    slug: "mytaskbuddy",
    version: "1.0.0",
    sdkVersion: "50.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        supportsTablet: true
    },
    android: {
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        package: "com.emanmane.mytaskbuddy",
    },
    plugins: ["@react-native-google-signin/google-signin"],
    web: {
        favicon: "./assets/favicon.png"
    },
    extra: {
        eas: {
        projectId: "def939ee-d82d-45d5-a5b6-d0a23be43aa6"
        }
    },
    owner: "emanmane"
  };