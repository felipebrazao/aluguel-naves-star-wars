import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PilledButton from "../components/shared/PilledButton";
import AnimatedCard from "../components/ui/AnimatedCard";
import { apiFetch } from "../services/api";
import type { LoginResponse } from "../types/entities";

function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function validateAuthInput(params: {
  email: string;
  password: string;
  isRegisterMode: boolean;
  name: string;
  cpf: string;
}): string | null {
  const { email, password, isRegisterMode, name, cpf } = params;

  if (!email.trim()) {
    return "E-mail é obrigatório";
  }

  if (!isValidEmail(email)) {
    return "E-mail inválido";
  }

  if (!password.trim()) {
    return "Senha é obrigatória";
  }

  if (isRegisterMode && !name.trim()) {
    return "Nome é obrigatório";
  }

  if (isRegisterMode && !cpf.trim()) {
    return "CPF é obrigatório";
  }

  return null;
}

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const isRegister = isLogin === false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const maxLength = 11;
    const truncated = numbers.slice(0, maxLength);

    let formatted = "";
    for (let i = 0; i < truncated.length; i++) {
      if (i === 3 || i === 6) {
        formatted += ".";
      } else if (i === 9) {
        formatted += "-";
      }
      formatted += truncated[i];
    }

    return formatted;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const extractErrorMessage = async (response: Response) => {
    const rawBody = await response.text();

    if (!rawBody) {
      return response.statusText || "Erro ao processar a solicitação";
    }

    try {
      const parsed = JSON.parse(rawBody);

      if (typeof parsed === "string") {
        return parsed;
      }

      if (parsed.message) {
        return parsed.message;
      }

      if (parsed.detail) {
        return parsed.detail;
      }

      if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
        const firstError = parsed.errors[0];

        if (typeof firstError === "string") {
          return firstError;
        }

        return (
          firstError.defaultMessage ||
          firstError.message ||
          firstError.detail ||
          firstError.field ||
          response.statusText ||
          "Erro de validação"
        );
      }

      if (Array.isArray(parsed.fieldErrors) && parsed.fieldErrors.length > 0) {
        const firstFieldError = parsed.fieldErrors[0];
        return (
          firstFieldError.defaultMessage ||
          firstFieldError.message ||
          firstFieldError.field ||
          response.statusText ||
          "Erro de validação"
        );
      }

      return (
        parsed.title || parsed.error || response.statusText || "Erro inesperado"
      );
    } catch {
      return rawBody;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      globalThis.location.replace("/");
    }
  }, [navigate]);

  const authenticate = async (email: string, password: string) => {
    const loginResponse = await apiFetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }, { auth: false });

    if (loginResponse.status !== 200) {
      throw new Error("Falha ao autenticar após o cadastro");
    }

    const loginData: LoginResponse = await loginResponse.json();
    localStorage.setItem("token", loginData.token);
    localStorage.setItem("user", JSON.stringify(loginData.user));
    navigate("/", { replace: true });
  };

  const register = async (params: { name: string; email: string; cpf: string; password: string }) => {
    const registerResponse = await apiFetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        cpf: params.cpf.replace(/\D/g, ""),
        password: params.password,
        roleId: 2,
      }),
    }, { auth: false });

    if (!registerResponse.ok) {
      throw new Error(await extractErrorMessage(registerResponse));
    }

    await registerResponse.json();
  };

  const handleLoginOnly = async (email: string, password: string) => {
    const res = await apiFetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }, { auth: false });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }

    const data: LoginResponse = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    globalThis.location.replace("/");
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateAuthInput({
      email,
      password,
      isRegisterMode: isRegister,
      name,
      cpf,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (isRegister) {
        await register({ name, email, cpf, password });
        await authenticate(email, password);
        return;
      }

      await handleLoginOnly(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-space-black px-4 py-12"
    >
      <AnimatedCard className="w-full max-w-md p-8" hover={false}>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-rebel-blue">
            Autenticação
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-sw-yellow">
            Star Rental Access
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Entre na estação ou crie uma nova conta para iniciar a sua jornada
            galáctica.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-panel-border bg-black/30 p-2">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${isLogin
              ? "border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]"
              : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${isRegister
              ? "border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]"
              : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
          >
            Criar Conta
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {isRegister ? (
            <div className="form-control">
              <label htmlFor="name" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">
                  Nome
                </span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                placeholder="Luke Skywalker"
              />
            </div>
          ) : null}

          {isRegister ? (
            <div className="form-control">
              <label htmlFor="cpf" className="label">
                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">
                  CPF
                </span>
              </label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={handleCpfChange}
                className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          ) : null}

          <div className="form-control">
            <label htmlFor="email" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">
                E-mail
              </span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
              placeholder="pilot@starrental.com"
            />
          </div>

          <div className="form-control">
            <label htmlFor="password" className="label">
              <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">
                Senha
              </span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <PilledButton type="submit" variant="primary" className="w-full">
            {isLogin ? "Entrar" : "Criar Conta"}
          </PilledButton>
        </form>
      </AnimatedCard>
    </motion.main>
  );
}

export default Login;
