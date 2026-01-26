import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from 'nativewind';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '../../src/context/AuthContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, selectedClub } = useAuth();

  // Show admin tab if:
  // - User is admin AND
  // - (User is super admin (club_id = null) OR user's club matches selected club)
  const showAdminTab = user?.is_admin && (user.club_id === null || user.club_id === selectedClub?.id);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        headerTitleStyle: {
          color: isDark ? '#FFFFFF' : '#000000',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
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
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="carteirinha"
        options={{
          href: null,
        }}
      />

      {showAdminTab ? (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Administração',
            tabBarIcon: ({ color }) => <TabBarIcon name="lock" color={color} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}
