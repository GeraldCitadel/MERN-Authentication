import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import { axiosPrivate } from "../config/axios"


const Navbar = () => {
    const { setIsLoggedIn, setUserData, userData } = useAppContext()
    const navigate = useNavigate()


    const logout = async () => {
        try {
            const { data } = await axiosPrivate.post('/api/auth/logout')

            if (data.success) {
                setIsLoggedIn(false)
                setUserData(false)
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    const sendVerificationOtp = async () => {
        try {

            const { data } = await axiosPrivate.post('/api/auth/send-verify-otp') 

            if (data.success) {
                navigate("/verify-email")
                toast.success(data.message)
            } else {
                toast.error(data.message)
                console.log(data)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <div className="w-full flex justify-between items-center p-2 sm:p-6 sm:px-24 absolute top-0 bg-[#faf9f6] border-b shadow-sm">
            <div className="flex flex-col">
            <h1 className="font-bold text-2xl tracking-wide">Citadel</h1>
            <p className="text-base font-semibold -mt-2 tracking-widest">Tech-Hub</p>
            </div>
            {userData ?
                <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
                    {userData.name[0].toUpperCase()}
                    <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
                        <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                            {!userData.isAccountVerified &&
                                <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">Verify Email</li>
                            }
                            <li onClick={logout} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">Logout</li>
                        </ul>
                    </div>
                </div>
                : <button onClick={() => navigate('/login')} className="border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all">Login</button>
            }
        </div>
    )
}

export default Navbar