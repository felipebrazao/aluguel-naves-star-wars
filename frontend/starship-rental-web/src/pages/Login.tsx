import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PilledButton from '../components/shared/PilledButton'

function Login() {
    const navigate = useNavigate()
    const [isLogin, setIsLogin] = useState(true)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        navigate('/')
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-space-black px-4 py-12">
            <section className="w-full max-w-md rounded-3xl border border-panel-border bg-panel-dark p-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-rebel-blue">Autenticação</p>
                    <h1 className="mt-3 text-3xl font-semibold text-sw-yellow">Star Rental Access</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-300">
                        Entre na estação ou crie uma nova conta para iniciar a sua jornada galáctica.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-panel-border bg-black/30 p-2">
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${isLogin
                                ? 'border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Entrar
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${!isLogin
                                ? 'border-sw-yellow bg-sw-yellow/10 text-sw-yellow shadow-[0_0_18px_rgba(255,232,31,0.12)]'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Criar Conta
                    </button>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {!isLogin ? (
                        <div className="form-control">
                            <label htmlFor="name" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Nome</span>
                            </label>
                            <input id="name" type="text" className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500" placeholder="Luke Skywalker" />
                        </div>
                    ) : null}

                    {!isLogin ? (
                        <div className="form-control">
                            <label htmlFor="cpf" className="label">
                                <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">CPF</span>
                            </label>
                            <input id="cpf" type="text" className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500" placeholder="000.000.000-00" />
                        </div>
                    ) : null}

                    <div className="form-control">
                        <label htmlFor="email" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">E-mail</span>
                        </label>
                        <input id="email" type="email" className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500" placeholder="pilot@starrental.com" />
                    </div>

                    <div className="form-control">
                        <label htmlFor="password" className="label">
                            <span className="label-text text-xs uppercase tracking-[0.25em] text-rebel-blue">Senha</span>
                        </label>
                        <input id="password" type="password" className="input input-bordered w-full bg-black/30 text-gray-100 placeholder:text-gray-500" placeholder="••••••••" />
                    </div>

                    <PilledButton variant="primary" className="w-full">
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                    </PilledButton>
                </form>
            </section>
        </main>
    )
}

export default Login