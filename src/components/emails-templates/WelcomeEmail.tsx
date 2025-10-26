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

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Html>
      <Preview>Welcome aboard, {name}! 🎉</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-50 text-gray-800">
          <Container className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-md">
            <Heading className="text-2xl font-semibold text-center text-green-600 mb-4">
              Welcome to GoFast Wish 🌟
            </Heading>
            <Text className="text-gray-700 mb-4 text-center">
              Hey {name}, we’re thrilled to have you on board!  
              Explore your goals, set your dreams, and start tracking progress today.
            </Text>
            <Section className="text-center">
              <a
                href="https://gofastwish.com/dashboard"
                className="inline-block bg-green-600 text-white px-5 py-2 rounded-md font-medium hover:bg-green-700"
              >
                Go to Dashboard
              </a>
            </Section>
            <Text className="text-xs text-gray-500 text-center mt-6">
              Thanks for joining GoFast Wish — dream fast, achieve faster.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
