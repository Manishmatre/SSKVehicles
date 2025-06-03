import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          {idx > 0 && <FiChevronRight className="mx-1 text-gray-400" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-blue-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
