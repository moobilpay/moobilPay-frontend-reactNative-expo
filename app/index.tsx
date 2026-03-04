import OnboardingScreen from '../modules/onboarding/OnboardingScreen';
import { useRouter } from 'expo-router';

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
