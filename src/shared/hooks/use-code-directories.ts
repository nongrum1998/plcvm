import { CodeDirectory } from '@sharedTypes/code-directory';
import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { CODE_TYPE, ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';

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
      })) || [],
  });
}
