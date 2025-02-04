import { useEffect, useRef, useState } from "react";
import { axiosPrivate } from "../config/axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";


const EmailVerify = () => {
    const inputRefs = useRef([]);
    const { getUserData, isLoggedIn, userData } = useAppContext()
    const navigate = useNavigate()
    const [isLoading, setIsLoadding] = useState(false)

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


    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoadding(true)

        try {
            const otpArray = inputRefs.current.map(e => e.value)
            const otp = otpArray.join('')

            const { data } = await axiosPrivate.post('/api/auth/verify-account', { otp })
            console.log(data)
            if (data.success) {
                toast.success(data.message)
                getUserData()
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setIsLoadding(false)
    }

useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified &&  navigate('/')
}, [isLoggedIn, userData])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-400 text-white">
            <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                <h1 className="text-2xl font-semibold text-center mb-4">
                    Verify OTP
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
                <button className="w-full py-3  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-stone-700 disabled:to-stone-800  disabled:hover:bg-stone-600" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>
        </div>
    );
};

export default EmailVerify;
