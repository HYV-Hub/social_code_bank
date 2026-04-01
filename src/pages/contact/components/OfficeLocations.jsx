import React from 'react';
import Icon from '../../../components/AppIcon';

const OfficeLocations = () => {
  const offices = [
    {
      city: 'San Francisco',
      country: 'USA',
      address: '123 Tech Street, Suite 500',
      zipCode: 'CA 94105',
      phone: '+1 (415) 555-0100',
      email: 'sf@hyvhub.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM PST',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509374!2d-122.39948508468221!3d37.78799797975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808c5b5f3fff%3A0x2e5e1b1c3c5f3fff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
      isHeadquarters: true
    },
    {
      city: 'London',
      country: 'UK',
      address: '45 Innovation Lane',
      zipCode: 'EC2A 4AB',
      phone: '+44 20 7123 4567',
      email: 'london@hyvhub.com',
      hours: 'Mon-Fri: 9:00 AM - 5:30 PM GMT',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.9832165861!2d-0.08766838422949519!3d51.51737897963758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761cb3d303b63d%3A0x4f5b6a1e0b0b1e0b!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
      isHeadquarters: false
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '88 Digital Hub Drive, #12-34',
      zipCode: '138589',
      phone: '+65 6789 1234',
      email: 'singapore@hyvhub.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM SGT',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8177413384!2d103.85384831475394!3d1.2830999620858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da190d593a26ad%3A0x4f5b6a1e0b0b1e0b!2sSingapore!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus',
      isHeadquarters: false
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {offices?.map((office, index) => (
        <div
          key={index}
          className="bg-card dark:bg-slate-800 rounded-xl overflow-hidden border border-[var(--color-border)] hover:shadow-xl transition-shadow"
        >
          {/* Map Embed */}
          <div className="relative h-48 bg-muted dark:bg-muted">
            <iframe
              src={office?.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${office?.city} office location`}
            ></iframe>
            {office?.isHeadquarters && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                Headquarters
              </div>
            )}
          </div>

          {/* Office Details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-1">
              {office?.city}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              {office?.country}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="MapPin" size={18} className="text-primary dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--color-foreground)]">
                  <p>{office?.address}</p>
                  <p>{office?.zipCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon name="Phone" size={18} className="text-primary dark:text-blue-400 flex-shrink-0" />
                <a
                  href={`tel:${office?.phone}`}
                  className="text-sm text-primary dark:text-blue-400 hover:underline"
                >
                  {office?.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Icon name="Mail" size={18} className="text-primary dark:text-blue-400 flex-shrink-0" />
                <a
                  href={`mailto:${office?.email}`}
                  className="text-sm text-primary dark:text-blue-400 hover:underline"
                >
                  {office?.email}
                </a>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[var(--color-border)]">
                <Icon name="Clock" size={18} className="text-primary dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {office?.hours}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfficeLocations;