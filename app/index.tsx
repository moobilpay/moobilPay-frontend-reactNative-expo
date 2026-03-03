import { useRouter } from 'expo-router';
import OnboardingScreen from '../modules/onboarding/OnboardingScreen';

export default function Page() {
  const router = useRouter();

  return (
    <OnboardingScreen
      onComplete={() => {
        router.push('/login');
      }}
    />
  );
}
