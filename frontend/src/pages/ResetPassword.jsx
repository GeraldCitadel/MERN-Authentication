import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "../config/axios"
import { toast } from "react-toastify"


const ResetPassword = () => {
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [ otp, setOtp ] = useState('')
    const [isLoading, setIsLoadding] = useState(false)
    const [ currentForm, setCurrentForm ] =useState(1)
    
    const inputRefs = useRef([]);
    const navigate = useNavigate()
  

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeydown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === "" && index > 0)
            inputRefs.current[index - 1].focus();
    };

    const handlePaste = e => {
        const paste = e.clipboardData.getData("text");
        const pasteArray = paste.split("");
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    };


    const handleSubmitEmail = async (e) => {
        e.preventDefault()
        setIsLoadding(true)

        try {
            const { data } = await axios.post('/api/auth/send-reset-otp', { email })
           
            if (data.success) {
                toast.success(data.message)
                setCurrentForm(2)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setIsLoadding(false)
    }
    const handleSubmitOtp = async (e) => {
        e.preventDefault()
        setIsLoadding(true)
        
            const otpArray = inputRefs.current.map(e => e.value)
            const otp = otpArray.join('')
            setOtp(otp)
            setCurrentForm(3)

        setIsLoadding(false)
    }
    const handleSubmitNewPassword = async (e) => {
        e.preventDefault()
        setIsLoadding(true)

        try {
            const { data } = await axios.post('/api/auth/reset-password', { email, newPassword, otp })
           
            if (data.success) {
                toast.success(data.message)
                navigate('/login')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setIsLoadding(false)
    }


    const handlePrevPage = () => {
        setCurrentForm(currentForm - 1)
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400 text-white">

            {/* Email input form */}
            { currentForm === 1 &&  
            <form onSubmit={handleSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    Reset Password
                </h1>
                <p className="text-center mb-6 text-indigo-300">
                    Enter your registered email address.
                </p>
                <div className="flex justify-between mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
                    <input
                        type="email"
                        placeholder="Email"
                        className="bg-transparent outline-none text-white"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <button className="w-full py-3  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-stone-700 disabled:to-stone-800  disabled:hover:bg-stone-600" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
}


            {/* OTP input form */}
            { currentForm === 2 &&  
            <form onSubmit={handleSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    Reset Passeord OTP
                </h1>
                <p className="text-center mb-6 text-indigo-300">
                    Enter the 6-digit code sent to your email.
                </p>
                <div
                    className="flex justify-between mb-8"
                    onPaste={handlePaste}
                >
                    {Array(6)
                        .fill(0)
                        .map((_, index) => (
                            <input
                                ref={e => (inputRefs.current[index] = e)}
                                onInput={e => handleInput(e, index)}
                                onKeyDown={e => handleKeydown(e, index)}
                                type="text"
                                maxLength={1}
                                key={index}
                                required
                                className="w-12 h-12 bg-[#333A5C] text-white text-center  text-xl rounded-md"
                            />
                        ))}
                </div>
                <button className="w-full py-2.5  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-stone-700 disabled:to-stone-800  disabled:hover:bg-stone-600" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Reset Password'}
                </button>
                <button onClick={handlePrevPage} className="border-none outline-none text-xs text-indigo-300 font-medium mt-5 mb-1">Back</button>
            </form>
}

             {/* New password input form */}
             { currentForm === 3 &&  
             <form onSubmit={handleSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    New Password
                </h1>
                <p className="text-center mb-6 text-indigo-300">
                    Enter the new password.
                </p>
                <div className="flex justify-between mb-4 w-full gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]">
                    <input
                        type="password"
                        placeholder="New password"
                        className="bg-transparent outline-none text-white"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                </div>
                <button className="w-full py-3  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-stone-700 disabled:to-stone-800  disabled:hover:bg-stone-600" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
                <button onClick={handlePrevPage} className="border-none outline-none text-xs text-indigo-300 font-medium mt-5 mb-1">Back</button>
            </form>
}
        </div>
    )
}

export default ResetPassword