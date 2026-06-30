export default function TermsOfService({ onNavigate }) {
  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <button type="button" onClick={() => onNavigate('home')}
        style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>Terms of Service</h1>
      <p style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 28 }}>Last updated: June 2026</p>

      {[
        {
          title: '1. About StealthSideUp',
          body: `StealthSideUp is an anonymous talent platform operated by StorySideUp (sole proprietorship, UDYAM-DL-11-0161070), New Delhi, India. The platform enables senior professionals to be matched to relevant career opportunities without revealing their identity unless they choose to.\n\nBy registering on StealthSideUp — as a candidate or as a corporate employer — you agree to these Terms of Service. If you do not agree, please do not use the platform.`
        },
        {
          title: '2. Candidate Terms',
          body: `By registering as a candidate, you confirm that:\n\n• You are at least 18 years of age\n• All information you provide is accurate and up to date\n• You are the person described in the profile — you are not creating a profile for someone else\n• You will not use the platform to misrepresent your experience, skills or qualifications\n• You understand that your profile is anonymous and will not be shared with any employer without your explicit consent\n• You will not share your registered mobile number or profile access with any third party\n\nYour responsibilities:\n• Keep your profile up to date — outdated profiles may be paused by us after 12 months of inactivity\n• Respond to match notifications in a timely manner — if you say Yes to a match, you are expected to share your CV within 48 hours\n• If you are no longer open to opportunities, update your job search status or pause your profile`
        },
        {
          title: '3. Corporate Employer Terms',
          body: `By registering as a corporate employer, you confirm that:\n\n• You are registering on behalf of a legitimate business entity\n• The roles you post are genuine, active vacancies — not market research, data gathering or fictitious listings\n• You will not use candidate data for any purpose other than evaluating them for the specific role against which interest was expressed\n• You will not contact a candidate through any channel other than the one shared by them after they say Yes\n• You will not share a candidate's contact details or CV with any third party outside your organisation\n• You will not attempt to reverse-identify an anonymous candidate before they share their identity\n\nToken usage:\n• Tokens are consumed when you click Express Interest on a candidate profile\n• Tokens are non-refundable once used, regardless of the outcome\n• Tokens expire 90 days from the date of purchase\n• Unused tokens at expiry are forfeited with no refund or credit`
        },
        {
          title: '4. Prohibited Conduct',
          body: `The following are strictly prohibited on StealthSideUp:\n\n• Creating false or misleading profiles — as a candidate or corporate\n• Attempting to identify anonymous candidates through indirect means\n• Using the platform for purposes other than genuine talent matching\n• Scraping, crawling or extracting data from the platform through automated means\n• Sharing access credentials with others\n• Posting roles that discriminate on grounds of gender, religion, caste, disability or any other protected characteristic\n• Using candidate data obtained through the platform for marketing, research or any non-hiring purpose\n• Attempting to circumvent the token system or manipulate platform mechanics\n\nViolation of any of the above may result in immediate account suspension without refund.`
        },
        {
          title: '5. Payments and Refunds',
          body: `Token purchases are processed through Razorpay. All prices are in Indian Rupees and exclusive of GST (18% applicable).\n\nRefund policy:\n• Tokens that have not been used may be refunded within 7 days of purchase by writing to billing@storysideup.com\n• Tokens that have been used (Express Interest clicked) are non-refundable\n• In the event of a technical error that incorrectly deducts tokens, we will restore them within 48 hours upon verification\n• Invoice-based purchases are non-refundable once tokens are credited to the account\n\nWe reserve the right to change token pricing at any time. Existing purchased tokens are not affected by price changes.`
        },
        {
          title: '6. Platform Availability',
          body: `StealthSideUp is provided on an "as is" and "as available" basis. We do not guarantee:\n\n• Uninterrupted or error-free operation of the platform\n• That any specific number of matches will be generated for any candidate or corporate\n• That any match will result in a successful hire or job offer\n\nWe will make reasonable efforts to maintain platform availability and notify users of planned maintenance in advance.`
        },
        {
          title: '7. Limitation of Liability',
          body: `StorySideUp is a facilitator — we connect candidates and employers but are not a party to any employment relationship or hiring decision.\n\nWe are not liable for:\n• Any hiring decision made by a corporate employer\n• Any career decision made by a candidate based on platform intelligence\n• Loss of business, revenue or opportunity arising from platform unavailability\n• The accuracy of AI-generated career intelligence — this is indicative only and not professional advice\n\nOur total liability to any user for any claim arising from use of the platform is limited to the amount paid by that user in tokens in the 3 months preceding the claim.`
        },
        {
          title: '8. Intellectual Property',
          body: `All content on StealthSideUp — including the name, logo, design, code, copy and matching methodology — is the intellectual property of StorySideUp.\n\nThe StealthSideUp trademark is registered (or pending registration) under Class 35 and Class 42 with the Office of the Controller General of Patents, Designs and Trade Marks, India.\n\nYou may not reproduce, copy, distribute or create derivative works from any part of the platform without written permission.`
        },
        {
          title: '9. Termination',
          body: `You may close your account at any time by contacting support@storysideup.com. We will delete your data within 30 days as described in our Privacy Policy.\n\nWe reserve the right to suspend or terminate any account — candidate or corporate — that violates these Terms, without prior notice and without refund where tokens have been used.`
        },
        {
          title: '10. Governing Law',
          body: `These Terms are governed by the laws of India. Any dispute arising from use of the platform shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.\n\nFor any disputes, please first write to us at legal@storysideup.com — we will make every effort to resolve issues amicably before any formal proceedings.`
        },
        {
          title: '11. Contact',
          body: `StorySideUp (operating StealthSideUp)\nNew Delhi, India\nGeneral: hello@storysideup.com\nPrivacy: privacy@storysideup.com\nBilling: billing@storysideup.com\nLegal: legal@storysideup.com`
        },
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>{title}</h2>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      ))}
    </div>
  )
}
