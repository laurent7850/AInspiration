type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OpportunityStage = 'Qualification' | 'Proposition' | 'Négociation' | 'Gagné' | 'Perdu';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'waiting' | 'deferred';

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  website?: string;
  tva_number?: string; // Added TVA number field
  created_at?: string;
}

export interface Contact {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  company_id?: string;
  status?: string;
  lead_source?: string;
  notes?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  address_country?: string;
  
  // Joined fields
  company_name?: string;
}

export interface Product {
  id: string;
  created_at?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  is_active: boolean;
}

export interface Opportunity {
  id: string;
  name: string;
  company_id?: string;
  contact_id?: string;
  stage: OpportunityStage;
  estimated_value?: number;
  close_date?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  product_id?: string;
  
  // Joined fields
  company_name?: string;
  contact_name?: string;
  product_name?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  completed_at?: string;
  related_to_type?: 'opportunity' | 'contact' | 'company';
  related_to?: string;
  created_at?: string;
  updated_at?: string;
  
  // Joined fields
  related_to_name?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  related_to_type?: 'opportunity' | 'contact' | 'company' | 'task' | 'product';
  related_to?: string;
  created_at?: string;

  // Joined fields
  related_to_name?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at?: string;
}

export interface AccessLog {
  id: string;
  user_id?: string;
  user_agent: string;
  page_url: string;
  status?: string;
  event_type: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'>;
        Update: Partial<Omit<Company, 'id'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'company_name'>;
        Update: Partial<Omit<Contact, 'id' | 'company_name'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id'>>;
      };
      opportunities: {
        Row: Omit<Opportunity, 'company_name' | 'contact_name' | 'product_name'>;
        Insert: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'company_name' | 'contact_name' | 'product_name'>;
        Update: Partial<Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'company_name' | 'contact_name' | 'product_name'>>;
      };
      tasks: {
        Row: Omit<Task, 'related_to_name'>;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'related_to_name'>>;
      };
      activities: {
        Row: Omit<Activity, 'related_to_name'>;
        Insert: Omit<Activity, 'id' | 'created_at' | 'related_to_name'>;
        Update: Partial<Omit<Activity, 'id' | 'created_at' | 'related_to_name'>>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'created_at'>;
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at' | 'status'>;
        Update: Partial<Omit<ContactMessage, 'id'>>;
      };
      access_logs: {
        Row: AccessLog;
        Insert: Omit<AccessLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AccessLog, 'id'>>;
      };
    };
  };
}