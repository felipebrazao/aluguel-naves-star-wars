function SpaceshipDetails() {
    return (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-panel-border bg-panel-dark p-8">
                <p className="text-xs uppercase tracking-[0.35em] text-rebel-blue">Detalhes da Nave</p>
                <h2 className="mt-2 text-3xl font-semibold text-sw-yellow">Millennium Falcon</h2>
                <p className="mt-4 text-sm text-gray-400">Boilerplate para UC05 e UC06.</p>
            </div>

            <div className="rounded-3xl border border-panel-border bg-panel-dark p-8">
                <h3 className="text-xl font-semibold text-sw-yellow">Checkout</h3>
                <p className="mt-3 text-sm text-gray-400">Seleção de datas e locais de retirada/devolução.</p>
            </div>
        </section>
    )
}

export default SpaceshipDetails