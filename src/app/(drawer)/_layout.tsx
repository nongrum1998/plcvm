import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from 'expo-router/drawer';
import { Button, Icon } from '@components';
import { useAuthStore } from '@stores/auth.store';
import { PAGE_ROUTES } from '@utils/constants';
import { useSafeNavigation } from '@hooks';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();
  const inset = useSafeAreaInsets();
  const { navigate } = useSafeNavigation();
  const base64Image = user?.photo;
  const image = base64Image?.startsWith('data:image/png;base64')
    ? base64Image
    : `data:image/png;base64,${base64Image}`;
  return (
    <View className="flex-1">
      {/* Header Section */}
      <View className="items-center bg-primary p-5 pt-12">
        <View style={{ marginTop: inset.top }} className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/20">
            <Image
              source={{ uri: image }}
              resizeMode="cover"
              className="h-16 w-16 object-cover object-center"
            />
          </View>

          <View className="items-center">
            <Text className="text-sm font-semibold text-white">{user?.pname}</Text>
          </View>
        </View>
      </View>

      {/* Route List */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 12 }}>
        {/* Home */}
        <DrawerItem
          label="Home"
          onPress={() => navigate(PAGE_ROUTES.HOME)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="information-circle" size={size} color={color} />}
        />

        {/* Digital Life Certificate */}
        <DrawerItem
          label="Digital Life Certificate"
          onPress={() => navigate(PAGE_ROUTES.DLC_STATUS)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="file-check-02" size={size} color={color} />}
        />

        {/* Withdrawal */}
        <DrawerItem
          label="Withdrawal"
          onPress={() => navigate(PAGE_ROUTES.WITHDRAWAL)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="property-delete" size={size} color={color} />}
        />

        {/* Profile */}
        <DrawerItem
          label="Profile"
          onPress={() => navigate(PAGE_ROUTES.PROFILE.HOME)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="user-01" size={size} color={color} />}
        />

        {/* Change Password */}
        <DrawerItem
          label="Change Password"
          onPress={() => navigate(PAGE_ROUTES.CHANGE_PASSWORD)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="user-unlock" size={size} color={color} />}
        />

        {/* User Manual */}
        <DrawerItem
          label="User Manual"
          onPress={() => navigate(PAGE_ROUTES.USER_MANUAL.HOME)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="book-01" size={size} color={color} />}
        />

        {/* Contact Us */}
        <DrawerItem
          label="Contact Us"
          onPress={() => navigate(PAGE_ROUTES.CONTACT_US)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="contact-01" size={size} color={color} />}
        />

        {/* Privacy Policy */}
        <DrawerItem
          label="Privacy Policy"
          onPress={() => navigate(PAGE_ROUTES.PRIVACY)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="shield" size={size} color={color} />}
        />

        {/* About */}
        <DrawerItem
          label="About"
          onPress={() => navigate(PAGE_ROUTES.ABOUT_US)}
          pressOpacity={0.1}
          pressColor="#FFF"
          icon={({ size, color }) => <Icon name="info" size={size} color={color} />}
        />
      </DrawerContentScrollView>

      {/* Drawer Footer / Logout */}
      <View className="border-t border-slate-100 p-4">
        <Button size="lg" variant="destructive" activeOpacity={0.7} onPress={logout}>
          Logout
        </Button>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEnabled: true,
        headerShown: false,
        drawerActiveBackgroundColor: '#F0FDFA',
        drawerActiveTintColor: '#4297A0',
        drawerInactiveTintColor: '#475569',
        drawerItemStyle: {
          borderRadius: 0,
          marginHorizontal: 12,
          marginVertical: 2,
        },
        drawerLabelStyle: {
          fontSize: 14,
          fontWeight: '500',
        },
      }}
    />
  );
}
