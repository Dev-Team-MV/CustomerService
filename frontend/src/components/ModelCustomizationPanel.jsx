import ModelCustomizationCore from './models/Customization/ModelCustomizationCore'

const ModelCustomizationPanel = ({
  model,
  compareModel,
  initialOptions = {},
  compareOptions = {},
  onConfirm,
  labels = {},
  confirmLabel = "Confirm Selection"
}) => {
  return (
    <ModelCustomizationCore
      model={model}
      initialOptions={initialOptions}
      compareModel={compareModel}
      compareInitialOptions={compareOptions}
      onConfirm={onConfirm}
      labels={labels}
      confirmLabel={confirmLabel}
    />
  )
}

export default ModelCustomizationPanel