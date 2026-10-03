import { StackHeader } from '@components/layout/stack-header';
import { FaceVerificationScreen } from '@features/verification/screens/face-verification';

export default function page() {
  return (
    <>
      <StackHeader />
      <FaceVerificationScreen />
    </>
  );
}
