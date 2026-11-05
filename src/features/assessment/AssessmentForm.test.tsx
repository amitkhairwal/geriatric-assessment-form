import { render, screen, userEvent, waitFor } from '@test-utils';
import { AssessmentForm } from './AssessmentForm';
import { SAMPLE_PATIENT } from './values';

const loadSample = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Load sample patient' }));

const save = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /Save assessment/ }));

describe('AssessmentForm', () => {
  it('saves the parsed values, not the raw form state', async () => {
    let finishSave = () => {};
    const onSave = vi.fn(() => new Promise<void>((resolve) => (finishSave = resolve)));
    const user = userEvent.setup();
    render(<AssessmentForm onSave={onSave} />);

    await loadSample(user);

    // Zod trims the name. If the raw state were saved, the spaces would survive.
    const name = screen.getByLabelText(/Patient name/);
    await user.clear(name);
    await user.paste('  Sushila Deshpande  ');
    await save(user);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(SAMPLE_PATIENT));
    expect(screen.getByRole('button', { name: /Save assessment/ })).toBeDisabled();

    finishSave();
    expect(await screen.findByText('Assessment saved')).toBeInTheDocument();
    expect(screen.getByText(/"patientName": "Sushila Deshpande"/)).toBeInTheDocument();
  });

  it('only shows the error of a field once the nurse has left it', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm onSave={vi.fn()} />);

    await user.type(screen.getByLabelText(/Medical record number/), 'MRN-4821');
    expect(screen.queryByText('Must look like MRN-004821')).not.toBeInTheDocument();

    await user.tab();
    expect(screen.getByText('Must look like MRN-004821')).toBeInTheDocument();
    expect(
      screen.queryByText('Patient name must be at least 2 characters')
    ).not.toBeInTheDocument();
  });

  it('keeps a Barthel score as typed and rejects it', async () => {
    const user = userEvent.setup();
    render(<AssessmentForm onSave={vi.fn()} />);

    const barthel = screen.getByLabelText(/Barthel Index/);
    await user.type(barthel, '105');
    await user.tab();

    expect(barthel).toHaveValue('105');
    expect(screen.getByText('Barthel Index ranges from 0 to 100')).toBeInTheDocument();
  });
});
