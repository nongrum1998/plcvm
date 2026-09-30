import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FooterImg } from '@components/common';
import { Container } from '@components/layout';

import {
  GrievanceRedressalCard,
  PolicyHeader,
  PolicyOverviewCard,
  PolicySection,
} from '../components';

/** Privacy Policy screen: composes header, overview, clause Sections 1–7, grievance card, and footer logos. Route entry lives at src/app/privacy-policy/index.tsx. */
export function PrivacyPolicyScreen() {
  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1">
      <Container>
        <View className="flex-1 gap-5">
          <PolicyHeader />

          <PolicyOverviewCard />

          {/* Section 1 */}
          <PolicySection title="1. Information Collected & Manner of Collection">
            <Text className="text-sm leading-5 text-muted-foreground">
              When you register and use the App, the following information is collected and stored
              securely at NIC Data Centre, Shillong:
            </Text>
            <View className="gap-2 pl-1">
              <Text className="font-bold text-primary">(a) Registration Info: </Text>
              <Text className="ml-2 text-sm leading-5 text-foreground">
                Name, PPO No, Date of Birth, Bank account details as provided by the Directorate of
                Treasuries and Accounts, Government of Meghalaya, and password.
              </Text>
              <Text className="font-bold text-primary">(b) Automatically Collected Info: </Text>
              <Text className="ml-2 text-sm leading-5 text-foreground">
                User’s mobile device unique device ID.
              </Text>
              <Text className="font-bold text-primary">(c) Transactional Info: </Text>
              <Text className="ml-2 text-sm leading-5 text-foreground">
                Your photo and location details captured and uploaded to the server for face
                verification.
              </Text>
            </View>
          </PolicySection>

          {/* Section 2 */}
          <PolicySection title="2. Use of Information">
            <Text className="text-sm leading-5 text-foreground">
              (a) The personal information collected under Clause 1 will be stored securely at NIC
              Data Centre, Shillong.
            </Text>
            <Text className="text-sm leading-5 text-foreground">
              (b) Information may be disclosed as required by law, such as to comply with a subpoena
              or legal/administrative process.
            </Text>
          </PolicySection>

          {/* Section 3 */}
          <PolicySection title="3. Data Retention Policy">
            <Text className="text-sm leading-5 text-foreground">
              (a) Registration information will be retained for as long as you use the application
              or as required for ongoing legal processes.
            </Text>
            <Text className="text-sm leading-5 text-foreground">
              (b) Transactional data will be retained for a reasonable period and purged thereafter
              based on application requirements.
            </Text>
            <Text className="text-sm leading-5 text-foreground">
              (c) Aggregated datasets generated from user data are exempt from purging constraints.
            </Text>
          </PolicySection>

          {/* Section 4 */}
          <PolicySection title="4. Rights">
            <Text className="text-sm leading-5 text-foreground">
              (a) Registered users have the right to access their profile at any time to modify or
              update their supplied photo.
            </Text>
            <Text className="text-sm leading-5 text-foreground">
              (b) Deleting the App clears local phone data, but does not automatically purge data
              stored at the Data Centre. Data purging remains governed by Clauses 3(a) & 3(b).
            </Text>
          </PolicySection>

          {/* Section 5 */}
          <PolicySection title="5. Data Security">
            <Text className="text-sm leading-5 text-foreground">
              The App is equipped with standard security features to protect your information. Data
              is encrypted both in transit and at rest.
            </Text>
          </PolicySection>

          {/* Section 6 */}
          <PolicySection title="6. Disclosures and Transfers">
            <Text className="text-sm leading-5 text-foreground">
              (a) Transactional data may be shared with third parties after obtaining your consent,
              which you can withdraw at any time.
            </Text>
            <Text className="text-sm leading-5 text-foreground">
              (b) Save for legal/administrative processes or explicit user consent, no personal
              information will be disclosed to third parties.
            </Text>
          </PolicySection>

          {/* Section 7 */}
          <PolicySection title="7. Your Consent">
            <Text className="text-sm leading-5 text-foreground">
              By using the App, you consent to the processing of your information as set forth in
              this Privacy Policy.
            </Text>
          </PolicySection>

          {/* Section 8: Grievance Callout */}
          <GrievanceRedressalCard />

          {/* Bottom Logos */}
          <View className="mt-auto py-8">
            <FooterImg />
          </View>
        </View>
      </Container>
    </SafeAreaView>
  );
}
