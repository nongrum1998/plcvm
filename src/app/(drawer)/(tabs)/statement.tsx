import { StackHeader } from '@components/layout';
import { PensionStatementScreen } from '@features/pension-statements/screens';

export default function page() {
  return (
    <>
      <StackHeader />
      <PensionStatementScreen />
    </>
  );
}
