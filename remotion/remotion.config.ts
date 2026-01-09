import { Config } from '@remotion/cli/config';
import path from 'path';

Config.overrideWebpackConfig((config) => {
  // remotion 프로젝트 루트 디렉토리
  const remotionRoot = process.cwd();
  // 실제 앱 src 디렉토리
  const appSrcPath = path.resolve(remotionRoot, '../src');

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // @app alias로 실제 앱 src 폴더 참조
        '@app': appSrcPath,
        // 실제 앱 컴포넌트에서 사용하는 store를 mock store로 대체
        [path.join(appSrcPath, 'store/useAppStore')]: path.resolve(
          remotionRoot,
          'src/store/mockStore.tsx'
        ),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', ...((config.resolve?.extensions as string[]) || [])],
    },
  };
});
