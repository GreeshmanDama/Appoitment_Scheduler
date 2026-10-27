import express from "express"
import { allowRoles } from "../../middleware/role.middleware.js"
import { protectedRoute } from "../../middleware/auth.middleware.js"

const doctorRoute = express.Router()



export default doctorRoute