import axios from 'axios'
import https from 'https'
import userModel from '../models/userModel.js';
import crypto from 'crypto'
import express from 'express'
import authorizationModel from '../models/authorizationModel.js';
import subscriptionModel from '../models/subscriptionModel.js';

// Paystack API credentials
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackBaseUrl = 'https://api.paystack.co';
const plan = process.env.PAYSTACK_PLAN




const makeReq = (res, params) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        }

        const req = https.request(options, res => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            });

            res.on('end', () => {
                console.log(JSON.parse(data))
                resolve(JSON.parse(data))
            })
        }).on('error', error => {
            console.error(error)
            reject(error)
        })

        req.write(params)
        req.end()
    })
}


export const paystackInit = async (request, res) => {
    const { email, amount } = request.body


    const params = JSON.stringify({
        "email": email,
        "amount": amount * 100,
        "plan": "PLN_762pid74x3ctur4"
    })

    const result = await makeReq(res, params);
    console.log(result)

    return res.json({ success: true, data: result.data })
}

// Create a subscription
export const paystackSubscription = async (req, res) => {

    try {
        const { email } = req.body
        const user = await userModel.findOne({email})

        const response = await axios.post(`${paystackBaseUrl}/subscription`, {
            "customer": user.paystackCustomerCode,
            "plan": plan
        }, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        });

        // const authorizationUrl = response.data.data.authorization_url;
        // res.json({ authorizationUrl });
        return true
    } catch (error) {
        console.error(error);
        res.status(500).end({ message: 'Failed to create subscription' });
    }
};

// Create a paystack customer
export const paystackCustomer = async (req, res) => {
    const { email } = req.body


    try {
        // const { customer, plan } = req.body;

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        const response = await axios.post(`${paystackBaseUrl}/customer`, {
            customer,
            plan,
        }, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        });

        const customer_code = response.data.data.customer_code;
        console.log("Customer code:", customer_code)
        user.paystackCustomerCode = customer_code
        await user.save()

        res.json({ success: true, customer_code });
        // res.json(response.data.data)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create customer' });
    }
};



export const paystackSub = async (req, res) => {

    try {
        let { customer, plan } = req.body;
        const params = JSON.stringify({
            "customer": customer,
            "plan": plan
        })

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/subscription',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        }

        const request = https.request(options, apiRes => {
            let data = ''

            apiRes.on('data', (chunk) => {
                data += chunk
            });

            apiRes.on('end', () => {
                console.log(JSON.parse(data))
                res.status(200).json(JSON.parse(data));
            })
        }).on('error', error => {
            console.error(error)
        })

        request.write(params)
        request.end()
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

};







//Initialize payment and create a customer if customer doesn't exist yet
export const Initpaystack = async (req, res) => {
    const { email, amount, name, phone } = req.body;

    const user = await userModel.findOne({ email })

        if (!user) {
            return res.end({ success: false, message: "User not found" })
        }
    
    try {  
        if (!user.paystackCustomerCode) {
        const response = await axios.post(`${paystackBaseUrl}/customer`, {
            email,
            first_name: user.name,
            phone,
        }, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json'
            },
        });

        const customer_code = response.data.data.customer_code;
        console.log("Customer code:", customer_code)
        user.paystackCustomerCode = customer_code
        user.testing = "testing"
        await user.save()

    
        // res.end({ success: true, customer_code });
    }
        // res.json(response.data.data)
    } catch (error) {
        console.error(error);
        // res.status(500).end({ message: 'Failed to create customer' });
        return false
    }


      try {
        const response = await axios.post(`${paystackBaseUrl}/transaction/initialize`, {
            email,
            amount: amount * 100,
            "plan": plan
        }, {
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
            },
        }); 

        return res.status(201).json({
            status: 201,
            data: {
              message: 'processing',
              code: response.data.data.access_code,
              ref: response.data.data.reference,
            },
          });
        // res.json(response.data.data)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to initialize transaction' });
    }
};


async function savePaystackAuthorization(
    user,
    auth
  ) {
    if (
      auth.reusable &&
      !(await authorizationModel.findOne({ signature: auth.signature }))
    ) {
       await authorizationModel.create({
        userId: user.id,
        signature: auth.signature,
        code: auth.authorization_code,
        bin: auth.bin,
        last4: auth.last4,
        expMonth: auth.exp_month,
        expYear: auth.exp_year,
        cardType: auth.card_type,
        bank: auth.bank,
        countryCode: auth.country_code,
        brand: auth.brand,
        accountName: auth.account_name,
      });
    }
  }




