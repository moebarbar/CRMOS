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

export interface WelcomeEmailProps {
  firstName?: string;
  workspaceName: string;
  workspaceUrl: string;
}

export default function WelcomeEmail({
  firstName = 'there',
  workspaceName,
  workspaceUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ChiefOS — your workspace {workspaceName} is ready.</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl p-6">
            <Heading className="text-2xl font-semibold tracking-tight text-zinc-900">
              Welcome to ChiefOS, {firstName}.
            </Heading>
            <Text className="text-zinc-700">
              Your workspace <strong>{workspaceName}</strong> is ready. Sign in any time at the
              link below.
            </Text>
            <Section className="my-6">
              <Button
                href={workspaceUrl}
                className="rounded-md bg-violet-600 px-5 py-3 text-sm font-medium text-white"
              >
                Open {workspaceName}
              </Button>
            </Section>
            <Hr className="border-zinc-200" />
            <Text className="text-sm text-zinc-500">
              You're getting this because you signed up for ChiefOS. If that wasn't you, ignore
              this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: 'Alex',
  workspaceName: 'Demo Agency',
  workspaceUrl: 'https://chiefos.app/demo',
} satisfies WelcomeEmailProps;