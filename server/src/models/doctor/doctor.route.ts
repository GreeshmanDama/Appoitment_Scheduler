import express from "express"
import { createDoctor } from "./doctor.controller.js"
import { allowRoles } from "../../middleware/role.middleware.js"

const doctorRoute = express.Router()

doctorRoute.post("/create-doctor", allowRoles("admin") ,createDoctor)

export default doctorRoute