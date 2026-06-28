export default function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <button type="button" onClick={() => onNavigate('home')}
        style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 28 }}>Last updated: June 2026</p>

      {[
        {
          title: '1. Who We Are',
          body: `StealthSideUp is an anonymous talent marketplace operated by StorySideUp, a sole proprietorship registered under UDYAM-DL-11-0161070, based in New Delhi, India. We connect senior professionals with relevant career opportunities while protecting their identity throughout the process.\n\nFor any privacy-related queries, contact us at: privacy@storysideup.com`
        },
        {
          title: '2. What Data We Collect',
          body: `We collect the following categories of personal data:\n\nFrom Candidates:\n• Mobile number (used as your login identifier)\n• Gender and age range\n• Employment history, function, industry, years of experience\n• Current and expected compensation (CTC)\n• Skills and professional competencies\n• Career preferences including locations, notice period and organisation type\n• Companies you wish to be blocked from seeing your profile\n• Professional headline (anonymised — no name, employer or photo)\n\nFrom Corporates:\n• Company name, contact person name and work email\n• Role of the user (Admin or Recruiter)\n• Job descriptions and role requirements posted on the platform\n• Token purchase and usage history\n\nWe do not collect: your full name, photograph, current employer name, LinkedIn URL or any government-issued identification.`
        },
        {
          title: '3. How We Use Your Data',
          body: `Candidate data is used solely for:\n• Matching your profile to relevant roles posted by corporates\n• Generating anonymised career intelligence (market pay, demand signals, skill gaps)\n• Notifying you via WhatsApp when a company expresses interest in your profile\n• Improving the accuracy of our matching algorithm\n\nCorporate data is used for:\n• Managing your account and token balance\n• Displaying your job requirements to matched candidates (anonymously where stealth mode is selected)\n• Sending you invoices and receipts for token purchases\n\nWe do not use your data for advertising. We do not sell your data to any third party under any circumstances.`
        },
        {
          title: '4. Who We Share Your Data With',
          body: `Your data is shared only as follows:\n\n• With a corporate employer — only when you explicitly say Yes to their interest. At that point your CV and contact details are shared with the specific recruiter on that mandate only.\n• With our technology partners — Supabase (database hosting), Vercel (platform hosting), Resend (transactional email), Interakt (WhatsApp notifications), and Razorpay (payment processing). Each of these partners processes your data solely to provide their service and is bound by their own privacy and security standards.\n• With legal authorities — if required by law, court order or to protect the rights and safety of our users.\n\nYour identity is never revealed to a corporate unless you choose to share it.`
        },
        {
          title: '5. Data Retention',
          body: `We retain your data for as long as your profile is active on the platform.\n\nIf you delete your account, we will permanently delete all your personal data within 30 days, except where retention is required by law (for example, transaction records for GST compliance are retained for 7 years).\n\nInactive profiles — profiles with no login activity for 12 months — will be flagged and you will be notified before any deletion.`
        },
        {
          title: '6. Your Rights',
          body: `Under the Digital Personal Data Protection Act 2023 (India), you have the following rights:\n\n• Right to access — you can request a copy of all personal data we hold about you\n• Right to correction — you can update your data at any time through your profile\n• Right to erasure — you can request deletion of your account and all associated data\n• Right to grievance redressal — you can raise a complaint with us and we will respond within 30 days\n\nTo exercise any of these rights, email privacy@storysideup.com with your registered mobile number.`
        },
        {
          title: '7. Data Security',
          body: `We take reasonable technical and organisational measures to protect your data:\n\n• All data is transmitted over HTTPS (TLS encryption)\n• Your database records are encrypted at rest\n• Your mobile number is never displayed publicly on the platform\n• Candidate profiles are anonymous — no name, photo or employer is stored\n• Corporate passwords are encrypted using industry-standard hashing\n• Access to your data is restricted to authorised personnel only\n\nHowever, no system is completely secure. In the event of a data breach that affects your rights, we will notify you within 72 hours of becoming aware of it.`
        },
        {
          title: '8. Cookies',
          body: `StealthSideUp uses minimal cookies necessary for the platform to function — specifically to maintain your login session. We do not use advertising cookies or third-party tracking cookies.\n\nIf we add analytics tools in the future, we will update this policy and seek your consent.`
        },
        {
          title: '9. Children',
          body: `StealthSideUp is intended for working professionals and is not directed at anyone under the age of 18. We do not knowingly collect data from minors. If you believe a minor has registered, please contact us at privacy@storysideup.com and we will delete the account immediately.`
        },
        {
          title: '10. Changes to This Policy',
          body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you via WhatsApp on your registered number and update the "Last updated" date at the top of this page. Continued use of the platform after notification constitutes acceptance of the updated policy.`
        },
        {
          title: '11. Contact Us',
          body: `StorySideUp (operating StealthSideUp)\nNew Delhi, India\nEmail: privacy@storysideup.com\nGSTIN: 07AJPPD5744C1ZB\nUdyam: UDYAM-DL-11-0161070`
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
