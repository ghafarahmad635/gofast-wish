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

interface ResetPasswordEmailProps {
  otp: string;
}

export const ResetPasswordEmail = ({ otp }: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Preview>Reset your password for GoFast Wish</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-50 text-gray-800">
          <Container className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-md">
            <Heading className="text-2xl font-semibold text-center text-rose-600 mb-4">
              Password Reset Request
            </Heading>
            <Text className="text-center text-gray-700 mb-4">
              Use the code below to reset your password:
            </Text>
            <Section className="bg-rose-50 rounded-md py-4 text-center mb-6">
              <Text className="text-3xl tracking-widest font-bold text-rose-700">
                {otp}
              </Text>
            </Section>
            <Text className="text-sm text-gray-600 text-center">
              This code is valid for 10 minutes.  
              If you didn’t request a password reset, you can safely ignore it.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
