import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    gatewaySubscriptionId: { type: String, rdefault: ""},
    gatewaySubscriptionToken: { type: String, default: "" },
    planSlug: { type: String, default: "" },
    priceSlug: { type: String, default: '' },
    status: { type: String, default: "" },
},
{timestamps: true});

const subscriptionModel = mongoose.models.subscription || mongoose.model("subscription", subscriptionSchema);

export default subscriptionModel;