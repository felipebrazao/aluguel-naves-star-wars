import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PilledButton from "../components/shared/PilledButton";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/api";

type ErrorPayload = {
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  error?: unknown;
  errors?: unknown;
  fieldErrors?: unknown;
};

const getMessageFromValidationError = (item: unknown): string | null => {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;

  if (typeof record.defaultMessage === "string") {
    return record.defaultMessage;
  }

  if (typeof record.message === "string") {
    return record.message;
  }

  if (typeof record.detail === "string") {
    return record.detail;
  }

  if (typeof record.field === "string") {
    return record.field;
  }

  return null;
};

const extractErrorMessage = (error: unknown): string => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("response" in error) ||
    typeof error.response !== "object" ||
    error.response === null
  ) {
    return error instanceof Error ? error.message : "Erro de conexão";
  }

  const response = error.response as {
    data?: unknown;
    statusText?: string;
  };

  if (typeof response.data === "string") {
    return response.data;
  }

  if (!response.data || typeof response.data !== "object") {
    return response.statusText || "Erro ao processar a solicitação";
  }

  const parsed = response.data as ErrorPayload;

  if (typeof parsed.message === "string") {
    return parsed.message;
  }

  if (typeof parsed.detail === "string") {
    return parsed.detail;
  }

  if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
    return (
      getMessageFromValidationError(parsed.errors[0]) ||
      response.statusText ||
      "Erro de validação"
    );
  }

  if (Array.isArray(parsed.fieldErrors) && parsed.fieldErrors.length > 0) {
    return (
      getMessageFromValidationError(parsed.fieldErrors[0]) ||
      response.statusText ||
      "Erro de validação"
    );
  }

  if (typeof parsed.title === "string") {
    return parsed.title;
  }

  if (typeof parsed.error === "string") {
    return parsed.error;
  }

  return response.statusText || "Erro inesperado";
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      globalThis.location.replace("/");
    }
  }, [navigate]);

  const handleSubmit: React.ComponentProps<"form">["onSubmit"] = async (
    event,
  ) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("E-mail é obrigatório");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("E-mail inválido");
      return;
    }

    if (!password.trim()) {
      setError("Senha é obrigatória");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Nome é obrigatório");
        return;
      }

      if (!cpf.trim()) {
        setError("CPF é obrigatório");
        return;
      }
    }

    const authenticate = async () => {
      const loginData = await userService.login({ email, password });
      login(loginData.user, loginData.token);
      navigate("/", { replace: true });
    };

    try {
      if (!isLogin) {
        await userService.create({
          name,
          email,
          cpf,
          password,
          roleId: 2,
        });
        await authenticate();
        return;
      }

      const data = await userService.login({ email, password });
      login(data.user, data.token);
      globalThis.location.replace("/");
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-space-black px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
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
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isLogin
                ? "border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              !isLogin
                ? "border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {!isLogin ? (
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

          {!isLogin ? (
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
                onChange={(e) => setCpf(e.target.value)}
                className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500"
                placeholder="000.000.000-00"
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
      </section>
    </main>
  );
}

export default Login;
