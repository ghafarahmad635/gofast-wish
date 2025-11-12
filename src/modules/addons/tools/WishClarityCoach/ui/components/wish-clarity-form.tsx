// ../components/wish-clarity-form.tsx
'use client'

import { MultiStepFormWrapper, Step } from '@/components/multi-step-form-wrapper'
import StepBasic from './steps/StepBasic'
import StepImportance from './steps/StepImportance'
import StepImpact from './steps/StepImpact'
import StepObstacles from './steps/StepObstacles'
import StepDuration from './steps/StepDuration'
import StepSuccess from './steps/StepSuccess'
import StepDeadline from './steps/StepDeadline'
import StepSmallStep from './steps/StepSmallStep'
import {
  formSchema,
  type FormValues,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
} from '../../schema'
interface Props{
  isPending?:boolean
  onGenerate: (values: FormValues) => Promise<void> | void
}
export default function GenerateForm({
  onGenerate,
  isPending=false
}: Props) {
  const initial: Partial<FormValues> = {
    goal: '',
    wish_importance: '',
    wish_impact: '',
    wish_obstacles: '',
    wish_duration: '',
    wish_success: '',
    wish_deadline: '',
    wish_small_step: '',
  }

  return (
    <MultiStepFormWrapper<FormValues>
      schema={formSchema}
      isPending={isPending}
      initialData={initial}
      allowStepReset={true}
      allowSkipSteps={false}
      showProgressBar
      showStepIndicator
      autoSave
      showStepTitle={false}
      completeButtonText="Generate"
      onComplete={async (data) => {
        await onGenerate(data)
      }}
    >
      <Step title="Your Wish" schema={step1Schema}>
        <StepBasic />
      </Step>
      <Step title="Why It Matters" schema={step2Schema}>
        <StepImportance />
      </Step>
      <Step title="Life Impact" schema={step3Schema}>
        <StepImpact />
      </Step>
      <Step title="Roadblocks" schema={step4Schema}>
        <StepObstacles />
      </Step>
      <Step title="Timeframe" schema={step5Schema}>
        <StepDuration />
      </Step>
      <Step title="Wish Success" schema={step6Schema}>
        <StepSuccess />
      </Step>
      <Step title="Wish Deadline" schema={step7Schema}>
        <StepDeadline />
      </Step>
      <Step title="Wish Small Step" schema={step8Schema}>
        <StepSmallStep />
      </Step>
    </MultiStepFormWrapper>
  )
}
