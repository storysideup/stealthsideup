export const FUNCTIONS = [
  "HR / People & Culture",
  "Sales & Business Development",
  "Marketing & Communications",
  "Finance & Accounts",
  "Operations & Supply Chain",
  "Procurement & Sourcing",
  "Design & Creative",
  "Technology & Product",
  "Legal & Compliance",
  "Strategy & Consulting",
  "General Management / P&L",
  "Administration & Facilities",
  "Production & Manufacturing",
  "Engineering (Civil / Mechanical / Electrical)",
  "Research & Development",
  "Customer Success & Service",
  "Content & Editorial",
  "Training & Facilitation",
  "Investor Relations & Corporate Finance",
  "Import / Export & International Trade",
  "Other"
]

export const SKILLS_BY_FUNCTION = {
  "HR / People & Culture": ["Talent Acquisition","Compensation & Benefits","HRBP / HR Generalist","L&D / OD","HR Operations","Hogan Assessments","Assessment Centres","Payroll & Compliance","HRMS / HR Tech","Culture & Engagement","DEI","Succession Planning","HR Analytics","Coaching (ICF / Others)"],
  "Sales & Business Development": ["B2B Sales","B2C Sales","Channel / Distribution Sales","Direct Sales","Enterprise / Key Account Mgmt","Retail Sales","Inside Sales / Pre-Sales","Revenue Growth / P&L","Franchisee Management","Govt / Institutional Sales","International Sales","New Business Development","Trade Marketing","Sales Operations"],
  "Marketing & Communications": ["Brand Management","Digital Marketing","Performance Marketing","Content Marketing","Social Media","SEO & SEM","Product Marketing","Trade Marketing","Consumer Insights & Research","Media Planning & Buying","PR & Communications","Influencer Marketing","CRM & Loyalty","E-commerce Marketing","GTM Strategy","Marketing Analytics"],
  "Finance & Accounts": ["Financial Reporting & MIS","Taxation (Direct / Indirect)","Audit & Compliance","FP&A / Budgeting","Treasury & Cash Flow","Cost Accounting","ERP / SAP Finance","M&A / Due Diligence","Fund Raising","Risk Management","CFO / Controller Experience","Management Accounting"],
  "Operations & Supply Chain": ["Supply Chain Planning","Demand Forecasting","S&OP","Inventory Management","Warehouse & Logistics","Last Mile Delivery","Import & Export","ERP (SAP / Oracle)","Lean / Six Sigma","Manufacturing Operations","Quality Assurance","Plant Management","Project Management","Cost Control"],
  "Procurement & Sourcing": ["Strategic Sourcing","Category Management","Supplier Development","Contract Negotiation","Global Sourcing","Customs & Compliance","Vendor Evaluation","CapEx Procurement","Raw Material Sourcing","E-Procurement","Reverse Auctions","Vendor Risk Management","Cost Optimisation"],
  "Design & Creative": ["Womenswear Design","Menswear Design","Accessories Design","Textile & Surface Design","Fashion Forecasting","Illustration","CAD","Pattern Making","Sampling","Visual Merchandising","Brand Identity","Graphic Design","UI / UX Design","Motion Graphics","Art Direction","Creative Direction","Photography","Styling","Packaging Design"],
  "Technology & Product": ["Product Management","Software Engineering","Frontend Development","Backend Development","Full Stack","Mobile Development (iOS / Android)","DevOps","Cloud (AWS / Azure / GCP)","Data Engineering","Data Science / ML / AI","Cybersecurity","QA & Testing","System Architecture","API Development","Agile / Scrum","Technical Program Management","CTO / VP Engineering Experience"],
  "Legal & Compliance": ["Corporate Law","Contracts & Agreements","Litigation","Labour & Employment Law","Intellectual Property","Regulatory Compliance","Company Secretarial","SEBI / RBI Compliance","Data Privacy (PDPB / GDPR)","M&A / Due Diligence","Tax Law","Competition Law","Real Estate Law"],
  "Strategy & Consulting": ["Business Strategy","Corporate Development","M&A","Market Entry","Go-to-Market","Competitive Intelligence","Management Consulting","P&L Ownership","Investor Relations","Fundraising","Business Transformation","Org Design","Growth Strategy","New Ventures","Feasibility Studies"],
  "General Management / P&L": ["Multi-function Leadership","P&L Ownership","Business Unit Head","CEO / COO Experience","Turnaround Management","Greenfield Setup","JV & Partnerships","Stakeholder Management","Board Reporting","Corporate Governance","Country / Regional Head Experience"],
  "Administration & Facilities": ["Office Administration","Facilities Management","Travel & Logistics","Fleet Management","Asset Management","Housekeeping & Security Oversight","Event & Conference Management","Document Management","EHS (Environment Health & Safety)","Liaison & Government Relations","Company Secretarial Support"],
  "Production & Manufacturing": ["Production Planning & Control","Shop Floor Management","Capacity Planning","Line Balancing","Tool & Die Management","Fabrication","Assembly Operations","Quality Control & Inspection","Lean Manufacturing","Kaizen / 5S / TPM","OEE Improvement","Machine Maintenance","Industrial Engineering","Process Engineering","Batch / Continuous Manufacturing"],
  "Engineering (Civil / Mechanical / Electrical)": ["Civil Engineering","Structural Engineering","MEP (Mechanical Electrical Plumbing)","HVAC","Electrical Systems","AutoCAD / Revit / BIM","Project Engineering","Site Supervision","Turnkey Projects","Estimation & Costing","Tendering","Commissioning","Maintenance Engineering","Reliability Engineering","Energy Auditing"],
  "Research & Development": ["Product Development","Formulation / R&D","Clinical Research","Regulatory Affairs","Patents & IP","Lab Management","Stability Studies","Process Development","Technology Transfer","New Product Introduction (NPI)","Material Science","Food Science","Sensory Evaluation","Consumer Research"],
  "Customer Success & Service": ["Customer Success","Account Management","Customer Retention","Onboarding","Helpdesk & Support","Service Delivery","SLA Management","Escalation Management","NPS / CSAT","CRM","Contact Centre Management","Field Service","After-Sales Service"],
  "Content & Editorial": ["Content Strategy","Editorial Planning","Copywriting","Journalism","Script Writing","Video Production","Podcast Production","Newsletter","SEO Writing","Technical Writing","Vernacular Content","Localisation","Publishing","Social Media Content"],
  "Training & Facilitation": ["Facilitation","Behavioural Training","Sales Training","Leadership Development","Outbound Learning","Assessment Design","Train the Trainer","E-learning Design","Instructional Design","Curriculum Development","Executive Coaching","Life Coaching","NLP"],
  "Investor Relations & Corporate Finance": ["Investor Relations","Equity Research","Fund Raising (Debt & Equity)","PE / VC Relationships","IPO / DRHP","Analyst Briefings","Valuation","Financial Modelling","Capital Markets","Treasury","Rating Agency Management","ESG Reporting"],
  "Import / Export & International Trade": ["Export Documentation","Import Clearance","DGFT / EXIM Policy","Letter of Credit","Incoterms","Freight Forwarding","Customs Brokerage","Trade Compliance","Free Trade Agreements","Export Incentives","ECGC","Foreign Exchange Management"],
  "Other": []
}

