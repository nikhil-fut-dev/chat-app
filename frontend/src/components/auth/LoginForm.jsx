import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { loginUser } from "../../api/authApi";
import { setCredentials } from "../../store/slices/authSlice";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
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

    if (!formData.email.trim() || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = response?.data?.user;

      if (!user) {
        throw new Error("User data was not returned by the server.");
      }

      dispatch(setCredentials(user));

      toast.success("Welcome back!");

      const destination = location.state?.from?.pathname || "/chat";

      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-[50px] w-full rounded-xl border border-[#e2e9e5] bg-white pl-11 pr-4 text-sm text-[#17211f] outline-none transition placeholder:text-[#a0aca6] hover:border-[#cbd8d1] focus:border-[#12866a] focus:ring-4 focus:ring-emerald-700/[0.08]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="block text-[13px] font-semibold text-[#35473f]"
          >
            Password
          </label>

          <span className="text-xs text-[#84938c]">Keep it secure</span>
        </div>

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
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
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
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#12866a] px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-[#0e7058] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in to your account
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      {/* Register link */}
      <p className="pt-3 text-center text-sm text-[#73817c]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#12866a] underline-offset-4 transition hover:text-[#0e7058] hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
