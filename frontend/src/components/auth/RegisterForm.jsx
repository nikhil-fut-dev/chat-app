import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { registerUser } from "../../api/authApi";
import { setCredentials } from "../../store/slices/authSlice";

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = formData.fullName.trim();
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!fullName || !username || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        fullName,
        username,
        email,
        password,
      });

      const user = response?.data?.user;

      if (user) {
        dispatch(setCredentials(user));

        toast.success("Account created successfully!");

        navigate("/chat", { replace: true });
      } else {
        toast.success(response?.message || "Account created successfully!");

        navigate("/login", { replace: true });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create your account.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-[46px] w-full rounded-xl border border-[#e2e9e5] bg-white pl-11 pr-4 text-sm text-[#17211f] outline-none transition placeholder:text-[#a0aca6] hover:border-[#cbd8d1] focus:border-[#12866a] focus:ring-4 focus:ring-emerald-700/[0.08]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full name */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-[13px] font-semibold text-[#35473f]"
        >
          Full name
        </label>

        <div className="relative">
          <UserRound
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9b93]"
          />

          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-[13px] font-semibold text-[#35473f]"
        >
          Username
        </label>

        <div className="relative">
          <User
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9b93]"
          />

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[13px] font-semibold text-[#35473f]"
        >
          Email address
        </label>

        <div className="relative">
          <Mail
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9b93]"
          />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[13px] font-semibold text-[#35473f]"
        >
          Password
        </label>

        <div className="relative">
          <Lock
            size={18}
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9b93]"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            className={`${inputClass} pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#84938c] transition hover:bg-[#f0f5f2] hover:text-[#12866a]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p className="mt-1.5 text-xs text-[#84938c]">
          Choose a password you don't use elsewhere.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group mt-2 flex h-[49px] w-full items-center justify-center gap-2 rounded-xl bg-[#12866a] px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-[#0e7058] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create your account
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      {/* Login link */}
      <p className="pt-2 text-center text-sm text-[#73817c]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#12866a] underline-offset-4 transition hover:text-[#0e7058] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
