import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
  Section,
} from "@react-email/components";

interface LoginOtpEmailProps {
  otp: string;
}

export const LoginOtpEmail = ({ otp }: LoginOtpEmailProps) => {
  return (
    <Html>
      <Preview>Your GoFast Wish login code</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-50 text-gray-800">
          <Container className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-md">
            <Heading className="text-2xl font-semibold text-center text-indigo-600 mb-4">
              Login Verification Code
            </Heading>
            <Text className="text-center text-gray-700 mb-4">
              Enter the code below to access your account:
            </Text>
            <Section className="bg-indigo-50 rounded-md py-4 text-center mb-6">
              <Text className="text-3xl tracking-widest font-bold text-indigo-700">
                {otp}
              </Text>
            </Section>
            <Text className="text-sm text-gray-600 text-center">
              This code expires in 10 minutes.  
              Didn’t try to sign in? Please secure your account.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