export const INDUSTRIES = [
  { sector: "BFSI", items: ["Banking — PSU", "Banking — Private / Co-operative", "Fintech / Payments / Lending Tech", "Insurance — Life / General / Health", "Wealth / Asset Management / Broking", "NBFC / Microfinance"] },
  { sector: "Consumer", items: ["FMCG / Food & Beverage", "Retail — Organised / E-commerce", "Luxury / Premium Fashion & Lifestyle", "Consumer Durables / Electronics", "D2C Brands"] },
  { sector: "Technology", items: ["IT Services / ITES / BPO", "SaaS / Product Companies", "E-commerce / Marketplace", "Emerging Tech (AI / Deeptech / Healthtech)"] },
  { sector: "Industrial / Manufacturing", items: ["Automotive / Auto Ancillary", "Chemicals / Pharma / Life Sciences", "Infrastructure / Real Estate / Construction", "Energy / Oil & Gas / Renewables", "Industrial Manufacturing"] },
  { sector: "Services", items: ["Consulting / Professional Services", "Events / Entertainment / Sports", "Hospitality / Travel & Tourism", "Education / EdTech", "Healthcare / Hospitals / Diagnostics", "Media / Advertising / PR"] },
  { sector: "Social / Development", items: ["NGO / Development Sector", "Government / PSU"] }
]

