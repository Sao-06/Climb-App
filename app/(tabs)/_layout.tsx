import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ascent',
          tabBarLabel: 'Ascent',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mountain.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Missions',
          tabBarLabel: 'Missions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.clipboard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Basecamp',
          tabBarLabel: 'Basecamp',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Team',
          tabBarLabel: 'Team',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Gear',
          tabBarLabel: 'Gear',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
