import express from 'express'
import { Initpaystack, paystackCustomer, paystackInit, paystackSubscription} from '../controllers/billingController.js'

const billingRouter = express.Router()

billingRouter.post('/initialize-paystack', Initpaystack)
billingRouter.post('/paystack-subscription', paystackSubscription)
billingRouter.post('/paystack-customer', paystackCustomer)




export default billingRouter;