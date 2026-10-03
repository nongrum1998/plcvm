import { CodeDirectory } from '@sharedTypes/code-directory/code-directory';
import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { CODE_TYPE } from '@utils/constants/code-directories';
import { http } from '@utils/http/client';

type CodeTypeT = keyof typeof CODE_TYPE;

type UseCodeDirectoriesProps = {
  isEnable?: boolean;
  code: CodeTypeT;
};
export function useCodeDirectories({ code, isEnable = false }: UseCodeDirectoriesProps) {
  const { isSignedIn } = useAuthStore();
  const codetype = CODE_TYPE[code];

  return useQuery({
    queryKey: ['code', 'type', codetype],
    enabled: isEnable && isSignedIn,
    queryFn: () => http.post<CodeDirectory[]>(ENDPOINTS.CODE_DIRECTORIES, { codetype }),
    select: ({ data }) =>
      data?.map((val) => ({
        value: val.codevalue,
        label: val.description,
      })) || [
        {
          value: 'N/A',
          label: 'N/A',
        },
      ],
  });
}
