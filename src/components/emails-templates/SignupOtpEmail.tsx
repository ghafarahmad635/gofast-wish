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

interface SignupOtpEmailProps {
  otp: string;
}

export const SignupOtpEmail = ({ otp }: SignupOtpEmailProps) => {
  return (
    <Html>
      <Preview>Verify your email to get started with GoFast Wish</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-50 text-gray-800">
          <Container className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-md">
            <Heading className="text-2xl font-semibold text-center text-blue-600 mb-4">
              Welcome to GoFast Wish 🚀
            </Heading>
            <Text className="text-center text-gray-700 mb-4">
              Please verify your email to complete registration.  
              Use the verification code below:
            </Text>
            <Section className="bg-gray-100 rounded-md py-4 text-center mb-6">
              <Text className="text-3xl tracking-widest font-bold text-gray-900">
                {otp}
              </Text>
            </Section>
            <Text className="text-sm text-gray-600 text-center">
              This code will expire in 10 minutes.  
              If you didn’t request this, please ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
