import React from 'react';

export const Table = ({ children, ...props }) => {
  return (
    <table {...props} className="table-auto w-full text-sm text-left text-gray-600">
      {children}
    </table>
  );
};

export const TableHeader = ({ children }) => {
  return <thead className="bg-gray-100">{children}</thead>;
};

export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

export const TableCell = ({ children, className }) => {
  return <td className={`px-6 py-3 ${className}`}>{children}</td>;
};

export const TableHeadCell = ({ children, className }) => {
  return <th className={`px-6 py-3 ${className}`}>{children}</th>;
};
