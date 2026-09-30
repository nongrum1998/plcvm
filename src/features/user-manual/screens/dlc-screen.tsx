import { Text, View } from 'react-native';
import { FooterImg } from '@components/common';

import {
  UserManualSectionCard as SectionCard,
  UserManualStepImage as StepImage,
} from '../components';
import { Container } from '@components/layout';
import { USER_MANUAL_DLC_STEPS } from '../utils/guide-steps';

/**
 * "Using the App" tab content for the Pensioner app user manual.
 *
 * Renders sections 7–10 covering photo submission, approval status checks,
 * changing the password and the MEDA assistant, followed by the bottom
 * partner logos.
 *
 * @returns The using-the-app section cards rendered as a vertical stack.
 */
export function UserManualDLCScreen() {
  return (
    <Container className="gap-5">
      {/* 7. Submit Photo & Declaration */}
      <View className="gap-2">
        <View className="bg-primary/10 self-start py-1">
          <Text className="text-sm font-bold uppercase tracking-wider text-primary">
            Registration
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Digital Life Registration
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">
          Easy Step-by-Step Instructions
        </Text>
      </View>
      <SectionCard title="Steps to Complete Digital Life Registration">
        <View className="gap-5">
          {USER_MANUAL_DLC_STEPS.map((item, index) => (
            <View key={index} className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <View className="self-start rounded-md bg-blue-700 px-3 py-1">
                <Text className="text-sm font-black text-white">{item.step}</Text>
              </View>
              <Text className="mt-2 text-xl font-black text-slate-900">{item.title}</Text>
              <Text className="mt-1 text-base font-semibold leading-6 text-slate-700">
                {item.desc}
              </Text>
              <StepImage
                source={item.source}
                placeholderText={item.placeholder}
                caption={item.caption}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Bottom Logos */}
      <FooterImg />
    </Container>
  );
}
