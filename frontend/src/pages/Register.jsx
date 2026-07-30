import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ChatFlow and start connecting with people."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
