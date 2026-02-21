import React from 'react';

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  company: string;
  image?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, title, company, image }) => {
  return (
    <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 
        flex items-center justify-center text-white font-bold text-lg mr-4">
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover rounded-full" />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <div className="text-white font-medium">{name}</div>
          <div className="text-blue-200 text-sm">{title}, {company}</div>
        </div>
      </div>
      <p className="text-blue-100 italic">&ldquo;{quote}&rdquo;</p>
    </div>
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
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">What Our Users Say</h2>
          <p className="mt-4 text-xl text-blue-200">Trusted by procurement professionals worldwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
