import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/lib/AuthStore';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const { hasStarted, setHasStarted } = useAuthStore();


  const { user, loading, initializeAuth } = useAuthStore();
  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Show a loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/start" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          borderTopLeftRadius: 40, // Add top border radius
          borderTopRightRadius: 40,
          backgroundColor: 'white', // Tab bar background color
          height: 80, // Adjust height if needed
          position: 'absolute', // Optional: Makes the tab bar float
        },
        tabBarItemStyle: {
          marginBottom: 6, // Adjust spacing for icons/labels
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
