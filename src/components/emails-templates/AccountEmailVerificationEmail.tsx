import {
  Html,
  Head,
  Body,
  Container,
  Tailwind,
  Text,
  Link,
  Hr,
} from "@react-email/components";

interface AccountEmailVerificationEmailProps {
  name?: string | null;
  verifyUrl: string;
  appName?: string;
  supportEmail?: string;
}

export function AccountEmailVerificationEmail({
  name,
  verifyUrl,
  appName = "GoFast Wish",
  supportEmail = "info@gofastwish.com",
}: AccountEmailVerificationEmailProps) {
  const safeName = name?.trim() ? name : "there";

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="mx-auto my-10 max-w-lg rounded-xl bg-white p-8 shadow">
            <Text className="mb-2 text-xl font-semibold">Verify your email</Text>

            <Text className="text-sm text-gray-600">
              Hi {safeName}, please confirm your email address to activate your {appName} account.
            </Text>

            <Link
              href={verifyUrl}
              className="mt-5 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Verify email
            </Link>

            <Text className="mt-6 text-sm text-gray-600">
              If the button doesn’t work, copy and paste this link into your browser:
            </Text>

            <Text className="mt-2 break-all rounded-lg bg-gray-100 p-3 text-xs text-gray-700">
              {verifyUrl}
            </Text>

            <Hr className="my-6 border-gray-200" />

            <Text className="text-xs text-gray-500">
              If you didn’t request this, ignore this email. Need help? Contact{" "}
              <Link href={`mailto:${supportEmail}`} className="text-gray-900 underline">
                {supportEmail}
              </Link>
              .
            </Text>

            <Text className="mt-4 text-[10px] text-gray-400">
              Security tip: {appName} will never ask you for your password by email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
