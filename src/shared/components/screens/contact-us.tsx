import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../ui/icon';
import { Container } from '@components/layout/container';
import { FooterImg } from '@components/common/nic-footer-img';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_LINKS } from '@utils/constants/app-link';
import { openEmailAddress, openPhoneNumber } from '@utils/helpers/linking/app-linking';

export function ContactScreen() {
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <Container className="gap-5">
        {/* Header Badge */}

        <View className="gap-2">
          <View className="bg-primary/10 self-start py-1">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary">
              Need Help
            </Text>
          </View>

          <Text className="text-2xl font-extrabold tracking-tight text-foreground">Contact Us</Text>

          <Text className="text-sm font-medium text-muted-foreground">How can we help you?</Text>
        </View>

        {/* Finance Department Card */}
        <View className="gap-4 rounded-md border border-gray-200 bg-card p-5">
          <View className="items-center border-b border-gray-200 pb-3">
            <Text className="text-center text-base font-bold text-foreground">
              Finance Department
            </Text>
            <Text className="mt-0.5 text-center text-sm font-semibold text-primary">
              Government of Meghalaya
            </Text>
          </View>

          {/* Contact Address */}
          <View className="bg-muted/30 flex-row items-start gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="map-pin" size={18} className="mt-0.5" />
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-foreground">Contact Address</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                3rd Secretariat, Nokrek Building,{'\n'}
                Lower Lachumiere, Meghalaya,{'\n'}
                Shillong - 793001
              </Text>
            </View>
          </View>

          {/* Land Line No. */}
          <TouchableOpacity
            onPress={() => openPhoneNumber(APP_LINKS.PHONE.LAND_LINE)}
            activeOpacity={0.7}
            className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="phone" size={18} />
            <View className="flex-1">
              <Text className="mb-0.5 text-sm font-semibold text-foreground">Land Line No.</Text>
              <Text className="text-sm text-muted-foreground">{APP_LINKS.PHONE.LAND_LINE}</Text>
            </View>
          </TouchableOpacity>

          {/* FAX */}
          <View className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="printer" size={18} />
            <View className="flex-1">
              <Text className="mb-0.5 text-sm font-semibold text-foreground">FAX</Text>
              <Text className="text-sm text-muted-foreground">{APP_LINKS.PHONE.FAX}</Text>
            </View>
          </View>

          {/* Email */}
          <TouchableOpacity
            onPress={() => openEmailAddress(APP_LINKS.EMAIL.DAT_SHIL_MEG)}
            activeOpacity={0.7}
            className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="mail" size={18} />
            <View className="flex-1">
              <Text className="mb-0.5 text-sm font-semibold text-foreground">Email</Text>
              <Text className="text-sm text-muted-foreground">{APP_LINKS.EMAIL.DAT_SHIL_MEG}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Technical Support Card */}
        <View className="gap-4 rounded-md border border-gray-200 bg-card p-5">
          <View className="items-center border-b border-gray-200 pb-3">
            <Text className="text-center text-base font-bold text-foreground">
              Technical Support
            </Text>
          </View>

          {/* Technical Email */}
          <TouchableOpacity
            onPress={() => openEmailAddress(APP_LINKS.EMAIL.NONGSTON_NIC)}
            activeOpacity={0.7}
            className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="mail" size={18} />
            <View className="flex-1">
              <Text className="mb-0.5 text-sm font-semibold text-foreground">Email</Text>
              <Text className="text-sm text-muted-foreground">{APP_LINKS.EMAIL.NONGSTON_NIC}</Text>
            </View>
          </TouchableOpacity>

          {/* Technical Phone */}
          <TouchableOpacity
            onPress={() => openPhoneNumber(APP_LINKS.PHONE.TECHNICAL)}
            activeOpacity={0.7}
            className="bg-muted/30 flex-row items-center gap-3 rounded-md border border-gray-200 p-3.5">
            <Icon name="smartphone" size={18} />
            <View className="flex-1">
              <Text className="mb-0.5 text-sm font-semibold text-foreground">Phone Number</Text>
              <Text className="text-sm text-muted-foreground">{APP_LINKS.PHONE.TECHNICAL}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Logos */}
        <FooterImg />
      </Container>
    </SafeAreaView>
  );
}
