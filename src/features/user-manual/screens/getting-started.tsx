import { Text, View } from 'react-native';
import { Button } from '@components';
import { APP_LINKS } from '@utils/constants';
import { openEmailAddress } from '@utils';

import {
  UserManualSectionCard as SectionCard,
  UserManualStepImage as StepImage,
} from '../components/';
import { USER_GETTING_STARTED_STEPS } from '../utils/guide-steps';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';

/**
 * "Getting Started" tab content for the Pensioner app user manual.
 *
 * Renders sections 1–6 covering what the app is for, eligibility, download,
 * device requirements, a five-step registration overview and the detailed
 * first-time registration walkthrough (including the family-pensioner note
 * and the invalid-PPO helpdesk).
 *
 * @returns The getting-started section cards rendered as a vertical stack.
 */
export function UserManualGettingStartedScreen() {
  return (
    <Container className="gap-5">
      <View className="gap-2">
        <View className="bg-primary/10 self-start py-1">
          <Text className="text-sm font-bold uppercase tracking-wider text-primary">Starting</Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Getting Started
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">
          Easy Step-by-Step Instructions
        </Text>
      </View>
      {/* 1. Introduction */}
      <SectionCard title="What is This App For?">
        <Text className="text-lg font-medium leading-7 text-slate-900">
          Pensioners in Meghalaya no longer need to travel to the Treasury Office in person to
          submit their Life Certificate.
        </Text>
        <Text className="text-lg font-medium leading-7 text-slate-900">
          Using this mobile app on your smartphone, you can complete your liveness verification
          directly from home using your phone&apos;s camera.
        </Text>
        <StepImage
          placeholderText="Main Welcome Home Screen"
          caption="Main app home screen with easy big buttons"
          source={require('@assets/images/manual/home-screen.jpeg')}
        />
      </SectionCard>

      {/* 2. Eligibility Note */}
      <SectionCard stepNumber="2" title="Who Can Use This App?">
        <View className="gap-2 rounded-md border border-red-400 bg-red-50 p-5">
          <Text className="text-xl font-black text-red-950">⚠️ ELIGIBILITY CHECK:</Text>
          <Text className="text-lg font-bold leading-7 text-red-900">
            This app is strictly for Pensioners who draw pension through the Meghalaya Treasury
            Office (Treasury PDA).
          </Text>
          <Text className="mt-1 text-base font-semibold text-red-800">
            (Bank pension accounts will be supported in future updates).
          </Text>
        </View>
      </SectionCard>

      {/* 3. Download */}
      {/* <SectionCard stepNumber="3" title="How to Download the App">
        <Text className="text-lg font-medium leading-7 text-slate-900">
          Tap the big green button below to open Google Play Store on your phone:
        </Text>
        <Button size="lg" activeOpacity={0.8} onPress={() => openPlayStoreLink()}>
          ▶ Tap to Download on Play Store
        </Button>
        <StepImage
          placeholderText="Google Play Store App Listing Screen"
          caption="Search for 'Pensioner Life Certificate Meghalaya'"
          source={require("@assets/images/manual/log.jpeg")}
        />
      </SectionCard> */}

      {/* 4. Requirements */}
      <SectionCard stepNumber="4" title="What Your Phone Needs">
        <Text className="text-lg font-bold text-slate-900">Make sure your mobile phone has:</Text>
        <View className="gap-3 pt-1">
          <View className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <Text className="text-lg font-black text-blue-900">📷 Front Selfie Camera</Text>
            <Text className="mt-1 text-base font-medium leading-6 text-slate-800">
              A clear front camera (above 2 Megapixels).
            </Text>
          </View>

          <View className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <Text className="text-lg font-black text-blue-900">📱 Android Phone</Text>
            <Text className="mt-1 text-base font-medium leading-6 text-slate-800">
              Android version 5.0 or newer.
            </Text>
          </View>

          <View className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <Text className="text-lg font-black text-blue-900">🌐 Internet Connection</Text>
            <Text className="mt-1 text-base font-medium leading-6 text-slate-800">
              Active Mobile Data (SIM internet) or Wi-Fi.
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* 5. Registration (Clear Detailed Step Cards) */}
      <SectionCard stepNumber="6" title="First Time Registration Steps">
        <View className="gap-6">
          {USER_GETTING_STARTED_STEPS.map((item) => (
            <View
              key={item.step}
              className="gap-2 rounded-md border border-gray-200 bg-gray-50 p-4">
              <Text className="text-xl font-black text-blue-900">
                {item.step}: {item.title}
              </Text>

              <Text className="text-lg font-medium leading-7 text-slate-900">
                {item.description}
              </Text>

              <StepImage
                source={item.source}
                placeholderText={item.placeholder}
                caption={item.caption}
              />
            </View>
          ))}

          {/* Family Pensioner Note */}
          <View className="rounded-md border border-amber-500 bg-amber-100 p-5">
            <Text className="text-xl font-black text-amber-950">
              📌 IMPORTANT NOTE FOR FAMILY PENSIONERS:
            </Text>

            <Text className="mt-2 text-lg font-bold leading-7 text-amber-900">
              Do NOT enter your own personal Date of Birth!
            </Text>

            <Text className="mt-1 text-base font-medium leading-6 text-amber-900">
              Please enter the Date of Birth of the original Government Employee who passed away.
            </Text>
          </View>

          {/* Invalid PPO Helpdesk */}
          <View className="gap-3 rounded-md border border-blue-400 bg-blue-50 p-5">
            <Text className="text-xl font-black text-blue-950">
              Showing &quot;Invalid PPO&quot; Error?
            </Text>

            <Text className="text-base font-semibold leading-6 text-blue-900">
              Please contact or visit Treasury Helpdesk: Nokrek Building, 3rd Secretariat, Lower
              Lachumiere, Shillong - 793001
            </Text>

            <Button
              size="lg"
              activeOpacity={0.8}
              onPress={() => openEmailAddress(APP_LINKS.EMAIL.PENSIONER_HELP_DESK)}>
              ✉️ Email: {APP_LINKS.EMAIL.PENSIONER_HELP_DESK}
            </Button>
          </View>
        </View>
      </SectionCard>
      <FooterImg />
    </Container>
  );
}
