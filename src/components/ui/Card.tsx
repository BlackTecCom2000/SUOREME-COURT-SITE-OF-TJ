import React from 'react';
import { AdminCard } from '../../admin/components/ui/AdminCard';

// Single card implementation — the portal Card is AdminCard with the same
// prop API (title / subtitle / headerAction / hoverEffect / className).
// Rendering a <section> keeps the public landmark semantics.
interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = (props) => (
  <AdminCard {...props} as="section" />
);
