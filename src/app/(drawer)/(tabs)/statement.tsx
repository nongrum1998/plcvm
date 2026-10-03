import { StackHeader } from '@components/layout/stack-header';
import { PensionStatementScreen } from '@features/pension-statements/screens/pension-statement';

export default function page() {
  return (
    <>
      <StackHeader />
      <PensionStatementScreen />
    </>
  );
}
