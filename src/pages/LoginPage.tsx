import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { phoneSchema, type PhoneFormData } from "../schemas/phoneSchema";
import { useAuthStore } from "../stores/authStore";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import texts from "../config/texts.json";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: PhoneFormData) => {
    await login(data.phone);
    navigate("/booking");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-background)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-foreground)",
              marginBottom: "0.5rem",
            }}
          >
            {texts.login.titulo}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-muted-foreground)",
            }}
          >
            {texts.login.subtitulo}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          noValidate
        >
          <Input
            id="phone"
            type="tel"
            placeholder={texts.login.placeholder}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!isValid || isLoading}
            style={{ width: "100%" }}
          >
            {texts.login.botaoEntrar}
          </Button>
        </form>
      </div>
    </div>
  );
}
