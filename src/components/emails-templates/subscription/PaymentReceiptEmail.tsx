import { Html, Head, Body, Container, Tailwind, Text, Link } from "@react-email/components"

interface PaymentReceiptEmailProps {
  name: string
  amount: number
  date: string
  invoiceUrl?: string | null
}

export function PaymentReceiptEmail({ name, amount, date, invoiceUrl }: PaymentReceiptEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="bg-white max-w-lg mx-auto my-10 p-8 rounded-xl shadow">
            <Text className="text-xl font-semibold mb-2">Payment Receipt</Text>
            <Text>Hello {name},</Text>
            <Text>
              We’ve received your payment of <b>${amount.toFixed(2)}</b> on {date}.
            </Text>
            {invoiceUrl && (
              <Link href={invoiceUrl} className="text-blue-600">
                View Invoice
              </Link>
            )}
            <Text className="text-sm mt-6 text-gray-600">
              Thank you for being a GoFast Wish customer.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
