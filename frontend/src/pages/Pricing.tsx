import { Link } from 'react-router-dom';
import BasePage from '../components/BasePage';

const Pricing: React.FC = () => {
  return (
    <BasePage
      title="Pricing"
      subtitle="Choose the plan that fits your organization's procurement needs"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Starter Plan */}
        <div className="glass-premium rounded-3xl p-10 hover-lift transition-all duration-500">
          <div className="text-center mb-10">
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Starter</h3>
            <div className="text-6xl font-black text-white mb-4 tracking-tighter">
              $99<span className="text-xl font-medium text-gray-500 tracking-normal ml-2">/mo</span>
            </div>
            <p className="text-gray-400 font-medium">Perfect for emerging small businesses</p>
          </div>

          <ul className="space-y-5 mb-10">
            {[
              "Up to 10 verified vendors",
              "50 active listings / month",
              "Standard dashboard analytics",
              "Business hours email support"
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-gray-300 font-medium text-sm">
                <svg className="h-5 w-5 text-indigo-500 mr-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link to="/onboarding">
            <button className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
              Initalize Plan
            </button>
          </Link>
        </div>

        {/* Professional Plan */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative glass-premium bg-[#05070a]/80 rounded-3xl p-10 hover-lift transition-all duration-500 border-indigo-500/30">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-10">
              <h3 className="text-xl font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Professional</h3>
              <div className="text-6xl font-black text-white mb-4 tracking-tighter">
                $299<span className="text-xl font-medium text-gray-500 tracking-normal ml-2">/mo</span>
              </div>
              <p className="text-gray-400 font-medium">Ideal for rapidly growing companies</p>
            </div>

            <ul className="space-y-5 mb-10">
              {[
                "Up to 100 verified vendors",
                "Unlimited procurement listings",
                "Advanced predictive analytics",
                "24/7 priority response",
                "Developer API access"
              ].map((feature, i) => (
                <li key={i} className="flex items-center text-gray-200 font-medium text-sm">
                  <svg className="h-5 w-5 text-indigo-400 mr-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link to="/onboarding">
              <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                Get Started Now
              </button>
            </Link>
          </div>
        </div>

        {/* Company Plan */}
        <div className="glass-premium rounded-3xl p-10 hover-lift transition-all duration-500">
          <div className="text-center mb-10">
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Company</h3>
            <div className="text-6xl font-black text-white mb-4 tracking-tighter">
              Custom
            </div>
            <p className="text-gray-400 font-medium">For large-scale global organizations</p>
          </div>

          <ul className="space-y-5 mb-10">
            {[
              "Unlimited vendor ecosystem",
              "Unlimited listing volume",
              "Custom ERP integrations",
              "Dedicated account strategic manager",
              "On-premise node options"
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-gray-300 font-medium text-sm">
                <svg className="h-5 w-5 text-indigo-500 mr-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link to="/onboarding">
            <button className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
              Connect with Sales
            </button>
          </Link>
        </div>
      </div>
    </BasePage>
  );
};

export default Pricing;
