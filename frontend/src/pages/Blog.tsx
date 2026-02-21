import React from 'react';
import BasePage from '../components/BasePage';

const Blog: React.FC = () => {
  return (
    <BasePage title="Blog" subtitle="Insights and updates from the procurement world">
      <div className="text-center">
        <p className="text-blue-200 text-lg">Coming soon - Industry insights and updates!</p>
      </div>
    </BasePage>
  );
};

export default Blog;
