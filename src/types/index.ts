export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  priceValue: number;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  type: string;
  tags?: string[];
  url?: string;
}

export interface ApiProperty {
  property_id: string;
  title: string;
  location: string;
  // Backend canonical fields
  price_usd?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  image_url?: string;
  // Legacy / optional extras
  description?: string;
  type?: string;
  tags?: string[];
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  showProperties?: boolean;
  showComparison?: boolean;
  showAnalysis?: boolean;
  analysisData?: AnalysisResult;
  propertyIds?: string[];
  apiProperties?: ApiProperty[];
  isError?: boolean;
}

export interface AnalysisResult {
  propertyTitle: string;
  price: number;
  monthlyEMI: number;
  totalRental: number;
  valueAfter5Yr: number;
  roi: number;
  downPayment: number;
  loanAmount: number;
}

export interface FilterState {
  budgetMin: string;
  budgetMax: string;
  location: string;
  propertyType: string;
  bedrooms: string;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
};

// ─── Admin Panel ───────────────────────────────────────────────────

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Lost';
export type LeadType = 'Cold' | 'Warm' | 'Hot';

export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  preferred_time: string;
  preferred_properties: string;
  lead_type: LeadType;
  status: LeadStatus;
  timestamp: string;
}
