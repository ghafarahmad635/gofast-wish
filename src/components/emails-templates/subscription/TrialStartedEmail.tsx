import { Html, Head, Body, Container, Tailwind, Text } from "@react-email/components"

interface TrialStartedEmailProps {
  name: string
}

export function TrialStartedEmail({ name }: TrialStartedEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white max-w-md mx-auto my-10 p-8 rounded-lg shadow">
            <Text className="text-xl font-bold text-green-600 mb-2">Trial Started 🎉</Text>
            <Text>Hi {name},</Text>
            <Text>
              Your free trial is now active. Explore all GoFast Wish Pro features for the next 7 days.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