export const INSTITUTES = [
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow", "IIM Indore", "IIM Kozhikode", "IIM Udaipur", "IIM Ranchi", "IIM Rohtak", "IIM Trichy",
  "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kharagpur", "IIT Kanpur", "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "Other IIT",
  "XLRI Jamshedpur",
  "IMT Ghaziabad",
  "University Business School (UBS) Chandigarh",
  "Symbiosis Institute of Business Management (SIBM)",
  "Great Lakes Institute of Management",
  "Fore School of Management",
  "MICA Ahmedabad",
  "Narsee Monjee Institute of Management Studies (NMIMS)",
  "Amity Business School", "FMS Delhi", "SPJIMR Mumbai", "MDI Gurgaon", "TISS Mumbai", "ISB Hyderabad", "ISB Mohali", "MICA Ahmedabad",
  "NIFT Delhi", "NIFT Mumbai", "NIFT Bengaluru", "Other NIFT",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "Other NIT",
  "Delhi University — St. Stephens", "Delhi University — Lady Shri Ram", "Delhi University — SRCC", "Other Delhi University College",
  "Symbiosis Pune", "Amity University", "NLU Delhi", "NLU Mumbai", "Other NLU",
  "AIIMS Delhi", "Other Medical Institute",
  "Other (please specify)"
]

export const CURRENT_EMPLOYMENT_TYPES = [
  "Full-time employed",
  "Freelance / Independent Consultant",
  "Entrepreneur / Founder",
  "Not currently employed",
  "Sabbatical"
]

export const DESIRED_EMPLOYMENT_TYPES = [
  "Full-time role",
  "Freelance / Consulting engagements",
  "Fractional / Part-time role",
  "Open to both full-time and consulting",
  "Founder / Co-founder opportunity"
]

export const DEGREES = [
  "Graduation (BA / BSc / BCom / BE / BTech / Other)",
  "Post Graduation (MA / MSc / MCom / ME / MTech / Other)",
  "MBA / PGDM",
  "PhD / Doctorate",
  "Diploma",
  "Other"
]

export const TENURES = [
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "5 years or more"
]

export const AVG_TENURES = [
  "Less than 2 years",
  "2 to 3 years",
  "3 to 5 years",
  "5 years or more"
]

export const TEAM_SIZES = [
  "1 to 5",
  "5 to 15",
  "15 to 50",
  "50 to 200",
  "200 plus"
]

export const GEOGRAPHIES = [
  "Zonal — North",
  "Zonal — South",
  "Zonal — East",
  "Zonal — West",
  "Multi-zonal",
  "National",
  "International — South Asia",
  "International — Southeast Asia",
  "International — Middle East",
  "International — Global"
]

export const SENIORITY_LEVELS = [
  "Junior (0–5 yrs, individual contributor)",
  "Mid (5–12 yrs, may lead small teams)",
  "Senior (12–20 yrs, leads functions or large teams)",
  "Leadership (20+ yrs, CXO / functional head)"
]

export const ORG_TYPES = [
  "Large Indian conglomerate (Tata / Reliance / Birla type)",
  "Mid-size Indian company (₹100–500Cr revenue, established)",
  "Indian Startup — Early stage (Series A/B, under 5 years)",
  "Indian Startup — Growth stage (Series C+, 5–10 years)",
  "MNC / International company",
  "Any of the above",
  "Other"
]

