import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { Container, MantineProvider, Paper, Title } from '@mantine/core';
import { AssessmentForm } from './features/assessment/AssessmentForm';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container size="sm" my="xl">
        <Paper withBorder shadow="sm" p="xl">
          <Title order={1} size="h2" mb="lg">
            Geriatric Care Assessment
          </Title>
          <AssessmentForm />
        </Paper>
      </Container>
    </MantineProvider>
  );
}
