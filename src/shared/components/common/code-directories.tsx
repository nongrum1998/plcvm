import { useCodeDirectories } from '@hooks';
import { CODE_TYPE } from '@utils/constants';
import { SelectSheet } from '@components/ui';

type CodeTypeT = keyof typeof CODE_TYPE;

type CodeDirectoriesProps = {
  code: CodeTypeT;
  onSelect: (val: string) => void;
  selectVal: string;
  error: string;
};

export const CodeDirectories = ({ code, error, selectVal, onSelect }: CodeDirectoriesProps) => {
  const { data, isLoading, refetch, isFetching } = useCodeDirectories({ code });
  return (
    <SelectSheet
      label={code}
      title={code}
      loading={isFetching}
      refetch={refetch}
      onSelect={(val) => onSelect(val)}
      selectedValue={selectVal}
      options={data || []}
      disabled={isLoading || isFetching}
      error={error}
    />
  );
};
