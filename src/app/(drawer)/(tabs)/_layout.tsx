import { Icon } from '@components/ui/icon';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '800',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Status',
          tabBarIcon: ({ size, color }) => (
            <Icon size={size} color={color} name="information-circle" />
          ),
        }}
      />
      <Tabs.Screen
        name="dlc"
        options={{
          title: 'Submit DLC',
          tabBarIcon: ({ size, color }) => <Icon size={size} name="camera-01" color={color} />,
        }}
      />
      <Tabs.Screen
        name="statement"
        options={{
          title: 'Statements',
          tabBarIcon: ({ color, size }) => <Icon name="receipt" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
