import { useState } from "react"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import PaystackPop from "@paystack/inline-js"
import axios, { axiosPrivate } from "../config/axios"


const Home = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [amount, setamount] = useState('')
    const [phone, setPhone] = useState('')
    const [success, setSuccess] = useState(1)


    const handleSubscription = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post("/api/billing/initialize-paystack", { email, amount })
            console.log(data)
            const popUp = new PaystackPop()
            popUp.resumeTransaction(data.data.code)
           

            settimeout(() => {
                setSuccess(2)
            }, 10000)
            
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="min-h-screen bg-[#faf9f6]">
            <Navbar />
            <Header />
            <div className="mt-5 text-white flex items-center justify-center">
                {success === 1 &&
                    <form onSubmit={handleSubscription} className="w-[450px] bg-blue-600 px-3 py-4">
                        <input
                            type="text"
                            className="w-full py-2 px-3 rounded mb-2 text-stone-800 font-medium"
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            className="w-full py-2 px-3 rounded mb-2 text-stone-800 font-medium"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full py-2 px-3 rounded mb-2 text-stone-800 font-medium"
                            placeholder="Amount"
                            value={amount}
                            onChange={e => setamount(e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full py-2 px-3 rounded mb-2 text-stone-800 font-medium"
                            placeholder="Phone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <button className="bg-purple-600 py-2 px-3 rounded cursor-pointer">Paystack Button</button>
                    </form>
                }
                {success === 2 &&
                    <div>
                        <h1 className="text-2xl text-green-900 font-bold text-center">Congratulations!</h1>
                        <p className="text-base text-green-700 fonst-semibold text-center">Your payment was received successfully!</p>
                    </div>
                }
            </div>
        </div>
    )
}

export default Home