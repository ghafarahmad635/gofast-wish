import { Html, Head, Body, Container, Tailwind, Text, Link } from "@react-email/components";

interface ChangeEmailConfirmationEmailProps {
  name?: string | null;
  currentEmail: string;
  newEmail: string;
  approveUrl: string;
}

export function ChangeEmailConfirmationEmail({
  name,
  currentEmail,
  newEmail,
  approveUrl,
}: ChangeEmailConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans text-gray-900">
          <Container className="bg-white max-w-lg mx-auto my-10 p-8 rounded-xl shadow">
            <Text className="text-xl font-semibold mb-2">Approve Email Change</Text>

            <Text>Hello {name?.trim() ? name : "there"},</Text>

            <Text className="mt-2">
              We received a request to change the email on your GoFast Wish account.
            </Text>

            <Container className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
              <Text className="m-0 text-sm text-gray-700">
                <b>Current email:</b> {currentEmail}
              </Text>
              <Text className="m-0 text-sm text-gray-700">
                <b>New email:</b> {newEmail}
              </Text>
            </Container>

            <Text className="mt-4">
              If you made this request, approve it using the button below:
            </Text>

            <Link
              href={approveUrl}
              className="inline-block mt-2 bg-black text-white px-4 py-3 rounded-lg text-sm font-semibold"
            >
              Approve email change
            </Link>

            <Text className="text-sm mt-6 text-gray-600">
              If you did not request this, you can safely ignore this email.
            </Text>

            <Text className="text-xs mt-2 text-gray-500 break-all">
              Or copy and paste this link:
              <br />
              {approveUrl}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
