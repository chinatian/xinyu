import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© 2023 Xinyu. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;