import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Container, MantineProvider, Paper, Text, Title } from '@mantine/core';
import { AssessmentForm } from './features/assessment/AssessmentForm';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container size="md" my="xl">
        <Paper withBorder shadow="sm" p="xl">
          <Title order={1} size="h2">
            Geriatric Care Assessment
          </Title>
          <Text c="dimmed" mb="lg">
            Home visit check for patients aged 60 and over.
          </Text>
          <AssessmentForm />
        </Paper>
      </Container>
    </MantineProvider>
  );
}
