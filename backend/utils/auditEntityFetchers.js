import mongoose from 'mongoose'
import Lead from '../models/Lead.js'
import Appointment from '../models/Appointment.js'
import Activity from '../models/Activity.js'
import Campaign from '../models/Campaign.js'
import User from '../models/User.js'

export const fetchLead = (req) => Lead.findById(req.params.id).lean()
export const fetchAppointment = (req) => Appointment.findById(req.params.id).lean()
export const fetchActivity = (req) => Activity.findById(req.params.id).lean()
export const fetchCampaign = (req) => Campaign.findById(req.params.id).lean()
export const fetchClient = (req) => User.findById(req.params.id).lean()
export const fetchLoan = (req) => {
  const Loan = mongoose.models.Loan
  if (!Loan) return null
  return Loan.findById(req.params.id).lean()
}
