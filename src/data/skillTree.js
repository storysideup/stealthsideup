// StealthSideUp — Complete Skill Tree
// Structure: Function → L1 Sub-function → L2 Specialisation → L3 Depth Indicators
// Proficiency: Familiar | Proficient | Expert (applies at L2 level)
// Free text: available at L3 level

export const PROFICIENCY_LEVELS = [
  { value: 'familiar', label: 'Familiar', desc: 'I have worked on this, understand it well' },
  { value: 'proficient', label: 'Proficient', desc: 'I have delivered this independently and can lead it' },
  { value: 'expert', label: 'Expert', desc: 'I have built, designed or owned this at an organisational level' },
]

export const SKILL_TREE = {
  "HR / People & Culture": {
    "Talent Acquisition": {
      specialisations: ["Campus Hiring", "Lateral / Mid-Senior Hiring", "Executive & Leadership Search", "Volume / Mass Hiring", "Tech Hiring", "Diversity Hiring", "Employer Branding", "RPO Management"],
      depth: {
        "Campus Hiring": ["IIMs / IITs / Premier B-schools", "Engineering Colleges", "Management Trainees / GETs", "Internship Programmes", "Pre-Placement Offers"],
        "Lateral / Mid-Senior Hiring": ["Boolean Search", "Headhunting / Direct Sourcing", "LinkedIn Recruiter", "Naukri / Job Boards", "ATS Management", "Offer Negotiation"],
        "Executive & Leadership Search": ["CXO Search", "Board Placements", "Retained Search", "Confidential Mandates", "Assessment & Fitment"],
        "Volume / Mass Hiring": ["Drive / Walk-in Coordination", "BPO / Call Centre Hiring", "Blue Collar Hiring", "Vendor Management", "SLA-based Delivery"],
        "Employer Branding": ["LinkedIn Strategy", "Glassdoor Management", "EVP Design", "Campus Brand Building", "Social Media for Hiring"],
        "Tech Hiring": ["Engineering Hiring", "Product Hiring", "Data Science Hiring", "Niche Tech Roles", "Startup Hiring"],
        "Diversity Hiring": ["Gender Diversity", "PwD Hiring", "Veteran Hiring", "D&I Sourcing Strategy"],
        "RPO Management": ["RPO Vendor Management", "Hybrid RPO", "Full RPO", "SLA Design"],
      }
    },
    "Compensation & Benefits": {
      specialisations: ["Salary Benchmarking", "Job Evaluation & Grading", "Variable Pay Design", "Sales Incentive Plans", "ESOPs & Long-term Incentives", "Benefits Administration", "Pay Equity & Compliance"],
      depth: {
        "Salary Benchmarking": ["Aon / Mercer / Willis Surveys", "Custom Benchmarking", "Pay Band Design", "Market Positioning Strategy"],
        "Sales Incentive Plans": ["Quota Setting", "Commission Structures", "Contest Design", "Channel Partner Incentives", "MIS & Payout Tracking"],
        "ESOPs & Long-term Incentives": ["ESOP Plan Design", "Vesting Schedules", "ESOP Communication", "RSU / SAR Structures"],
        "Variable Pay Design": ["KPI-linked Pay", "Balanced Scorecard", "Performance Rating Calibration", "Bell Curve Management"],
        "Job Evaluation & Grading": ["Hay / Mercer / Willis Grading", "Internal Grade Structure", "Role Mapping", "Career Levels Design"],
        "Benefits Administration": ["Health Insurance", "Gratuity / PF Management", "Flexi Benefits", "EAP Programmes"],
        "Pay Equity & Compliance": ["Gender Pay Gap Analysis", "Statutory Compliance", "Minimum Wage Management"],
      }
    },
    "HR Business Partner": {
      specialisations: ["Business Partnering — Sales / Commercial", "Business Partnering — Tech / Product", "Business Partnering — Corporate Functions", "Workforce Planning", "Talent Reviews & Succession", "Performance Management"],
      depth: {
        "Business Partnering — Sales / Commercial": ["Frontline HR", "Large Sales Teams (200+)", "Channel Partner HR", "Revenue-linked HR Metrics"],
        "Talent Reviews & Succession": ["9-box Grid", "Succession Pipeline", "Hi-Po Programmes", "Talent Calibration"],
        "Performance Management": ["Goal Setting / OKRs", "Mid-year Reviews", "Annual Appraisal Design", "PIP Management", "Rating Distribution"],
        "Workforce Planning": ["Headcount Planning", "Org Design", "Role Rationalisation", "FTE vs Contract Mix"],
      }
    },
    "Learning & Development": {
      specialisations: ["Leadership Development", "Behavioural / Soft Skills Training", "Sales Capability Building", "Onboarding Programme Design", "E-learning & LMS", "Coaching & Mentoring Programmes", "Assessment Centres"],
      depth: {
        "Assessment Centres": ["Competency-based Assessment", "In-basket Exercises", "Role Plays & Case Studies", "Hogan Assessments", "360 Degree Feedback", "Development Centre Design"],
        "Leadership Development": ["Leadership Pipeline Programmes", "Hi-Po Identification", "Executive Coaching", "Action Learning Projects"],
        "Sales Capability Building": ["Sales Process Training", "Product Knowledge", "Negotiation Skills", "KAM Training"],
        "E-learning & LMS": ["Articulate Storyline", "Lectora", "Moodle / Cornerstone / SAP LMS", "SCORM Content"],
        "Onboarding Programme Design": ["Day 1 Experience", "30-60-90 Day Plan", "Buddy Programmes", "Digital Onboarding"],
      }
    },
    "HR Operations": {
      specialisations: ["Payroll Management", "HRIS / HRMS Implementation", "HR Compliance & Labour Law", "HR Policy Design", "Onboarding & Offboarding", "HR Shared Services"],
      depth: {
        "Payroll Management": ["SAP Payroll", "ADP / Keka / Darwinbox", "TDS on Salary", "Full & Final Settlement", "Multi-state Payroll"],
        "HRIS / HRMS Implementation": ["Darwinbox", "SuccessFactors", "Workday", "Keka", "greytHR", "System Migration"],
        "HR Compliance & Labour Law": ["PF / ESI / PT", "Shops & Establishments", "Contract Labour Act", "Maternity Benefit Act", "Factory Act"],
      }
    },
    "Talent Management": {
      specialisations: ["Succession Planning", "Hi-Po Identification & Development", "Leadership Pipeline", "Career Frameworks & Pathing", "Performance Calibration", "Retention Strategy", "Talent Reviews"],
      depth: {
        "Succession Planning": ["9-box Grid", "Successor Identification", "Succession Gaps", "Board-level Succession", "Accelerated Development Plans"],
        "Hi-Po Identification & Development": ["Hi-Po Assessment Criteria", "Fast Track Programmes", "Stretch Assignments", "Executive Sponsorship", "Hi-Po Cohort Management"],
        "Leadership Pipeline": ["First-time Manager Programmes", "Senior Leader Development", "GM / P&L Leader Pipeline", "External Leadership Hiring Strategy"],
        "Career Frameworks & Pathing": ["Job Architecture", "Career Ladder Design", "IC vs Manager Tracks", "Career Conversation Frameworks"],
        "Retention Strategy": ["Stay Interview Process", "Flight Risk Identification", "Critical Talent Retention Plans", "Counter-offer Management"],
      }
    },
    "Organisational Development": {
      specialisations: ["Culture & Values", "Change Management", "Org Design & Restructuring", "Competency Frameworks", "Employee Engagement", "360 Feedback & Assessments"],
      depth: {
        "Change Management": ["Kotter Model", "ADKAR", "Stakeholder Management", "Communication Planning", "Change Readiness Assessment"],
        "Employee Engagement": ["Engagement Survey Design", "Pulse Surveys", "Action Planning", "Stay Interviews", "eNPS Tracking"],
        "Competency Frameworks": ["Behavioural Indicators", "Technical Competencies", "Leadership Competencies", "Framework Rollout"],
      }
    },
    "HR Analytics": {
      specialisations: ["HR MIS & Reporting", "Attrition Analytics", "Workforce Planning Models", "HR Dashboard & BI Tools", "People Analytics — Advanced"],
      depth: {
        "HR MIS & Reporting": ["Excel / Google Sheets", "Power BI", "Tableau", "HR Scorecard", "CEO / Board HR Reports"],
        "Attrition Analytics": ["Voluntary / Involuntary Split", "Cohort Analysis", "Predictive Attrition Models", "Exit Interview Analytics"],
        "People Analytics — Advanced": ["Python / R for HR", "Regression Models", "Network Analysis", "ML for HR"],
      }
    },
    "Employee Relations": {
      specialisations: ["Disciplinary & Grievance", "POSH / ICC", "Union Relations", "IR & Collective Bargaining", "Statutory Compliance"],
      depth: {
        "POSH / ICC": ["ICC Constitution", "Inquiry Process", "POSH Training", "Annual Report Filing"],
        "Union Relations": ["Charter of Demands", "Long-term Settlement", "Strike / Lockout Management", "Works Committee"],
        "Disciplinary & Grievance": ["Charge Sheet Drafting", "Enquiry Officer", "Domestic Enquiry", "Termination Process"],
      }
    },
    "Diversity & Inclusion": {
      specialisations: ["D&I Strategy", "Gender Diversity Programmes", "Accessibility & Disability Inclusion", "Unconscious Bias Training", "ERG Management"],
      depth: {
        "Gender Diversity Programmes": ["Women Leadership Programmes", "Returnship Programmes", "Maternity / Paternity Policy", "Pay Equity Audit"],
        "ERG Management": ["ERG Charter Design", "ERG Events", "ERG Metrics", "Senior Sponsorship"],
      }
    },
  },

  "Sales & Business Development": {
    "B2B Sales": {
      specialisations: ["Enterprise Sales", "SME / Mid-market Sales", "SaaS / Tech Sales", "Industrial / Manufacturing Sales", "Services Sales", "New Business Development"],
      depth: {
        "Enterprise Sales": ["C-suite Selling", "Long Sales Cycles", "Complex Deal Structuring", "Multi-stakeholder Management", "Revenue > ₹50Cr"],
        "SaaS / Tech Sales": ["SaaS Metrics (ARR / MRR)", "Product-led Growth", "Trial to Paid Conversion", "Customer Success Interface"],
        "New Business Development": ["Lead Generation", "Cold Outreach", "Proposal Writing", "Pipeline Management", "CRM — Salesforce / Zoho / HubSpot"],
        "SME / Mid-market Sales": ["SME Prospecting", "Short Sales Cycles", "Volume Deal Management", "Partner-led Sales"],
      }
    },
    "B2C Sales": {
      specialisations: ["Retail Sales", "Direct Sales / D2C", "E-commerce Sales", "Tele-sales / Inside Sales", "FMCG — GT / MT Sales"],
      depth: {
        "Retail Sales": ["Store Operations", "Category Performance", "Sell-through Management", "Visual Merchandising", "Staff Training"],
        "FMCG — GT / MT Sales": ["General Trade Coverage", "Modern Trade Accounts", "Beat Optimisation", "Secondary Sales Tracking", "Scheme Design"],
        "E-commerce Sales": ["Amazon / Flipkart / Meesho", "Quick Commerce", "D2C Website Sales", "Marketplace Ads", "Rating & Review Management"],
        "Inside Sales": ["Inbound Lead Conversion", "Outbound Calling", "Demo & Pitch", "CRM Management", "Revenue Quota Delivery"],
      }
    },
    "Channel & Distribution": {
      specialisations: ["Distributor Management", "Dealer Network Development", "Franchisee Management", "Modern Trade", "General Trade", "Super Stockist Management"],
      depth: {
        "General Trade": ["GT Coverage Planning", "Retailer Credit Management", "Scheme Design", "Secondary Sales Tracking", "Van Sales"],
        "Modern Trade": ["Category Management", "Planogram Compliance", "JBP — Joint Business Planning", "Shelf Share Negotiation", "Key Account — DMart / Reliance / Big Bazaar"],
        "Distributor Management": ["ROI Management", "Stock Norms", "Distributor Appointment", "Claims Processing", "Distributor Training"],
        "Franchisee Management": ["Franchise Recruitment", "SOP Compliance", "Territory Protection", "Franchise P&L Support"],
      }
    },
    "Key Account Management": {
      specialisations: ["National Account Management", "Strategic Account Planning", "Revenue Growth from Accounts", "Contract Negotiation", "Customer Retention"],
      depth: {
        "National Account Management": ["Pan-India Account Coverage", "Multi-location Coordination", "Central Buying Negotiation", "Annual Framework Agreements"],
        "Strategic Account Planning": ["Account Growth Plans", "White Space Identification", "Executive Relationship Management", "Multi-year Contracts"],
      }
    },
    "Sales Operations": {
      specialisations: ["CRM Management", "Sales Reporting & MIS", "Territory Planning", "Incentive Plan Administration", "Sales Forecasting"],
      depth: {
        "CRM Management": ["Salesforce", "Zoho CRM", "HubSpot", "Microsoft Dynamics", "Pipeline Hygiene", "CRM Rollout"],
        "Sales Reporting & MIS": ["Daily / Weekly Sales Reports", "Revenue Dashboards", "Funnel Analytics", "Quota vs Achievement Tracking"],
        "Sales Forecasting": ["Bottom-up Forecasting", "Top-down Planning", "Statistical Models", "S&OP Interface"],
      }
    },
    "International Sales": {
      specialisations: ["Export Management", "Global Account Management", "Cross-border GTM", "Distributor Appointment — International"],
      depth: {
        "Export Management": ["Export Documentation", "DGFT / EXIM Policy", "Letter of Credit", "Incoterms", "Export Incentives"],
        "Global Account Management": ["Multi-country Coverage", "Currency & Pricing Management", "Global Contract Negotiation", "Cross-cultural Selling"],
      }
    },
    "Institutional & Government Sales": {
      specialisations: ["Government / PSU Tendering", "DGFT / Export Promotion", "Institutional Channel", "Healthcare Institutional Sales"],
      depth: {
        "Government / PSU Tendering": ["GeM Portal", "Tender Documentation", "L1 Bidding Strategy", "Relationship Management — Government"],
        "Healthcare Institutional Sales": ["Hospital Formulary Inclusion", "KOL Management", "Medical Device Institutional", "Pharmacy Chain Sales"],
      }
    },
  },

  "Marketing & Communications": {
    "Brand Management": {
      specialisations: ["Brand Strategy", "Portfolio Management", "Campaign Management", "Packaging Design & Refresh", "Brand Licensing", "Consumer Activation"],
      depth: {
        "Campaign Management": ["ATL Campaigns", "360-degree Campaigns", "IPL / Large Property Sponsorships", "Agency Management", "Campaign ROI Tracking"],
        "Brand Strategy": ["Brand Architecture", "Positioning & Messaging", "Brand Equity Measurement", "Rebranding", "Brand Extension"],
        "Consumer Activation": ["On-ground Events", "Sampling Campaigns", "In-store Activation", "Influencer-led Activation"],
        "Packaging Design & Refresh": ["Consumer Research for Pack", "Agency Brief", "Regulatory Compliance on Pack", "Shelf Impact Testing"],
      }
    },
    "Digital Marketing": {
      specialisations: ["SEO & Organic Search", "Paid Performance Marketing", "Social Media Management", "Email & CRM Marketing", "Influencer & Creator Marketing", "Marketing Analytics & Attribution", "MarTech & Automation"],
      depth: {
        "Paid Performance Marketing": ["Google Ads", "Meta Ads (Facebook / Instagram)", "DV360 / Programmatic", "App Install Campaigns", "Affiliate Marketing", "Budget > ₹1Cr/month", "Budget > ₹5Cr/month", "ROAS Optimisation"],
        "Marketing Analytics & Attribution": ["Google Analytics 4", "MMP (AppsFlyer / Adjust)", "Multi-touch Attribution", "Cohort Analysis", "Tableau / Power BI / Looker"],
        "MarTech & Automation": ["HubSpot", "Salesforce Marketing Cloud", "Clevertap", "WebEngage", "MoEngage", "Marketo"],
        "SEO & Organic Search": ["Technical SEO", "Content SEO", "Link Building", "Keyword Research", "SEO Tools — Ahrefs / SEMrush / Moz"],
        "Social Media Management": ["Instagram / Facebook", "LinkedIn", "YouTube", "Twitter / X", "Community Management", "Social Listening"],
        "Email & CRM Marketing": ["Email Automation", "Segmentation", "A/B Testing", "Deliverability", "Lifecycle Marketing"],
        "Influencer & Creator Marketing": ["Macro Influencer Campaigns", "Micro / Nano Influencer Strategy", "Influencer ROI Measurement", "Creator Partnerships"],
      }
    },
    "Trade Marketing": {
      specialisations: ["Shopper Marketing", "In-store Execution", "Channel Promotions", "Visibility & Merchandising", "BTL Activations"],
      depth: {
        "Shopper Marketing": ["Shopper Insights", "Path to Purchase", "In-store Communication", "Occasion-based Marketing"],
        "In-store Execution": ["POSM Design & Deployment", "Planogram Management", "On-shelf Availability", "Merchandising Team Management"],
        "BTL Activations": ["Van Campaigns", "Market Storming", "Demo Activations", "RWA / Housing Society Activations"],
      }
    },
    "PR & Communications": {
      specialisations: ["Media Relations", "Crisis Communications", "Corporate Communications", "Internal Communications", "Digital PR", "Spokesperson Training"],
      depth: {
        "Media Relations": ["Print / TV / Digital Media", "Press Release Writing", "Media Briefings", "Journalist Relationships"],
        "Crisis Communications": ["Crisis Protocol Design", "Dark Site Management", "Social Media Crisis", "Spokesperson Coaching"],
        "Internal Communications": ["Townhalls", "CEO Communications", "Intranet / Newsletter", "Change Communication"],
      }
    },
    "Consumer Insights & Research": {
      specialisations: ["Quantitative Research", "Qualitative / Focus Groups", "Brand Health Tracking", "Usage & Attitude Studies", "Concept Testing"],
      depth: {
        "Quantitative Research": ["Survey Design", "CAPI / CATI / Online", "Statistical Analysis", "Sampling Methodology", "SPSS / Qualtrics"],
        "Qualitative / Focus Groups": ["FGD Moderation", "IDI — In-depth Interviews", "Ethnography", "Online Communities"],
        "Brand Health Tracking": ["Brand Funnel Metrics", "NPS Tracking", "Awareness / Consideration / Preference", "Continuous Tracking Studies"],
      }
    },
    "Growth & Performance Marketing": {
      specialisations: ["Google Ads", "Meta Ads", "Programmatic Buying", "App Marketing", "Affiliate Marketing", "Attribution Modelling"],
      depth: {
        "Google Ads": ["Search Campaigns", "Display Network", "YouTube Ads", "Shopping Campaigns", "Performance Max", "Google Certified"],
        "Meta Ads": ["Meta Blueprint Certified", "Conversion Campaigns", "Retargeting", "Lookalike Audiences", "Catalogue Ads"],
        "App Marketing": ["App Store Optimisation (ASO)", "UA Campaigns", "Retention Marketing", "Push Notifications", "In-app Events"],
        "Attribution Modelling": ["Last-click vs Data-driven", "MMP Setup", "Cross-channel Attribution", "Incrementality Testing"],
      }
    },
    "Product Marketing": {
      specialisations: ["GTM Strategy", "Product Positioning", "Competitive Intelligence", "Sales Enablement", "Feature Launch Communication"],
      depth: {
        "GTM Strategy": ["Market Sizing", "ICP Definition", "Channel Strategy", "Pricing Strategy", "Launch Planning"],
        "Sales Enablement": ["Sales Deck Creation", "Battle Cards", "Objection Handling Guides", "Product Training for Sales"],
        "Competitive Intelligence": ["Competitor Tracking", "Win / Loss Analysis", "Market Mapping", "Competitive Benchmarking"],
      }
    },
    "Category Management": {
      specialisations: ["Assortment Planning", "Price-Pack Architecture", "Shelf Optimisation", "Category Insights"],
      depth: {
        "Assortment Planning": ["SKU Rationalisation", "Range Review", "New Product Listing", "Delisting Management"],
        "Price-Pack Architecture": ["Pack Size Strategy", "Price Ladder Design", "Price Elasticity Studies", "Consumer Value Perception"],
      }
    },
  },

  "Finance & Accounts": {
    "Financial Reporting & Control": {
      specialisations: ["Month-end Close", "P&L Management", "Balance Sheet Ownership", "Group Consolidation", "IGAAP / Ind-AS / IFRS", "ERP — SAP / Oracle / Tally"],
      depth: {
        "ERP — SAP / Oracle / Tally": ["SAP FI / CO", "Oracle Financials", "Tally ERP", "NetSuite", "Microsoft Dynamics"],
        "IGAAP / Ind-AS / IFRS": ["Accounting Standards", "Disclosure Requirements", "Transition from IGAAP to Ind-AS", "IFRS 16 / 9 / 15"],
        "Group Consolidation": ["Intercompany Elimination", "Multi-entity Consolidation", "Minority Interest", "Foreign Currency Translation"],
      }
    },
    "FP&A & Budgeting": {
      specialisations: ["Annual Operating Plan", "Rolling Forecasts", "Management Reporting", "Variance Analysis", "Business Partnering with Functions"],
      depth: {
        "Management Reporting": ["CFO Dashboard", "Board Packs", "Investor Reporting", "BI Tools — Tableau / Power BI / Looker"],
        "Annual Operating Plan": ["Zero-based Budgeting", "Driver-based Budgeting", "Scenario Planning", "Budget vs Actuals"],
        "Rolling Forecasts": ["13-week Cash Forecast", "Quarterly Reforecast", "S&OP Finance Interface"],
      }
    },
    "Taxation": {
      specialisations: ["Direct Tax — Corporate", "Transfer Pricing", "GST — Indirect Tax", "International Tax", "Tax Litigation"],
      depth: {
        "Direct Tax — Corporate": ["Advance Tax", "TDS Management", "Income Tax Return Filing", "Tax Audit"],
        "GST — Indirect Tax": ["GST Returns (GSTR 1 / 3B / 9)", "Input Tax Credit", "GST Audit", "E-invoicing", "GST Litigation"],
        "Transfer Pricing": ["TP Study", "Benchmarking", "TP Documentation", "APA — Advance Pricing Agreement"],
        "International Tax": ["DTAA Application", "Withholding Tax", "BEPS Compliance", "PE Risk Assessment"],
      }
    },
    "Audit & Compliance": {
      specialisations: ["Internal Audit", "Statutory Audit Coordination", "SOX Compliance", "IFC / Internal Controls", "Revenue Assurance"],
      depth: {
        "Internal Audit": ["Risk-based Audit Plan", "Process Audits", "IT Audits", "Forensic Audit", "Audit Committee Reporting"],
        "SOX Compliance": ["SOX 302 / 404", "Control Testing", "Deficiency Reporting", "Big 4 Interface"],
        "IFC / Internal Controls": ["Control Framework Design", "Entity-level Controls", "Process-level Controls", "Control Self-assessment"],
      }
    },
    "Treasury & Cash Flow": {
      specialisations: ["Working Capital Management", "Forex Risk Management", "Banking Relationships", "Cash Flow Forecasting", "Debt Management"],
      depth: {
        "Forex Risk Management": ["Hedging — Forward / Options", "Forex Policy Design", "Currency Exposure Management", "FX Derivatives"],
        "Working Capital Management": ["Debtor Management", "Creditor Optimisation", "Inventory Financing", "Supply Chain Finance"],
        "Debt Management": ["Term Loan Management", "Working Capital Limits", "Debt Restructuring", "Credit Rating Interface"],
      }
    },
    "Commercial Finance": {
      specialisations: ["Pricing Analysis", "Cost Reduction Initiatives", "Margin Analysis", "Sales Finance Partnering", "Channel P&L"],
      depth: {
        "Pricing Analysis": ["Price Waterfall", "Net Revenue Management", "Discount Management", "Price vs Volume Mix"],
        "Margin Analysis": ["Gross Margin", "Contribution Margin", "EBITDA Bridge", "Product / Channel / Geography P&L"],
      }
    },
    "M&A & Corporate Finance": {
      specialisations: ["Buy-side M&A", "Sell-side M&A", "Due Diligence", "Valuation", "Post-merger Integration"],
      depth: {
        "Valuation": ["DCF", "Comparable Companies Analysis", "Precedent Transactions", "LBO", "NAV", "Sum of Parts"],
        "Due Diligence": ["Financial DD", "Tax DD", "Commercial DD Coordination", "Data Room Management"],
        "Post-merger Integration": ["100-day Plan", "Finance Integration", "ERP Integration", "Synergy Tracking"],
      }
    },
    "Fund Raising": {
      specialisations: ["Private Equity", "Venture Capital", "Debt Financing", "IPO Preparation", "DRHP Filing"],
      depth: {
        "Private Equity": ["PE Fund Raise", "IM / CIM Preparation", "Management Presentation", "Term Sheet Negotiation"],
        "IPO Preparation": ["DRHP Drafting", "SEBI Filing", "Roadshow Coordination", "Merchant Banker Interface"],
        "Venture Capital": ["VC Pitch Deck", "Cap Table Management", "Valuation Negotiation", "SAFE / Convertible Notes"],
      }
    },
  },

  "Operations & Supply Chain": {
    "Supply Chain Planning": {
      specialisations: ["Demand Forecasting", "S&OP", "Inventory Optimisation", "Supply Planning", "IBP"],
      depth: {
        "Demand Forecasting": ["Statistical Forecasting", "ML-based Forecasting", "Consensus Forecasting", "New Product Forecasting", "SAP APO / IBP"],
        "S&OP": ["Monthly S&OP Process", "Demand Review", "Supply Review", "Executive S&OP", "S&OP Tool Implementation"],
        "Inventory Optimisation": ["Safety Stock Modelling", "ABC-XYZ Analysis", "EOQ", "Slow & Non-moving Management"],
      }
    },
    "Procurement": {
      specialisations: ["Strategic Sourcing", "Category Management", "Supplier Development", "Contract Management", "CapEx Procurement"],
      depth: {
        "Strategic Sourcing": ["RFQ / RFP Management", "Should-cost Modelling", "Global Sourcing", "E-auctions", "Spend Analytics"],
        "Category Management": ["Indirect Categories (IT / FM / Marketing)", "Direct Categories (Raw Materials / Packaging)", "Category Strategy", "Preferred Supplier Programme"],
        "Supplier Development": ["Supplier Onboarding", "Supplier Audits", "Scorecards", "Capability Building", "Dual Sourcing"],
      }
    },
    "Warehouse & Logistics": {
      specialisations: ["Warehouse Management", "Last Mile Delivery", "3PL Management", "Transport Optimisation", "Cold Chain Logistics", "Import / Export Logistics"],
      depth: {
        "Warehouse Management": ["WMS Implementation", "Slotting Optimisation", "Pick-pack-ship", "Cycle Counting", "Space Utilisation"],
        "Last Mile Delivery": ["Delivery Route Optimisation", "Rider Management", "Customer Experience", "Returns Management", "Hyperlocal Logistics"],
        "3PL Management": ["3PL RFP & Selection", "SLA Management", "3PL Performance Review", "Multi-3PL Coordination"],
      }
    },
    "Manufacturing Operations": {
      specialisations: ["Production Planning & Control", "Capacity Planning", "Lean Manufacturing", "TPM / OEE", "Shop Floor Management", "Plant P&L Ownership"],
      depth: {
        "Lean Manufacturing": ["5S", "Kaizen", "Value Stream Mapping", "SMED", "Poka-yoke", "Jidoka"],
        "TPM / OEE": ["Autonomous Maintenance", "Planned Maintenance", "OEE Measurement", "Downtime Analysis", "TEEP"],
        "Production Planning & Control": ["MRP", "Production Scheduling", "Material Availability Check", "Capacity Loading"],
      }
    },
    "Quality Management": {
      specialisations: ["QA / QC", "ISO / BIS / FSSAI Compliance", "Six Sigma", "SPC", "Supplier Quality Management"],
      depth: {
        "Six Sigma": ["Green Belt", "Black Belt", "DMAIC Projects", "Design for Six Sigma", "Minitab"],
        "ISO / BIS / FSSAI Compliance": ["ISO 9001", "ISO 22000", "FSSAI Licence & Compliance", "BIS Certification", "FSSC 22000"],
        "SPC": ["Control Charts", "Process Capability (Cp / Cpk)", "Measurement System Analysis", "FMEA"],
      }
    },
    "Project Management": {
      specialisations: ["Project Planning & Scheduling", "Greenfield / Brownfield Setup", "PMO", "Risk & Issue Management", "Budget Management for Projects"],
      depth: {
        "Project Planning & Scheduling": ["MS Project", "Primavera", "Critical Path Method", "Gantt Charts", "Milestone Tracking"],
        "Greenfield / Brownfield Setup": ["Site Selection", "Layout Design", "Equipment Procurement", "Trial Runs & Commissioning", "Go-live Planning"],
        "PMO": ["Programme Governance", "Reporting Frameworks", "Change Control", "Benefits Realisation"],
      }
    },
  },

  "Technology & Product": {
    "Software Engineering": {
      specialisations: ["Frontend Development", "Backend Development", "Full Stack Development", "API Development & Integration", "Microservices Architecture", "System Design"],
      depth: {
        "Frontend Development": ["React / Next.js", "Vue.js", "Angular", "TypeScript", "Responsive Design", "Web Performance Optimisation"],
        "Backend Development": ["Node.js", "Python / Django / FastAPI", "Java / Spring Boot", "Go", "PostgreSQL / MySQL", "MongoDB / NoSQL"],
        "System Design": ["High Availability", "Scalability", "Distributed Systems", "Caching (Redis)", "Message Queues (Kafka)", "Load Balancing"],
        "API Development & Integration": ["REST APIs", "GraphQL", "Webhooks", "API Gateway", "Third-party Integrations"],
      }
    },
    "Product Management": {
      specialisations: ["Product Strategy & Vision", "Roadmap Planning", "User Research & Discovery", "Feature Prioritisation", "GTM for Products", "Growth Product Management"],
      depth: {
        "Product Strategy & Vision": ["Product Vision Documents", "OKRs for Product", "Build vs Buy vs Partner", "Platform Strategy", "Monetisation Strategy"],
        "User Research & Discovery": ["User Interviews", "Jobs to be Done", "Usability Testing", "Persona Development", "Opportunity Sizing"],
        "Growth Product Management": ["Activation Funnels", "Retention Loops", "A/B Experimentation", "North Star Metric", "Growth Frameworks (AARRR)"],
        "Feature Prioritisation": ["RICE / ICE Framework", "MoSCoW", "Story Mapping", "Backlog Grooming", "Sprint Planning"],
      }
    },
    "Data & Analytics": {
      specialisations: ["Data Engineering", "Business Intelligence & Reporting", "Data Science", "Machine Learning", "Data Governance", "Analytics Platform Management"],
      depth: {
        "Data Engineering": ["ETL / ELT Pipelines", "dbt", "Apache Spark", "Airflow", "Data Warehousing (Snowflake / BigQuery / Redshift)"],
        "Data Science": ["Python (Pandas / Scikit-learn)", "R", "Hypothesis Testing", "A/B Experimentation", "Predictive Modelling"],
        "Business Intelligence & Reporting": ["Tableau", "Power BI", "Looker", "Metabase", "SQL — Advanced"],
        "Machine Learning": ["Supervised / Unsupervised Learning", "Deep Learning", "NLP", "Model Deployment", "MLOps"],
      }
    },
    "DevOps & Cloud": {
      specialisations: ["CI / CD Pipeline", "Cloud Infrastructure", "Kubernetes & Docker", "Site Reliability Engineering", "Infrastructure as Code"],
      depth: {
        "Cloud Infrastructure": ["AWS", "Google Cloud (GCP)", "Microsoft Azure", "Multi-cloud", "Cloud Cost Optimisation"],
        "CI / CD Pipeline": ["GitHub Actions", "Jenkins", "GitLab CI", "ArgoCD", "Blue-green Deployments"],
        "Infrastructure as Code": ["Terraform", "Pulumi", "Ansible", "CloudFormation"],
      }
    },
    "AI / ML Engineering": {
      specialisations: ["ML Model Development", "NLP / LLM Engineering", "Computer Vision", "MLOps & Model Deployment", "Generative AI Applications"],
      depth: {
        "NLP / LLM Engineering": ["LangChain", "OpenAI API", "Anthropic Claude API", "RAG (Retrieval Augmented Generation)", "Fine-tuning LLMs", "Prompt Engineering"],
        "MLOps & Model Deployment": ["Model Serving (FastAPI / TorchServe)", "Feature Stores", "Model Monitoring", "A/B Testing for ML"],
        "Generative AI Applications": ["Chatbot Development", "AI Agents", "Image Generation", "Code Generation", "Document AI"],
      }
    },
    "Mobile Development": {
      specialisations: ["iOS Development", "Android Development", "React Native / Flutter", "App Performance Optimisation", "App Store Deployment"],
      depth: {
        "iOS Development": ["Swift", "SwiftUI", "Xcode", "App Store Connect", "In-app Purchases"],
        "Android Development": ["Kotlin", "Jetpack Compose", "Android Studio", "Google Play Console", "Firebase"],
        "React Native / Flutter": ["React Native", "Flutter / Dart", "Expo", "Cross-platform Performance", "Native Module Integration"],
      }
    },
  },

  "Design & Creative": {
    "Fashion Design": {
      specialisations: ["Womenswear Design", "Menswear Design", "Accessories Design", "Textile & Surface Design", "Kidswear Design", "Bridal & Occasion Wear", "Couture & Luxury Design"],
      depth: {
        "Womenswear Design": ["Ready-to-wear", "Couture / Luxury", "Athleisure", "Ethnic / Fusion", "Western Formals", "CAD — Gerber / Lectra / CLO3D", "Draping & Toile", "Silhouette Development"],
        "Couture & Luxury Design": ["Haute Couture", "Bridal Couture", "Red Carpet / Evening Wear", "Hand Embroidery Direction", "Zardozi / Aari Work", "Embellishment Design", "Luxury RTW", "Seasonal Collection Development", "Lookbook & Presentation"],
        "Accessories Design": ["Handbags", "Footwear", "Jewellery", "Belts & Small Leather Goods", "Scarves & Neckwear", "Millinery"],
        "Textile & Surface Design": ["Print Design", "Embroidery", "Weave Design", "Fabric Sourcing", "Surface Embellishment", "Hand Craft & Artisan Techniques", "Dyeing & Printing Techniques"],
        "Menswear Design": ["Formal Wear", "Casual / Streetwear", "Sportswear", "Ethnic Menswear", "Pattern Cutting", "Bespoke Tailoring"],
        "Bridal & Occasion Wear": ["Bridal Lehenga", "Sherwani", "Indo-western Bridal", "Wedding Guest Styling", "Trousseau Planning"],
      }
    },
    "Creative Direction & Styling": {
      specialisations: ["Creative Direction", "Fashion Styling", "Visual Merchandising", "Editorial Styling", "Campaign Direction", "Brand Aesthetic Development"],
      depth: {
        "Creative Direction": ["Seasonal Vision Setting", "Mood Board Development", "Collection Story", "Photoshoot Direction", "Brand Identity through Design", "Collaborations & Partnerships"],
        "Fashion Styling": ["Editorial Styling", "Celebrity Styling", "Lookbook Styling", "E-commerce Styling", "Personal Styling", "Prop & Set Styling"],
        "Campaign Direction": ["Campaign Concept", "Photographer Briefing", "Model Direction", "Post-production Direction", "Social Media Campaign"],
        "Visual Merchandising": ["Window Display", "In-store VM", "Planogram", "Retail Experience Design", "VM Guidelines"],
      }
    },
    "UI / UX Design": {
      specialisations: ["User Research & Personas", "Wireframing & Prototyping", "Visual / Interaction Design", "Design Systems", "Usability Testing", "Mobile App Design"],
      depth: {
        "Wireframing & Prototyping": ["Figma", "Adobe XD", "Sketch", "InVision", "Framer", "Principle"],
        "Design Systems": ["Component Libraries", "Design Tokens", "Style Guides", "Storybook", "Accessibility (WCAG)"],
        "Visual / Interaction Design": ["Typography", "Colour Theory", "Motion Design", "Micro-interactions", "Dark Mode Design"],
      }
    },
    "Graphic & Visual Design": {
      specialisations: ["Brand Identity Design", "Packaging Design", "Print & Publication Design", "Motion Graphics", "Illustration", "Environmental / Retail Design"],
      depth: {
        "Brand Identity Design": ["Logo Design", "Visual Identity Systems", "Brand Guidelines", "Rebranding", "Adobe Illustrator / Photoshop"],
        "Packaging Design": ["Structural Packaging", "Graphic on Pack", "Retail Ready Packaging", "Sustainable Packaging", "3D Mockups"],
        "Motion Graphics": ["After Effects", "Cinema 4D", "Premiere Pro", "2D Animation", "Explainer Videos"],
      }
    },
    "Production & Sampling": {
      specialisations: ["Pattern Making", "Sampling", "Fit Sessions", "Tech Pack Development", "Vendor / Factory Coordination"],
      depth: {
        "Pattern Making": ["Flat Pattern Making", "Draping", "Grading", "Gerber / Optitex", "Block Development"],
        "Tech Pack Development": ["Construction Details", "BOM — Bill of Materials", "Measurement Spec", "Quality Checkpoints"],
        "Vendor / Factory Coordination": ["Factory Audit", "Sample Approval", "Production Follow-up", "QC at Source"],
      }
    },
  },

  "Legal & Compliance": {
    "Corporate Law": {
      specialisations: ["Company Secretarial", "Board & Governance", "Shareholder Agreements", "Regulatory Filings — MCA / ROC", "FEMA / FDI Compliance"],
      depth: {
        "Company Secretarial": ["Minutes & Resolutions", "Annual Filings — MCA", "Board Meeting Management", "Secretarial Audit", "SEBI Compliance for Listed Co."],
        "FEMA / FDI Compliance": ["FDI Reporting", "ODI Filings", "ECB Compliance", "FEMA Compounding", "RBI Liaising"],
      }
    },
    "Employment & Labour Law": {
      specialisations: ["Employment Contracts", "POSH / ICC", "Standing Orders", "Labour Law Compliance", "Retrenchment & Severance", "Union / IR Management"],
      depth: {
        "Labour Law Compliance": ["PF / ESI", "Minimum Wages", "Shops & Establishments", "Contract Labour Act", "Factory Act Compliance"],
        "Retrenchment & Severance": ["VRS Design", "Notice Pay", "Gratuity Calculation", "NLRA / Industrial Disputes Act"],
      }
    },
    "Contracts & Commercial Law": {
      specialisations: ["Drafting & Review — MSA / SLA / NDA", "Vendor Contracts", "Distribution Agreements", "Licensing Agreements", "JV Agreements"],
      depth: {
        "Drafting & Review — MSA / SLA / NDA": ["Master Service Agreements", "NDAs", "SLA Design", "Indemnity Clauses", "Limitation of Liability"],
        "Licensing Agreements": ["IP Licensing", "Technology Licensing", "Franchise Agreements", "Brand Licensing"],
      }
    },
    "Data Privacy & Technology Law": {
      specialisations: ["PDPB / DPDP Act Compliance", "GDPR", "Privacy Policy Drafting", "Data Processing Agreements", "Tech Contracts"],
      depth: {
        "PDPB / DPDP Act Compliance": ["Data Localisation", "Consent Management", "Data Fiduciary Obligations", "Grievance Redressal Mechanism"],
        "GDPR": ["Data Subject Rights", "DPA Agreements", "Cross-border Transfers", "GDPR Audit"],
      }
    },
  },

  "General Management / P&L": {
    "Business Unit Leadership": {
      specialisations: ["SBU Head", "Country Head", "Regional Head", "Cluster / Zone Head", "Multi-function Oversight", "Board Reporting"],
      depth: {
        "SBU Head": ["Full P&L Ownership", "Multi-function Teams", "Strategy to Execution", "Board / Investor Reporting"],
        "Country Head": ["In-country P&L", "Regulatory Interface", "Local Team Building", "Global HQ Interface"],
      }
    },
    "P&L Ownership": {
      specialisations: ["Revenue > ₹50Cr", "Revenue > ₹200Cr", "Revenue > ₹500Cr", "Revenue > ₹1000Cr", "EBITDA Improvement", "Cost Optimisation"],
      depth: {
        "EBITDA Improvement": ["Cost Structure Analysis", "Pricing Lever", "Volume Growth", "Mix Improvement", "Fixed Cost Reduction"],
        "Cost Optimisation": ["Zero-based Budgeting", "Procurement Cost Reduction", "Headcount Optimisation", "Process Automation Savings"],
      }
    },
    "Turnaround & Transformation": {
      specialisations: ["Loss-making to Profitable", "Business Model Change", "Operational Restructuring", "Cost Restructuring", "Culture Transformation"],
      depth: {
        "Loss-making to Profitable": ["Cash Conservation", "Revenue Acceleration", "Cost Right-sizing", "Portfolio Pruning", "Investor Communication during Turnaround"],
        "Culture Transformation": ["Culture Diagnosis", "Values Rollout", "Leadership Behaviour Change", "Communication Strategy"],
      }
    },
    "Corporate Strategy": {
      specialisations: ["Long-range Planning", "Portfolio Strategy", "M&A Strategy", "Competitive Analysis", "Investor Presentations"],
      depth: {
        "Long-range Planning": ["3-year / 5-year Strategic Plan", "Scenario Planning", "Strategic Choices Framework", "OKR Alignment"],
        "M&A Strategy": ["Target Identification", "Strategic Rationale", "Integration Planning", "Value Creation Framework"],
      }
    },
  },

  "Administration & Facilities": {
    "Facilities Management": {
      specialisations: ["Office Administration", "Space Planning", "Vendor Management — AMC", "Building Maintenance", "Housekeeping Oversight", "Multi-site Facilities"],
      depth: {
        "Multi-site Facilities": ["Pan-India Facilities", "Facilities Cost Management", "Lease Management", "CAFM Systems"],
        "Vendor Management — AMC": ["AMC Contracts", "SLA Monitoring", "Vendor Rationalisation", "Cost Benchmarking"],
      }
    },
    "EHS & Safety": {
      specialisations: ["Factory Safety", "Fire Safety", "Emergency Response Planning", "EHS Audits", "ISO 45001 Compliance", "Incident Reporting"],
      depth: {
        "Factory Safety": ["Permit to Work Systems", "LOTO Procedures", "PPE Management", "Safety Induction Training", "Near-miss Reporting"],
        "ISO 45001 Compliance": ["Gap Assessment", "Documentation", "Internal Audit", "Certification & Surveillance Audit"],
      }
    },
  },

  "Production & Manufacturing": {
    "Production Planning": {
      specialisations: ["Production Scheduling", "Capacity Planning", "Material Requirements Planning", "Batch Production Management", "Continuous Manufacturing"],
      depth: {
        "Production Scheduling": ["Master Production Schedule", "Short Interval Scheduling", "Finite / Infinite Capacity", "SAP PP / MM"],
        "Material Requirements Planning": ["MRP Run", "BOM Management", "Planned vs Actual Consumption", "Material Shortage Management"],
      }
    },
    "Shop Floor Management": {
      specialisations: ["Shift Management", "Line Balancing", "Labour Productivity", "Downtime Reduction", "Daily Management System"],
      depth: {
        "Daily Management System": ["Tier Meetings", "Visual Management", "DMS Boards", "Escalation Protocols", "KPI Review Cadence"],
        "Labour Productivity": ["Manpower Planning", "Output per Person", "Multi-skilling", "Incentive Schemes for Workers"],
      }
    },
    "Process Engineering": {
      specialisations: ["Process Design", "SOP Development", "Process Improvement — Lean / Six Sigma", "Scale-up from Lab to Plant", "Technology Transfer"],
      depth: {
        "Process Design": ["PFD / P&ID", "Mass & Energy Balance", "Equipment Sizing", "HAZOP Studies", "Process Simulation"],
        "Scale-up from Lab to Plant": ["Pilot Trials", "Tech Transfer Protocol", "Validation — IQ / OQ / PQ", "Scale-up Risk Assessment"],
      }
    },
  },

  "Engineering (Civil / Mechanical / Electrical)": {
    "Civil & Structural Engineering": {
      specialisations: ["Structural Design", "Foundation Engineering", "Construction Supervision", "Estimation & Costing", "Tendering", "AutoCAD / Revit / BIM"],
      depth: {
        "Structural Design": ["RCC Design", "Steel Structures", "Pre-engineered Buildings", "STAAD Pro / ETABS / SAP2000"],
        "AutoCAD / Revit / BIM": ["AutoCAD 2D / 3D", "Revit Architecture / Structure", "BIM Level 2", "Navisworks", "Coordination Drawings"],
        "Estimation & Costing": ["BOQ Preparation", "Rate Analysis", "Tender Pricing", "Value Engineering"],
      }
    },
    "Mechanical Engineering": {
      specialisations: ["Equipment Design", "HVAC Systems", "Piping & Pressure Vessels", "Rotating Equipment", "AutoCAD / SolidWorks / CATIA"],
      depth: {
        "Equipment Design": ["Static Equipment", "Heat Exchangers", "Pressure Vessels — ASME", "SolidWorks / PTC Creo / CATIA"],
        "HVAC Systems": ["Load Calculation", "Duct Design", "Chiller Plants", "VRF Systems", "HVAC Commissioning"],
      }
    },
    "Project Engineering": {
      specialisations: ["Site Supervision", "Turnkey Project Execution", "Commissioning & Startup", "PMC", "EPC Contracts"],
      depth: {
        "Turnkey Project Execution": ["Multi-discipline Coordination", "Vendor Package Management", "Schedule Control", "Cost Control", "Handover Documentation"],
        "EPC Contracts": ["FIDIC Contracts", "Contract Administration", "Variation Management", "Dispute Resolution"],
      }
    },
  },

  "Research & Development": {
    "Biomedical & Life Sciences Research": {
      specialisations: ["Drug Discovery", "Biomedical Research", "Molecular Biology", "Genomics & Proteomics", "Immunology & Cell Biology", "Translational Research", "Pre-clinical Research"],
      depth: {
        "Drug Discovery": ["Target Identification", "Hit-to-Lead", "Lead Optimisation", "ADMET Studies", "Computational Drug Design", "Fragment-based Drug Discovery"],
        "Biomedical Research": ["In-vitro Studies", "In-vivo Animal Models", "Histopathology", "Flow Cytometry", "ELISA / Western Blot", "PCR / qPCR"],
        "Molecular Biology": ["Gene Cloning", "CRISPR", "Sequencing (NGS / Sanger)", "Protein Expression", "Recombinant DNA Technology"],
        "Genomics & Proteomics": ["Whole Genome Sequencing", "RNA-seq", "Mass Spectrometry", "Bioinformatics Analysis", "Pathway Analysis"],
        "Translational Research": ["Biomarker Identification", "Clinical Translation", "IND-enabling Studies", "Proof of Concept Studies"],
      }
    },
    "Clinical Research": {
      specialisations: ["Clinical Trial Management", "Site Management", "Data Management", "Pharmacovigilance / Drug Safety", "Medical Writing", "Biostatistics", "Regulatory Affairs — Clinical"],
      depth: {
        "Clinical Trial Management": ["Phase I / II / III / IV Trials", "Protocol Development", "CRO Management", "IRB / IEC Submissions", "ICH GCP Compliance", "eTMF Management"],
        "Pharmacovigilance / Drug Safety": ["Adverse Event Reporting", "ICSR Processing", "Signal Detection", "PSUR / PBRER Writing", "EudraVigilance", "FDA MedWatch"],
        "Medical Writing": ["Clinical Study Reports", "Regulatory Submissions", "Protocol Writing", "Investigator Brochure", "Patient Information Leaflets", "Publications / Manuscripts"],
        "Biostatistics": ["Statistical Analysis Plan", "SAS Programming", "R Programming", "Sample Size Calculation", "Survival Analysis", "Mixed Models"],
        "Site Management": ["Site Identification", "Site Initiation", "Monitoring Visits", "Protocol Deviation Management", "Patient Recruitment"],
      }
    },
    "Medical Affairs": {
      specialisations: ["Medical Science Liaison", "KOL Management", "Medical Information", "Health Economics & Outcomes Research", "Medical Education", "Real World Evidence"],
      depth: {
        "Medical Science Liaison": ["Scientific Engagement", "Advisory Boards", "Congress Coverage", "Investigator-initiated Studies", "Publication Strategy"],
        "Health Economics & Outcomes Research": ["HEOR Modelling", "Cost-effectiveness Analysis", "Budget Impact Models", "Patient Reported Outcomes", "Health Technology Assessment"],
        "Real World Evidence": ["RWE Study Design", "Claims Data Analysis", "Registry Studies", "Electronic Health Records Analysis"],
      }
    },
    "Laboratory Sciences": {
      specialisations: ["Analytical Chemistry", "Microbiology", "Quality Control Laboratory", "Formulation Lab", "Stability Testing", "Instrument Operation & Qualification"],
      depth: {
        "Analytical Chemistry": ["HPLC / UPLC", "GC / GC-MS", "LC-MS / MS", "NMR Spectroscopy", "ICP-MS", "Method Development & Validation"],
        "Microbiology": ["Sterility Testing", "Microbial Limit Tests", "Endotoxin Testing", "Environmental Monitoring", "Microbial Identification"],
        "Quality Control Laboratory": ["In-process Testing", "Finished Product Testing", "OOS Investigations", "Laboratory Investigations", "LIMS"],
        "Stability Testing": ["ICH Stability Studies", "Accelerated Studies", "Shelf-life Prediction", "Stability Chambers Management"],
      }
    },
    "Product Development": {
      specialisations: ["New Product Introduction (NPI)", "Technology Transfer", "Scale-up", "Stability Studies", "Product Lifecycle Management"],
      depth: {
        "New Product Introduction (NPI)": ["Stage-gate Process", "Cross-functional NPD Teams", "Prototype Development", "Consumer Testing", "Launch Readiness"],
        "Stability Studies": ["Real-time / Accelerated Studies", "ICH Guidelines", "Stability Chambers", "Shelf Life Prediction"],
      }
    },
    "Formulation & Chemistry": {
      specialisations: ["Pharmaceutical Formulation", "Cosmetic / Personal Care Formulation", "Food Ingredient Development", "Polymer / Material Development"],
      depth: {
        "Pharmaceutical Formulation": ["Solid Dosage Forms (Tablet / Capsule)", "Liquid Dosage Forms", "Topicals / Injectables", "USP / IP / BP Compliance"],
        "Cosmetic / Personal Care Formulation": ["Skin Care Formulation", "Hair Care Formulation", "Colour Cosmetics", "Regulatory — BIS / EU Cosmetics Regulation"],
      }
    },
    "Clinical & Regulatory": {
      specialisations: ["Clinical Trial Management", "Regulatory Affairs — CDSCO / USFDA / EMA", "Pharmacovigilance", "GMP / GLP Compliance"],
      depth: {
        "Clinical Trial Management": ["Phase I / II / III Trials", "CRO Management", "Protocol Development", "IRB / IEC Submissions", "ICH GCP"],
        "Regulatory Affairs — CDSCO / USFDA / EMA": ["CDSCO Drug Approvals", "USFDA 510k / PMA / NDA / ANDA", "EMA MAA", "Dossier Preparation (CTD Format)"],
      }
    },
  },

  "Customer Success & Service": {
    "Customer Success Management": {
      specialisations: ["Onboarding & Adoption", "Health Score Management", "Renewal & Upsell", "QBR", "Churn Prevention", "Product Feedback Loop"],
      depth: {
        "Onboarding & Adoption": ["Implementation Planning", "Training & Enablement", "Time-to-value Reduction", "Onboarding Playbooks"],
        "Health Score Management": ["Health Score Design", "Risk Segmentation", "Proactive Outreach", "CSP / Gainsight / Totango"],
        "Renewal & Upsell": ["Renewal Forecasting", "Expansion Revenue", "Multi-year Contracts", "Upsell Playbooks"],
      }
    },
    "Contact Centre Management": {
      specialisations: ["Inbound / Outbound Operations", "Workforce Management", "Quality Monitoring", "AHT / FCR Optimisation", "CRM Implementation", "Omnichannel Support"],
      depth: {
        "Workforce Management": ["Demand Forecasting", "Scheduling & Rostering", "Shrinkage Management", "Real-time Adherence", "Verint / NICE / Aspect"],
        "Omnichannel Support": ["Voice / Chat / Email / Social", "Unified Desktop", "Bot + Human Handoff", "Customer Journey Mapping"],
        "Quality Monitoring": ["Call Calibration", "Quality Scorecard Design", "Coaching from Quality", "Speech Analytics"],
      }
    },
  },

  "Content & Editorial": {
    "Content Strategy": {
      specialisations: ["Content Calendar Planning", "SEO Content Strategy", "Content Distribution", "Content Performance Analytics", "Brand Voice Development"],
      depth: {
        "SEO Content Strategy": ["Keyword Research", "Topic Clusters", "Pillar Pages", "Content Refresh Strategy", "Ahrefs / SEMrush / Clearscope"],
        "Content Performance Analytics": ["Google Analytics", "Content Engagement Metrics", "Conversion Attribution", "Content ROI"],
      }
    },
    "Copywriting & Brand Writing": {
      specialisations: ["Ad Copywriting", "Website Copy", "Email Marketing Copy", "Social Media Copy", "Long-form Brand Content"],
      depth: {
        "Ad Copywriting": ["Performance Copy (Google / Meta)", "Print Advertising", "OOH Copywriting", "Radio / TV Scripts", "A/B Tested Copy"],
        "Long-form Brand Content": ["White Papers", "Thought Leadership Articles", "Annual Reports", "Case Studies", "Brand Books"],
      }
    },
    "Video & Multimedia": {
      specialisations: ["Script Writing", "Video Production", "Podcast Production", "Animation & Motion Graphics Scripting", "YouTube Content Strategy"],
      depth: {
        "Video Production": ["Pre-production Planning", "On-set Direction", "Post-production Editing", "Premiere Pro / Final Cut", "YouTube / OTT Formats"],
        "Podcast Production": ["Format Design", "Script & Research", "Recording & Editing", "Distribution — Spotify / Apple", "Podcast Growth"],
      }
    },
  },

  "Training & Facilitation": {
    "Behavioural & Soft Skills Training": {
      specialisations: ["Communication Skills", "Interpersonal Effectiveness", "Conflict Resolution", "Presentation Skills", "Customer Centricity", "Emotional Intelligence"],
      depth: {
        "Communication Skills": ["Business Writing", "Executive Presence", "Public Speaking", "Cross-cultural Communication", "Virtual Communication"],
        "Emotional Intelligence": ["EQ Assessment Tools", "Self-awareness Workshops", "Empathy Building", "Resilience Programmes"],
      }
    },
    "Assessment & Psychometrics": {
      specialisations: ["Hogan Assessment Suite", "MBTI / DiSC", "SHL / Talogy", "Assessment Centre Design", "Development Centre Facilitation", "360 Debrief"],
      depth: {
        "Hogan Assessment Suite": ["HPI / HDS / MVPI Certified", "Leadership Debrief", "Selection Application", "Development Application", "Team Reports"],
        "Assessment Centre Design": ["Exercise Design", "Assessor Training", "Competency Mapping", "Integration & Calibration", "Feedback Report Writing"],
        "360 Debrief": ["360 Survey Design", "Tool Selection", "Debrief Facilitation", "Development Planning"],
      }
    },
    "Executive Coaching": {
      specialisations: ["ICF Certified Coaching", "Leadership Coaching", "Career Transition Coaching", "Team Coaching", "Stakeholder-centred Coaching"],
      depth: {
        "ICF Certified Coaching": ["ICF ACC", "ICF PCC", "ICF MCC", "Approved Coach Training Hours", "Supervision Hours"],
        "Leadership Coaching": ["New Leader Assimilation", "Derailment Prevention", "High-potential Coaching", "C-suite Coaching"],
        "Career Transition Coaching": ["Career Exploration", "Job Search Strategy", "Resume & LinkedIn", "Interview Coaching", "Outplacement"],
      }
    },
    "Instructional Design": {
      specialisations: ["ADDIE / SAM Model", "E-learning Development", "Blended Learning Design", "Gamification", "LMS Administration"],
      depth: {
        "E-learning Development": ["Articulate Storyline 360", "Articulate Rise", "Lectora Inspire", "Adobe Captivate", "SCORM / xAPI"],
        "LMS Administration": ["Moodle", "Cornerstone OnDemand", "SAP SuccessFactors LMS", "Docebo", "iSpring"],
      }
    },
  },

  "Investor Relations & Corporate Finance": {
    "Investor Relations": {
      specialisations: ["Analyst & Investor Communication", "Earnings Calls & Transcripts", "Annual Report Coordination", "SEBI / Stock Exchange Compliance", "Investor Day / NDR Management"],
      depth: {
        "Analyst & Investor Communication": ["Buy-side / Sell-side Interface", "Investor Q&A Preparation", "Quarterly Earnings Materials", "Investor Presentations"],
        "SEBI / Stock Exchange Compliance": ["SEBI LODR", "Insider Trading Policy", "Continuous Disclosure", "Structured Digital Database (SDD)"],
      }
    },
    "Fund Raising — Equity": {
      specialisations: ["PE / VC Fund Raise", "Series A to Pre-IPO", "Pitch Deck & IM Preparation", "Data Room Management", "Term Sheet Negotiation"],
      depth: {
        "PE / VC Fund Raise": ["Investor Identification", "Teaser & IM", "Management Presentation", "Due Diligence Support", "Closing & Documentation"],
        "Term Sheet Negotiation": ["Valuation Negotiation", "Anti-dilution Provisions", "Board Composition", "Liquidation Preference", "Drag-along / Tag-along"],
      }
    },
    "Valuation & Financial Modelling": {
      specialisations: ["DCF Modelling", "Comparable Company Analysis", "Precedent Transaction Analysis", "LBO Modelling", "3-Statement Model"],
      depth: {
        "DCF Modelling": ["Free Cash Flow to Firm", "WACC Calculation", "Terminal Value", "Sensitivity Analysis", "Scenario Modelling"],
        "LBO Modelling": ["Debt Structuring", "Returns Analysis (IRR / MOIC)", "Management Incentive Plans", "Exit Scenarios"],
      }
    },
  },

  "Import / Export & International Trade": {
    "Export Management": {
      specialisations: ["Export Documentation", "DGFT — Advance Licence / RoDTEP", "Export Incentive Management", "ECGC Insurance", "Foreign Currency Realisation"],
      depth: {
        "Export Documentation": ["Commercial Invoice", "Packing List", "Bill of Lading / Airway Bill", "Certificate of Origin", "Phytosanitary / Quality Certificates"],
        "DGFT — Advance Licence / RoDTEP": ["DGFT Portal", "Advance Authorisation", "EPCG Scheme", "RoDTEP Claiming", "AA Redemption"],
      }
    },
    "Import & Customs": {
      specialisations: ["Import Clearance", "BoE Filing", "Customs Duty Optimisation", "FTA Utilisation", "ICES / EDI Systems"],
      depth: {
        "Customs Duty Optimisation": ["Classification (HSN / ITC-HS)", "Customs Valuation", "Duty Drawback", "End Use Exemptions", "SVB Orders"],
        "FTA Utilisation": ["ASEAN / Japan / Korea FTA", "Certificate of Origin Verification", "Rules of Origin", "FTA Cost-benefit Analysis"],
      }
    },
    "Freight & Logistics": {
      specialisations: ["Freight Forwarding", "Sea / Air / Rail Freight", "Carrier Negotiation", "Multimodal Logistics", "3PL & 4PL Management"],
      depth: {
        "Sea / Air / Rail Freight": ["FCL / LCL", "Air Freight Consolidation", "Dedicated Freight Corridor", "Port Operations", "Customs at Port"],
        "Carrier Negotiation": ["Rate Negotiation", "SLA with Carriers", "Space Booking", "Freight Cost Benchmarking"],
      }
    },
  },

  "Events & Experiential": {
    "MICE Sales": {
      specialisations: ["Corporate Event Sales", "Incentive Travel Sales", "Conference & Convention Sales", "Exhibition Sales", "Wedding & Social Events Sales", "Government & PSU Events"],
      depth: {
        "Corporate Event Sales": ["C-suite Client Management", "RFP Response & Proposal Writing", "End-to-end Event Pitching", "Retainer Account Management", "Cross-sell & Upsell"],
        "Incentive Travel Sales": ["Domestic Incentive Tours", "International Incentive Travel", "Group Travel Sales", "Travel Package Design", "DMC Coordination"],
        "Conference & Convention Sales": ["MICE RFP Management", "Venue Tie-ups", "PCO — Professional Conference Organiser", "Speaker & Delegate Management"],
        "Government & PSU Events": ["Tender & Bid Management", "Government Protocol Events", "GeM Portal", "State / National Level Events"],
      }
    },
    "Event Operations & Production": {
      specialisations: ["Event Planning & Execution", "Stage & Production Management", "Vendor & Supplier Management", "On-ground Operations", "Large Format Events", "Virtual & Hybrid Events"],
      depth: {
        "Stage & Production Management": ["Stage Design", "AV Production", "LED & Lighting", "Sound Engineering", "Rigging & Staging", "Technical Rider Management"],
        "Large Format Events": ["IPL / Sports Events", "Music Festivals", "Award Shows", "Product Launches", "Brand Activations", "Events with 1000+ Pax", "Events with 5000+ Pax"],
        "Virtual & Hybrid Events": ["Virtual Platform Management", "Live Streaming", "Hybrid Event Production", "Webinar Management", "OBS / Zoom / Teams Events"],
        "Vendor & Supplier Management": ["Vendor Empanelment", "Rate Negotiation", "Decorator & Fabricator Management", "Catering Coordination", "Entertainment Booking"],
      }
    },
    "Client Servicing — Events": {
      specialisations: ["Key Account Management", "Brief Taking & Conceptualisation", "Proposal & Budget Management", "Post-event Reporting", "Client Retention"],
      depth: {
        "Brief Taking & Conceptualisation": ["Creative Brief Analysis", "Theme & Concept Development", "Moodboard Presentation", "Competitive Benchmarking"],
        "Proposal & Budget Management": ["Event Budgeting", "Cost Optimisation", "Markup & Margin Management", "Budget vs Actuals Tracking"],
        "Post-event Reporting": ["Event ROI Analysis", "Feedback Collection", "Photo & Video Compilation", "Post-event Presentation to Client"],
      }
    },
    "Venue & Logistics Management": {
      specialisations: ["Venue Scouting & Selection", "Hotel & Resort Coordination", "Travel & Transport Logistics", "F&B Planning", "VVIP Protocol Management"],
      depth: {
        "Venue Scouting & Selection": ["Site Inspection", "Venue Negotiation", "Contract Management", "Capacity Planning", "Fallback Planning"],
        "Travel & Transport Logistics": ["Group Air Ticketing", "Coach & Transfer Management", "Visa & Documentation", "Airport Handling", "Room Blocking"],
        "VVIP Protocol Management": ["State Guest Protocol", "Security Coordination", "Green Room & Hospitality", "Escort & Itinerary Management"],
      }
    },
    "Event Tech & Digital": {
      specialisations: ["Event Management Software", "Registration & Ticketing", "Event App Development", "Live Polling & Engagement Tools", "RFID & Access Management"],
      depth: {
        "Event Management Software": ["Cvent", "Eventbrite", "Whova", "Zoho Backstage", "Hubilo", "Airmeet"],
        "Registration & Ticketing": ["Online Registration Setup", "Badge Printing", "QR Code Check-in", "Waitlist Management"],
        "Live Polling & Engagement": ["Slido", "Mentimeter", "Kahoot", "Q&A Management", "Audience Engagement Strategy"],
      }
    },
  },

  "Procurement & Sourcing": {
    "Strategic Sourcing": {
      specialisations: ["Make vs Buy Analysis", "Should-cost Analysis", "RFQ / RFP Management", "Global Sourcing", "Reverse Auctions"],
      depth: {
        "Should-cost Analysis": ["Cost Breakdown Analysis", "Commodity Price Tracking", "Should-cost Modelling Tools", "Supplier Cost Transparency"],
        "Global Sourcing": ["China / SE Asia Sourcing", "Eastern Europe Sourcing", "Import Duty Impact Assessment", "Global Supplier Qualification"],
        "Reverse Auctions": ["Ariba / SAP Sourcing", "Jaggaer", "GEP", "E-auction Design", "Supplier Onboarding for Auctions"],
      }
    },
    "Category Management": {
      specialisations: ["Indirect Categories — IT / FM / Marketing", "Direct Categories — Raw Materials / Packaging", "Category Strategy", "Spend Analytics", "Preferred Supplier Programme"],
      depth: {
        "Indirect Categories — IT / FM / Marketing": ["IT Hardware / Software", "Facilities & Real Estate", "Marketing & Agency Spend", "Travel & Fleet", "Professional Services"],
        "Direct Categories — Raw Materials / Packaging": ["Raw Material Forecasting", "Commodity Hedging", "Packaging Development", "Long-term Supply Agreements"],
        "Spend Analytics": ["Spend Cube", "Maverick Spend", "Tail Spend", "Spend Classification Tools", "Coupa / Ariba Analytics"],
      }
    },
    "Supplier Development": {
      specialisations: ["Supplier Onboarding", "Supplier Audits", "Supplier Scorecards", "Capability Building", "Dual Sourcing Strategy"],
      depth: {
        "Supplier Audits": ["Quality System Audits", "Financial Health Assessment", "Ethical Sourcing Audits", "Environmental Compliance Audits"],
        "Capability Building": ["Technical Training for Suppliers", "Quality Improvement Programmes", "Cost Reduction Initiatives at Supplier", "Lean at Supplier"],
      }
    },
  },
}
