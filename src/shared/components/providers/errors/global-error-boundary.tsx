import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '@utils/logger/logger';
import { Button } from '../../ui/button';
import { Container } from '../../layout/container';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('[GlobalErrorBoundary] caught error:', error, errorInfo);
    }
  }

  private handleReset = async () => {
    try {
      if (__DEV__) {
        // In dev, we can't easily "restart" but we can clear state
        this.setState({ hasError: false, error: null });
      }
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container>
          <SafeAreaView className="flex-1">
            <View className="flex-1 items-center justify-center px-6">
              <View className="w-full overflow-hidden rounded-md border border-border p-8">
                <View className="items-center">
                  <Text className="mb-3 text-center text-2xl font-bold text-destructive">
                    Something went wrong
                  </Text>

                  <Text className="text-graphite mb-8 text-center text-base">
                    An unexpected error occurred. We&apos;ve been notified and are looking into it.
                  </Text>

                  {__DEV__ && this.state.error && (
                    <View className="bg-graphite/10 mb-8 w-full rounded-md p-4">
                      <Text className="font-mono text-xs text-destructive">
                        {this.state.error.toString()}
                      </Text>
                    </View>
                  )}

                  <View className="gap-y-2">
                    <Button
                      onPress={this.handleReset}
                      activeOpacity={0.8}
                      size={'lg'}
                      className="w-full"
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                      Try Again
                    </Button>

                    <Button
                      size={'lg'}
                      variant={'link'}
                      onPress={() => this.setState({ hasError: false, error: null })}
                      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      className="w-full">
                      Dismiss
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Container>
      );
    }

    return this.props.children;
  }
}
