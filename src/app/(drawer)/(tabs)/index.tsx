import { StackHeader } from '@components/layout';
import { HomeScreen } from '@features/home/screens';
import { ProfileUpdateScreen } from '@features/profile';

export default function Home() {
  return (
    <>
      <StackHeader />
      <ProfileUpdateScreen />
    </>
  );
}
