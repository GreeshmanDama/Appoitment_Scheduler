import express from "express"
import { createDoctor, dashboardStats, getAppointments, getDoctors, updateDoctor } from "./admin.controller.js"
import { allowRoles } from "../../middleware/role.middleware.js"
import { protectedRoute } from "../../middleware/auth.middleware.js"

const adminRoute = express.Router()

adminRoute.post("/create-doctor", protectedRoute, allowRoles("admin") , createDoctor)
adminRoute.patch("/update-doctor/:doctorId", protectedRoute, allowRoles("admin") , updateDoctor)
adminRoute.patch("/dashboard/stats", protectedRoute, allowRoles("admin") , dashboardStats)
adminRoute.patch("/doctors", protectedRoute, allowRoles("admin") , getDoctors)
adminRoute.patch("/appointments", protectedRoute, allowRoles("admin") , getAppointments)

export default adminRoute