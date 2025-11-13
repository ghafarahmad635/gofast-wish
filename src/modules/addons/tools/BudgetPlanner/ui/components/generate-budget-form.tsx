"use client";

import { MultiStepFormWrapper, Step } from "@/components/multi-step-form-wrapper";
import { z } from "zod";


import { formSchema, FormValues, initialValues } from "../../schema";
import IncomeStep from "./steps/IncomeStep";
import FixedStep from "./steps/FixedStep";
import VariableStep from "./steps/VariableStep";
import DebtsStep from "./steps/DebtsStep";
import GoalsStep from "./steps/GoalsStep";
import PrefsStep from "./steps/PrefsStep";
import ReviewStep from "./steps/ReviewStep";

// Per step schemas for validation at each stage
const incomeSchema = z.object({
  net_monthly_income: formSchema.shape.net_monthly_income,
  other_income: formSchema.shape.other_income,
});
const fixedSchema = z.object({ fixed: formSchema.shape.fixed });
const variableSchema = z.object({ variable: formSchema.shape.variable });
const debtsSchema = z.object({ debts: formSchema.shape.debts });
const goalsSchema = z.object({ goals: formSchema.shape.goals });
const prefsSchema = z.object({ prefs: formSchema.shape.prefs });

export default function GenerateBudgetForm({
  onComplete,
  isPending,
}: {
  onComplete: (values: FormValues) => void | Promise<void>;
  isPending?: boolean;
}) {
  return (
    <MultiStepFormWrapper<FormValues>
      schema={formSchema}
      initialData={initialValues}
      allowSkipSteps={false}
      showProgressBar={false}
      showStepIndicator
      showStepTitle
      completeButtonText={isPending ? "Working..." : "Get AI Plan"}
      onComplete={onComplete}
      autoSave
      autoSaveDelay={600}
    >
      <Step title="Income" schema={incomeSchema}><IncomeStep /></Step>
      <Step title="Fixed" schema={fixedSchema}><FixedStep /></Step>
      <Step title="Variable" schema={variableSchema}><VariableStep /></Step>
      <Step title="Debts" schema={debtsSchema}><DebtsStep /></Step>
      <Step title="Goals" schema={goalsSchema}><GoalsStep /></Step>
      <Step title="Preferences" schema={prefsSchema}><PrefsStep /></Step>
      <Step title="Review"><ReviewStep /></Step>
    </MultiStepFormWrapper>
  );
}
