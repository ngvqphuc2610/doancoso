'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from 'react-i18next';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-600 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">THÔNG TIN LIÊN HỆ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cinestar-yellow mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
          <div>
            <p>{t('contact.hotline')}</p>
          </div>
        </div>


        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cinestar-yellow mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
          </svg>
          <div>
            <p>{t('contact.emailContact')}</p>
          </div>
        </div>


        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cinestar-yellow mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
          <div>
            <p>{t('footer.address')}</p>
          </div>
        </div>
        <div>

          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t('contact.name')}
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-white text-white border-gray-600"
          />
        </div>

        <div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('contact.email')}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-white text-white border-gray-600"
          />
        </div>

        <div>

          <Textarea
            id="message"
            name="message"
            placeholder={t('contact.message')}
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full min-h-[150px] bg-white text-dark border-gray-600"
          />
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant={"custom3"}
        >
          {isSubmitting ? t('contact.sending') : t('contact.send')}
        </Button>
      </form>
    </div>
  );

};

export default ContactForm;