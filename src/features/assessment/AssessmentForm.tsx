import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Code,
  Group,
  Input,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { schemaResolver, useForm } from '@mantine/form';
import { fakeSave } from './save';
import { Assessment, assessmentSchema, MOBILITY } from './schema';
import { AssessmentDraft, EMPTY_ASSESSMENT, SAMPLE_PATIENT } from './values';

type DateField = 'dateOfBirth' | 'assessmentDate' | 'followUpDate';

// 'home_visit' -> 'Home visit'
const toLabel = (value: string) => {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const MOBILITY_OPTIONS = MOBILITY.map((value) => ({ value, label: toLabel(value) }));

// Changing one of these can fix or break the rule shown on another field. After
// leaving it we check those fields again, but only the ones the nurse has already
// touched, so untouched fields stay quiet.
const DEPENDENTS: Partial<Record<keyof AssessmentDraft, (keyof AssessmentDraft)[]>> = {
  assessmentDate: ['dateOfBirth', 'followUpDate'],
  medicationCount: ['pharmacistReviewRequested'],
};

interface AssessmentFormProps {
  onSave?: (assessment: Assessment) => Promise<void>;
}

export function AssessmentForm({ onSave = fakeSave }: AssessmentFormProps) {
  const [saved, setSaved] = useState<Assessment | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  // The resolver only reports errors. transformValues is what turns the raw
  // inputs into the parsed Assessment, and onSubmit only calls it after the
  // validation passed, so the parse cannot throw here.
  const form = useForm<AssessmentDraft, Assessment>({
    initialValues: EMPTY_ASSESSMENT,
    validate: schemaResolver(assessmentSchema, { sync: true }),
    validateInputOnBlur: true,
    transformValues: (values) => assessmentSchema.parse(values),
  });

  const handleSubmit = async (assessment: Assessment) => {
    setSaved(null);
    setSaveFailed(false);
    try {
      await onSave(assessment);
      setSaved(assessment);
    } catch {
      setSaveFailed(true);
    }
  };

  const loadSample = () => {
    form.setValues(SAMPLE_PATIENT);
    setSaved(null);
    setSaveFailed(false);
  };

  const inputProps = (name: keyof AssessmentDraft) => {
    const props = form.getInputProps(name);
    return {
      ...props,
      onBlur: () => {
        props.onBlur();
        DEPENDENTS[name]?.forEach((other) => {
          if (form.isTouched(other)) {
            form.validateField(other);
          }
        });
      },
    };
  };

  // DateInput talks in 'YYYY-MM-DD' or null, the form keeps '' for empty.
  const dateProps = (name: DateField) => ({
    ...inputProps(name),
    value: form.values[name] || null,
    onChange: (value: string | null) => form.setFieldValue(name, value ?? ''),
    valueFormat: 'YYYY-MM-DD',
    placeholder: 'YYYY-MM-DD',
    clearable: true,
    withAsterisk: true,
  });

  const consentError = form.errors.consentObtained;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Medical record number"
          placeholder="MRN-004821"
          withAsterisk
          {...inputProps('mrn')}
        />
        <TextInput label="Patient name" withAsterisk {...inputProps('patientName')} />
        <DateInput label="Date of birth" defaultLevel="decade" {...dateProps('dateOfBirth')} />
        <DateInput
          label="Assessment date"
          maxDate={dayjs().format('YYYY-MM-DD')}
          {...dateProps('assessmentDate')}
        />
        <Select
          label="Mobility"
          placeholder="Select one"
          data={MOBILITY_OPTIONS}
          allowDeselect={false}
          withAsterisk
          {...inputProps('mobility')}
          value={form.values.mobility || null}
        />
        {/* clampBehavior none: a score the nurse typed is rejected, never pulled into range */}
        <NumberInput
          label="Barthel Index"
          step={5}
          min={0}
          max={100}
          clampBehavior="none"
          withAsterisk
          {...inputProps('barthelIndex')}
        />
        <NumberInput
          label="Regular medications"
          min={0}
          max={30}
          clampBehavior="none"
          withAsterisk
          {...inputProps('medicationCount')}
        />
        <Checkbox
          label="Pharmacist review requested"
          {...form.getInputProps('pharmacistReviewRequested', { type: 'checkbox' })}
        />
        <DateInput label="Next review date" {...dateProps('followUpDate')} />
        <Input.Wrapper label="Consent" error={consentError} withAsterisk>
          <Checkbox
            label="Patient or representative has given consent"
            error={!!consentError}
            {...form.getInputProps('consentObtained', { type: 'checkbox', withError: false })}
          />
        </Input.Wrapper>

        <Group justify="space-between">
          <Button variant="default" onClick={loadSample} disabled={form.submitting}>
            Load sample patient
          </Button>
          <Button type="submit" loading={form.submitting}>
            Save assessment
          </Button>
        </Group>

        {saved && (
          <Alert color="green" title="Assessment saved">
            <Code block>{JSON.stringify(saved, null, 2)}</Code>
          </Alert>
        )}
        {saveFailed && (
          <Alert color="red" title="Could not save">
            Something went wrong while saving. Your answers are still in the form, try again.
          </Alert>
        )}
      </Stack>
    </form>
  );
}
