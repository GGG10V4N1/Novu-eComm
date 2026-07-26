import { FaShippingFast, FaShieldAlt, FaHeadset, FaAward } from "react-icons/fa";

const values = [
    {
        icon: FaShippingFast,
        title: "Free & Fast Shipping",
        text: "Reliable delivery to your door, every time.",
    },
    {
        icon: FaShieldAlt,
        title: "Secure Payments",
        text: "Your data and transactions are always protected.",
    },
    {
        icon: FaHeadset,
        title: "24/7 Support",
        text: "A team ready to help you whenever you need it.",
    },
    {
        icon: FaAward,
        title: "Quality Guaranteed",
        text: "Handpicked products that pass our quality standards.",
    },
];

const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "500+", label: "Products" },
    { value: "15+", label: "Years of Trust" },
];

const About = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <section className="relative overflow-hidden rounded-3xl bg-[image:var(--background-image-custom-gradient2)] border border-slate-200 px-6 py-16 sm:px-12 sm:py-20">
                <div className="relative max-w-3xl mx-auto text-center">
                    <span className="inline-block px-4 py-1 rounded-full bg-white shadow-sm text-sm font-medium tracking-wide text-slate-700 mb-6 border border-slate-200">
                        About Novu
                    </span>
                    <h1 className="text-slate-800 text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        We build the future of online shopping
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        At Novu we are dedicated to offering the best products and services.
                        Our mission is to deliver a seamless shopping experience while keeping
                        the highest quality standards on every item we curate.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-3xl sm:text-4xl font-extrabold bg-[image:var(--background-image-button-gradient)] bg-clip-text text-transparent">
                                    {s.value}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-slate-800 text-3xl sm:text-4xl font-bold mb-3">
                        Why choose Novu
                    </h2>
                    <p className="text-slate-600">
                        We combine technology, design and human care to deliver an experience you can trust.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map(({ icon: Icon, title, text }) => (
                        <div key={title}
                            className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[image:var(--background-image-button-gradient)] flex items-center justify-center text-white mb-4 shadow-md">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-800 text-lg font-semibold mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default About;
