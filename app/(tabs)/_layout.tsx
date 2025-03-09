import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, router, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useAuthStore } from '@/lib/AuthStore';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Image } from 'expo-image';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ color: props.color, position: "absolute", }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/start" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: 'green',
        tabBarStyle: {
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: 'white',
          height: 80,
          position: 'absolute',
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          header: () => null // Proper way to hide tab header

        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          headerLeft: () => (
            <FontAwesome
              name="arrow-left"
              size={30}
              style={{ marginLeft: 30, color: "red" }}
              onPress={() => router.push('/(tabs)')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          header: () => null // Proper way to hide tab header

        }}
      />
      <Tabs.Screen
        name="edit"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/(tabs)/post')}>
              <Image source={require('../../assets/images/logo_white.svg')}
                cachePolicy="memory-disk"
                contentFit="contain"
                style={{ width: 40, height: 40, marginRight: 20 }}
              />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          href: null,
          headerLeft: () => (
            <FontAwesome
              name="arrow-left"
              size={60}
              style={{ marginLeft: 30, color: "red" }}
              onPress={() => router.push('/(tabs)')}
            />
          ),
        }}
      />
    </Tabs>
  );
}
