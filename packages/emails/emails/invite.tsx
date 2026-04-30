import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export interface InviteEmailProps {
  workspaceName: string;
  inviterName: string;
  acceptUrl: string;
  role: string;
}

export default function InviteEmail({
  workspaceName,
  inviterName,
  acceptUrl,
  role,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to {workspaceName} on ChiefOS.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl p-6">
            <Heading className="text-2xl font-semibold tracking-tight text-zinc-900">
              You're invited to {workspaceName}
            </Heading>
            <Text className="text-zinc-700">
              {inviterName} invited you to join <strong>{workspaceName}</strong> on ChiefOS as a{' '}
              <strong>{role.toLowerCase()}</strong>.
            </Text>
            <Section className="my-6">
              <Button
                href={acceptUrl}
                className="rounded-md bg-violet-600 px-5 py-3 text-sm font-medium text-white"
              >
                Accept invite
              </Button>
            </Section>
            <Text className="text-sm text-zinc-500">
              Or paste this link into your browser:
              <br />
              <span className="break-all text-zinc-700">{acceptUrl}</span>
            </Text>
            <Hr className="border-zinc-200" />
            <Text className="text-xs text-zinc-500">
              If you weren't expecting this, ignore this email — nothing will happen.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

InviteEmail.PreviewProps = {
  workspaceName: 'Demo Agency',
  inviterName: 'Alex',
  role: 'MEMBER',
  acceptUrl: 'https://chiefos.app/invite/abcd1234',
} satisfies InviteEmailProps;