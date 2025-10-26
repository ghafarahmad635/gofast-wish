import { Html, Head, Body, Container, Tailwind, Text } from "@react-email/components"

interface SubscriptionCanceledEmailProps {
  name: string
  message: string
}

export function SubscriptionCanceledEmail({ name, message }: SubscriptionCanceledEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white max-w-md mx-auto my-10 p-8 rounded-lg shadow">
            <Text className="text-xl font-bold text-red-600 mb-2">Subscription Canceled</Text>
            <Text>Hello {name},</Text>
            <Text>{message}</Text>
            <Text className="text-sm mt-6 text-gray-500">
              You can restart your subscription anytime.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