export const CTC_BANDS = [
  "Below ₹10L",
  "₹10L – ₹20L",
  "₹20L – ₹35L",
  "₹35L – ₹50L",
  "₹50L – ₹75L",
  "₹75L – ₹1Cr",
  "Above ₹1Cr"
]

export const FREELANCE_ENGAGEMENT_SIZES = [
  "Below ₹5L per annum",
  "₹5L – ₹15L per annum",
  "₹15L – ₹50L per annum",
  "Above ₹50L per annum"
]

export const JOB_SEARCH_STATUSES = [
  "Actively looking (want to move within 0–3 months)",
  "Passively open (the right role would make me consider moving)",
  "Just exploring (not in a hurry, happy where I am)"
]

export const CITIES_BY_ZONE = {
  "North India": [
    "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad",
    "Chandigarh", "Jaipur", "Lucknow", "Agra", "Amritsar", "Dehradun"
  ],
  "West India": [
    "Mumbai", "Pune", "Ahmedabad", "Surat", "Nagpur",
    "Indore", "Vadodara", "Nashik", "Aurangabad"
  ],
  "South India": [
    "Bengaluru", "Chennai", "Hyderabad", "Kochi", "Coimbatore",
    "Mysuru", "Vizag", "Thiruvananthapuram", "Mangaluru"
  ],
  "East India": [
    "Kolkata", "Bhubaneswar", "Patna", "Guwahati", "Ranchi", "Jamshedpur"
  ],
  "Central India": [
    "Bhopal", "Raipur", "Jabalpur", "Varanasi", "Kanpur"
  ],
}

export const ZONES = Object.keys(CITIES_BY_ZONE)

export const ALL_CITIES = Object.values(CITIES_BY_ZONE).flat()

export const SPECIAL_LOCATIONS = [
  "Pan-India / National Role",
  "Remote / Work from Home",
  "Flexible / Any Location",
  "International"
]

export const CITY_TO_ZONE = {}
Object.entries(CITIES_BY_ZONE).forEach(([zone, cities]) => {
  cities.forEach(city => { CITY_TO_ZONE[city] = zone })
})

export const NCR_CITIES = ["Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad"]
export const MUMBAI_REGION = ["Mumbai", "Pune", "Nashik"]
export const BENGALURU_REGION = ["Bengaluru", "Mysuru"]

export const ROLE_TENURES = [
  "Less than 1 year",
  "1 to 3 years", 
  "3 to 5 years",
  "5 years or more"
]

export const CAREER_ROLE_TYPES = [
  "Individual Contributor",
  "Team of 1 to 5",
  "Team of 5 to 15",
  "Team of 15 to 50",
  "Team of 50 plus"
]

export const GENDER_PREFERENCE = [
  "No preference — open to all",
  "Preference for women candidates",
  "Preference for men candidates",
  "Role specifically requires women",
  "Role specifically requires men"
]

export const NOTICE_PERIODS = [
  "Immediate",
  "Up to 30 days",
  "30 to 60 days",
  "60 to 90 days",
  "More than 90 days",
  "Negotiable"
]

export const LANGUAGES = [
  "Hindi", "English", "Tamil", "Telugu", "Kannada",
  "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Other"
]

export const REASONS_FOR_LEAVING = [
  "No growth or promotion opportunities",
  "Reached a career plateau",
  "No new learnings or challenges",
  "Difficult reporting relationship",
  "Culture not aligned with my values",
  "Company went through restructuring / layoffs",
  "Better compensation elsewhere",
  "Better role / title / responsibilities elsewhere",
  "Relocation — personal or family",
  "Personal health reasons",
  "Family responsibilities",
  "Education / further studies",
  "Entrepreneurship / own venture",
  "Contract / role ended naturally"
]

export const REASONS_FOR_LOOKING = [
  "Seeking better growth and promotion opportunities",
  "Looking for higher compensation",
  "Culture not aligned with my values",
  "Want new learnings and challenges",
  "Interested in a different industry or function",
  "Company going through uncertainty",
  "Better work-life balance",
  "Relocation preference",
  "Personal reasons",
  "Open to the right opportunity — not actively pushing"
]
