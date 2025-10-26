import { Html, Head, Body, Container, Tailwind, Text } from "@react-email/components"

interface SubscriptionActivatedEmailProps {
  title: string
  message: string
}

export function SubscriptionActivatedEmail({ title, message }: SubscriptionActivatedEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white max-w-md mx-auto my-10 p-8 rounded-lg shadow">
            <Text className="text-2xl font-bold mb-2 text-blue-600">{title}</Text>
            <Text className="text-gray-700">{message}</Text>
            <Text className="text-sm mt-6 text-gray-500">– The GoFast Wish Team</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
