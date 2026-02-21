import React from 'react';
import Container from './ui/Container';
import Section from './ui/Section';
import GlassCard from './ui/GlassCard';

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  company: string;
  image?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, title, company, image }) => {
  return (
    <GlassCard className="flex flex-col h-full group border-indigo-500/5 hover:border-indigo-500/20">
      <div className="mb-8">
        <svg className="w-8 h-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" fill="currentColor" viewBox="0 0 32 32">
          <path d="M10 8v8h6v-8h-6zm12 0v8h6v-8h-6zM8 6h10v12h-8v-12zm12 0h10v12h-8v-12zm-12 14h6v2h-6v-2zm12 0h6v2h-6v-2z" />
          <path d="M10 10v6h6v-6h-6zm12 0v6h6v-6h-6z" />
        </svg>
      </div>

      <p className="text-gray-300 text-lg leading-relaxed mb-8 flex-grow">
        "{quote}"
      </p>

      <div className="flex items-center gap-4 pt-6 border-t border-white/5">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <div className="text-white font-bold uppercase tracking-tight text-sm">{name}</div>
          <div className="text-gray-500 text-xs uppercase tracking-widest">{title} @ {company}</div>
        </div>
      </div>
    </GlassCard>
  );
};

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "RAPP has completely transformed how we manage our procurement. The blockchain verification gives us confidence in every transaction.",
      name: "Sarah Johnson",
      title: "CPO",
      company: "TechGlobal Inc."
    },
    {
      quote: "As a vendor, I appreciate the transparency and fairness of the bidding process. We've increased our contract win rate by 40% since joining.",
      name: "Michael Chen",
      title: "CEO",
      company: "SupplyChain Partners"
    },
    {
      quote: "The reduction in paperwork and manual processes has saved us hundreds of hours per quarter. Our procurement team can now focus on strategic initiatives.",
      name: "Aisha Patel",
      title: "Operations Director",
      company: "Nexus Manufacturing"
    }
  ];

  return (
    <Section id="testimonials">
      <Container>
        <div className="text-center mb-20">
          <h2 className="text-indigo-400 font-semibold uppercase tracking-widest text-sm mb-4">Proof of Work</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Trusted by market leaders</h3>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Join thousands of organizations securing their supply chain with the Rapp protocol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default TestimonialsSection;
