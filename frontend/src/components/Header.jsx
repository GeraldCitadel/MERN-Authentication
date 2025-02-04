import { useAppContext } from "../context/AppContext"


const Header = () => {
const { isLoggedIn, userData } = useAppContext()

  return (
    <div className='flex flex-col items-center justify-center pt-32'>
        <h1 className='font-semibold text-2xl text-stone-900 mb-3'>Hey {isLoggedIn ? userData?.name : "WebDev"}!</h1>
        <h2 className='font-medium text-stone-700'>Welcome to our app</h2>
        <p>Let's start with a quick product tour and we will have you up and running in no time</p>
        <button className="border border-gray-500 rounded-full px-6 py-2 mt-5 text-gray-800 hover:bg-gray-100 transition-all">Get Started</button>
    </div>
  )
}

export default Header