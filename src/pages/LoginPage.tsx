import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Navigate } from "react-router-dom";
import { phoneSchema, type PhoneFormData } from "../schemas/phoneSchema";
import { useAuthStore } from "../stores/authStore";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import texts from "../config/texts.json";

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/booking" replace />;
  }

  const {
    register, handleSubmit, setValue,
    formState: { errors, isValid },
  } = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema), mode: "onChange" });

  const { onChange, ...phoneRegister } = register("phone");
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("phone", applyPhoneMask(e.target.value), { shouldValidate: true });
  };

  const onSubmit = async (data: PhoneFormData) => {
    await login(data.phone);
    navigate("/booking");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">{texts.login.titulo}</h1>
          <p className="text-sm text-muted-foreground">{texts.login.subtitulo}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input id="phone" type="tel" placeholder={texts.login.placeholder} error={errors.phone?.message} onChange={handlePhoneChange} {...phoneRegister} />
          <Button type="submit" variant="primary" loading={isLoading} disabled={!isValid || isLoading} className="w-full">
            {texts.login.botaoEntrar}
          </Button>
        </form>
      </div>
    </div>
  );
}
