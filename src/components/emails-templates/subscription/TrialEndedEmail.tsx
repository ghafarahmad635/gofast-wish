import { Html, Head, Body, Container, Tailwind, Text, Link } from "@react-email/components"

interface TrialEndedEmailProps {
  name: string
}

export function TrialEndedEmail({ name }: TrialEndedEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white max-w-md mx-auto my-10 p-8 rounded-lg shadow">
            <Text className="text-xl font-bold text-yellow-600 mb-2">Trial Ended</Text>
            <Text>Hi {name},</Text>
            <Text>Your trial period has ended. Upgrade now to continue accessing premium features.</Text>
            <Link href="https://gofastwish.com/pricing" className="text-blue-600 font-semibold">
              Upgrade Now →
            </Link>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
