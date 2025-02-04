import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";


const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { backendUrl, setIsLoggedIn, getUserData} = useAppContext()

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    axios.defaults.withCredentials = true

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          password,
          email,
        });

        if (data.success) {
            getUserData()
          setIsLoggedIn(true)

          navigate("/")
          setState("Login");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          password,
          email,
        });
      
        if (data.success) {
            getUserData()
          const nextUrl = searchParams.get("next");
          if (!!nextUrl) {
            navigate(`${nextUrl}`);
            return;
          }
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


  return (
    <form onSubmit={onSubmitHandler} className="min-h-screen flex items-center bg-gradient-to-br from-blue-200 to-purple-400 text-white">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border bg-stone-800 rounded-xl text-sm shadow-lg">
        <p className=" w-full text-2xl font-semibold text-center">
          {state === "Sign Up" ? "Create account" : "Login"}
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className=" border border-zinc-300 text-stone-800 rounded w-full p-2 mt-1"
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className=" border border-zinc-300 text-stone-800  rounded w-full p-2 mt-1"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className=" border border-zinc-300 text-stone-800  rounded w-full p-2 mt-1"
            type="password"
            id="password"
            onChange={(e) => setPwd(e.target.value)}
            value={password}
            required
          />
        </div>
        <p onClick={() => navigate("/reset-password")} className="mb-4 text-indigo-500 cursor-pointer">Forgot password?</p>
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-indigo-900 text-white w-full py-2 rounded-md text-base"
        >
          {state}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-indigo-700 underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-indigo-700 underline cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
