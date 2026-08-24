const notImplemented = (req, res) => {
  res.status(501).json({ message: 'Loan controller not implemented yet' })
}

export const getLoans = notImplemented
export const createLoan = notImplemented
export const getLoanDashboard = notImplemented
export const getLoanAlerts = notImplemented
export const getLoanById = notImplemented
export const updateLoan = notImplemented
export const deleteLoan = notImplemented
export const updateLoanStage = notImplemented
export const updateLoanStatus = notImplemented
export const updateLoanDocumentStatus = notImplemented
export const uploadLoanDocument = notImplemented
export const deleteLoanDocumentFile = notImplemented
export const updateLoanNextAction = notImplemented
export const addLoanNote = notImplemented
export const getLoanTimeline = notImplemented
