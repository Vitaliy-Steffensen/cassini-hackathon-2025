import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // handle response
      });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Custom Notification!",
        body: "This is a test notification with custom sound and icon.",
        sound: "custom-notification.wav",
        badge: 1,
        data: { test: true },
      },
      trigger: null,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
        Expo Push Notification Demo
      </Text>
      <Text>Your push token:</Text>
      <Text selectable style={{ fontSize: 12, marginBottom: 10 }}>
        {expoPushToken || "Registering..."}
      </Text>
      <Button title="Send Test Notification" onPress={sendTestNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    Alert.alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "custom-notification.wav",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
