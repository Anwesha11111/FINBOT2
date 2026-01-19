
import React from 'react';
import { 
  FileText, 
  Landmark, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Calculator,
  ExternalLink 
} from 'lucide-react';

export const SUGGESTED_TOPICS = [
  { id: 'tax', label: 'ITR Filing Guide', icon: <FileText size={18} /> },
  { id: 'budget', label: '50/30/20 Budgeting', icon: <PieChart size={18} /> },
  { id: 'invest', label: 'SIP & Index Funds', icon: <TrendingUp size={18} /> },
  { id: 'banking', label: 'Opening a Bank Account', icon: <Landmark size={18} /> },
  { id: 'insurance', label: 'Insurance Basics', icon: <ShieldCheck size={18} /> },
  { id: 'kyc', label: 'KYC & Documents', icon: <Calculator size={18} /> },
];

export const INITIAL_GREETING = "Hello! I'm FinBot, your personal financial literacy assistant. I can help you understand budgeting, taxes, investments, and more. How can I help you today?";

export const QUICK_START_QUERIES = [
  "How to start investing in India?",
  "What is a good credit score?",
  "Explain the 50/30/20 rule.",
  "How to file ITR online?",
  "What are the benefits of a Public Provident Fund (PPF)?"
];

export const OFFICIAL_PORTALS = [
  { name: 'Income Tax Department', url: 'https://www.incometax.gov.in' },
  { name: 'RBI', url: 'https://www.rbi.org.in' },
  { name: 'SEBI', url: 'https://www.sebi.gov.in' },
  { name: 'UIDAI', url: 'https://uidai.gov.in' }
];
