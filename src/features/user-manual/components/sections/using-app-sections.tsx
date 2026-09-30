import { Text, View } from 'react-native';
import { FooterImg } from '@components/common';

import {
  UserManualSectionCard as SectionCard,
  UserManualStepImage as StepImage,
} from '../../components';

/**
 * "Using the App" tab content for the Pensioner app user manual.
 *
 * Renders sections 7–10 covering photo submission, approval status checks,
 * changing the password and the MEDA assistant, followed by the bottom
 * partner logos.
 *
 * @returns The using-the-app section cards rendered as a vertical stack.
 */
export function UserManualUsingAppSections() {
  return (
    <>
      {/* 7. Submit Photo & Declaration */}
      <SectionCard stepNumber="7" title="Taking Photo & Submitting Form">
        <View className="gap-4">
          <Text className="text-lg font-medium leading-7 text-slate-900">
            <Text className="font-black text-blue-800">1. </Text>
            After logging in, tap the big{' '}
            <Text className="font-black">&quot;Submit Photo&quot;</Text> button.
          </Text>

          <StepImage
            placeholderText="Camera Face Oval Screen"
            caption="Hold phone straight. Keep face inside circle with good room light."
          />

          <Text className="text-lg font-medium leading-7 text-slate-900">
            <Text className="font-black text-blue-800">2. </Text>
            Your photo is submitted automatically to the Treasury Officer.
          </Text>

          <Text className="text-lg font-medium leading-7 text-slate-900">
            <Text className="font-black text-blue-800">3. </Text>
            Complete the two quick Self Declarations:
          </Text>

          <View className="gap-2 rounded-md border border-gray-200 bg-gray-50 p-4">
            <Text className="text-base font-bold leading-6 text-slate-900">
              • <Text className="font-black text-blue-900">Non-Employment Form:</Text> Required for
              normal pensioners.
            </Text>
            <Text className="text-base font-bold leading-6 text-slate-900">
              • <Text className="font-black text-blue-900">Non-Marriage Form:</Text> Required for
              family pensioners.
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* 8. Check Status */}
      <SectionCard stepNumber="8" title="Checking Your Approval Status">
        <Text className="text-lg font-medium leading-7 text-slate-900">
          You can check if your photo was accepted anytime by tapping{' '}
          <Text className="font-black text-blue-800">&quot;Check Status&quot;</Text> on the home
          screen.
        </Text>
        <StepImage
          placeholderText="Check Verification Status Screen"
          caption="Green tick shows Approved status"
        />
      </SectionCard>

      {/* 9. Change Password */}
      <SectionCard stepNumber="9" title="How to Change Password">
        <Text className="text-lg font-medium leading-7 text-slate-900">
          If you want to choose a new password, select{' '}
          <Text className="font-black text-blue-800">&quot;Change Password&quot;</Text> from the app
          menu.
        </Text>
        <StepImage
          placeholderText="Change Password Screen"
          caption="Type your current password and new password"
        />
      </SectionCard>

      {/* 10. MEDA Chatbot */}
      <SectionCard stepNumber="10" title="Ask MEDA Assistant for Help">
        <Text className="text-lg font-medium leading-7 text-slate-900">
          Need instant answers? Tap <Text className="font-black text-blue-800">MEDA Chatbot</Text>{' '}
          icon to ask questions anytime.
        </Text>
        <StepImage
          placeholderText="MEDA Chatbot Screen"
          caption="Tap the chat icon on the bottom corner"
        />
      </SectionCard>

      {/* Bottom Logos */}
      <View className="mt-4 py-6">
        <FooterImg />
      </View>
    </>
  );
}
