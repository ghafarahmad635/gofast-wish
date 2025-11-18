"use client";

import { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import {
  aiBudgetPlanArraySchema,
  AIBudgetPlanList,
  formSchema,
  FormValues,
  initialValues,
} from "../../schema";

import { MultiStepFormWrapper, Step } from "@/components/multi-step-form-wrapper";

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

const fixedSchema = z.object({
  fixed: formSchema.shape.fixed,
});

const variableSchema = z.object({
  variable: formSchema.shape.variable,
});

const debtsSchema = z.object({
  debts: formSchema.shape.debts,
});

const goalsSchema = z.object({
  goals: formSchema.shape.goals,
});

const prefsSchema = z.object({
  prefs: formSchema.shape.prefs,
});

interface Props {
  toolID: string;
  isPending?: boolean;
  onGenerate: (budgetPlans: AIBudgetPlanList) => void;
  onLoadingChange?: (loading: boolean) => void;
 
}

export default function GenerateBudgetForm({
  toolID,
  isPending,
  onGenerate,
  onLoadingChange,
  
}: Props) {
  const {
    object,
    submit,
    isLoading,
    stop,
    error,
  } = useObject({
    api: "/api/budget-planner",
    schema: aiBudgetPlanArraySchema,
    credentials: "include",
  });

  // reflect loading to parent
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // stream updates arrive as partial arrays
  useEffect(() => {
    if (Array.isArray(object)) {
      onGenerate(object as AIBudgetPlanList);
    }
  }, [object, onGenerate]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to generate budget plans");
    }
  }, [error]);

  // ✅ this is now for the budget planner, not the old bucket list tool
  const onSubmit = async (values: FormValues) => {
     const rawCount = values.plan_count ?? 3;
    const planCount = Math.min(Math.max(rawCount, 1), 6);
    onLoadingChange?.(true);
     onGenerate([])
     submit({
   
        id: toolID,  
        values,      
         planCount,
      
    });
  };

  return (
    <MultiStepFormWrapper<FormValues>
      schema={formSchema}
      initialData={initialValues}
      allowSkipSteps={false}
      showProgressBar={false}
      showStepIndicator
      showStepTitle={false}
      completeButtonText={
        isPending || isLoading ? "Working..." : "Get AI Plans"
      }
      onComplete={onSubmit}    
      autoSave
      autoSaveDelay={600}
    >
      <Step title="Income" schema={incomeSchema}>
        <IncomeStep />
      </Step>

      <Step title="Fixed" schema={fixedSchema}>
        <FixedStep />
      </Step>

      <Step title="Variable" schema={variableSchema}>
        <VariableStep />
      </Step>

      <Step title="Debts" schema={debtsSchema}>
        <DebtsStep />
      </Step>

      <Step title="Goals" schema={goalsSchema}>
        <GoalsStep />
      </Step>

      <Step title="Preferences" schema={prefsSchema}>
        <PrefsStep />
      </Step>

      <Step title="Review">
        <ReviewStep />
      </Step>
    </MultiStepFormWrapper>
  );
}