const handleChargeSuccess = async (event) => {
    const { customer, amount, metadata, authorization } = event.data;
  
    let user;
    if (
      !(user = await userModel.findOne({
        paystackCustomerCode: customer.customer_code,
      }))
    ) {
      console.log('User not found');
      return false;
    }
  
    // if (metadata && metadata.paymentFor === 'topup') {
    //   const amountPaid = amount / 100;
    //   const creditUnitPrice = 340;
    //   const numCredits = amountPaid / creditUnitPrice;
  
    //   user.creditsCount += numCredits;
    //   await user.save();
    // }
  
    if (authorization) {
      savePaystackAuthorization(user, authorization);
    user.PaystackAuthorization = authorization
    user.paid = true 
    await user.save()
    }
  
    return true;
  };



  const handleSubscriptionCreated = async (event) => {
    const {
      status,
      subscription_code,
      email_token,
      customer,
      plan: plan,
      authorization,
    } = event.data;
  
    let user;
    if (
      !(user = await userModel.findOne({
        paystackCustomerCode: customer.customer_code,
      }))
    ) {
      console.log('User not found');
      return false;
    }
  
  
    // Delete existing subcription
    if (user.subscriptionId) {
      await subscriptionModel.deleteMany({
        userId: user._id,
      });
    }
  
    // Create a new subscription plan for the user
    const subscription = await subscriptionModel.create({
      userId: user._id,
      gatewaySubscriptionId: subscription_code,
      gatewaySubscriptionToken: email_token,
    //   planSlug: plan.slug,
    //   priceSlug: price.slug,
      status: status === 'active' ? 'ACTIVE' : 'INCOMPLETE',
    });

    await subscription.save()

    user.subscriptionId = subscription_code
    await user.save()
  
    if (authorization) {
      savePaystackAuthorization(user, authorization);
    }
  
    return true;
  };
  


  const handlePaystackWebhook = async (request, response) => {
    let body = request.body;
  
    const scretKey = process.env.PAYSTACK_SECRET_KEY;
  
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (scretKey) {
      // Validate event
      const hash = crypto
        .createHmac('sha512', scretKey)
        .update(JSON.stringify(body))
        .digest('hex');

  
      if (hash != request.headers['x-paystack-signature']) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return response.sendStatus(400);
      }
    }
  
    let success = true;
  
    const type = body.event;
  
    // Handle the event
    switch (type) {
      case 'charge.success':
        success = await handleChargeSuccess(body);
  
        console.log(`Handled event type ${type}.`);
  
        // console.log(body);
  
        break;
      case 'subscription.create':
        success = await handleSubscriptionCreated(body);
  
        console.log(`Handled event type ${type}.`);
  
    //     break;
    //   case 'subscription.not_renew':
    //     success = await handleSubscriptionNotRenew(body);
  
    //     console.log(`Handled event type ${type}.`);
  
    //     break;
    //   case 'subscription.disable':
    //     success = await handleSubscriptionDeleted(body);
  
    //     console.log(`Handled event type ${type}.`);
  
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${type}.`);
    }
  
    if (!success) {
      return response.status(400).send('Failed to handle event');
    } else {
      // Return a 200 response to acknowledge receipt of the event
      return response.status(200).send('Webhook event handled');
    }
  };
  
  export const registerPaystackWebhook = (app) => {
    // Create a `POST` endpoint to accept webhooks sent by Paystack.
    // We need `raw` request body to validate the integrity. Use express raw middleware to ensure express doesn't convert the request body to JSON.
    app.post('/handle/paystack/webhook', express.json(), handlePaystackWebhook);
  };












// Create a subscription plan
// export const subscribe = async (req, res) => {
//     try {
//         const {
//             // email,
//             name,
//             description,
//             amount,
//             interval, } = req.body;

//         const response = await axios.post(`${paystackBaseUrl}/plan`, {
//             // email,
//             name,
//             description,
//             amount,
//             interval,
//         }, {
//             headers: {
//                 Authorization: `Bearer ${paystackSecretKey}`,
//             },
//         });
//         console.log(response)
//         // const planCode = response.data.data.plan_code;
//         // res.json({ planCode });

//         const customerId = response.data.data.customer_code
//         res.json({ customerId })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Failed to create plan' });
//     }
// };



