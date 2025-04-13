"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ServiceFAQ() {
  const faqs = [
    {
      question: "What information do you need from me to get started?",
      answer:
        "To get started, I'll need your business information, brand guidelines (if available), content for the website (text, images, etc.), and any specific requirements or preferences you have for the design and functionality of your website. I'll provide a detailed questionnaire to help gather all the necessary information.",
    },
    {
      question: "Do you provide website hosting?",
      answer:
        "Yes, I can help you set up hosting for your website. I work with reliable hosting providers that offer excellent performance and uptime. Alternatively, if you already have a hosting provider, I can deploy your website there as well.",
    },
    {
      question: "How many revisions are included in your packages?",
      answer:
        "All my packages include unlimited revisions during the development process. I want to ensure you're completely satisfied with the final product, so I'll make adjustments until the website meets your expectations.",
    },
    {
      question: "Do you offer ongoing maintenance and support?",
      answer:
        "Yes, I offer ongoing maintenance and support packages to keep your website up-to-date, secure, and running smoothly. These packages include regular updates, security monitoring, backups, and technical support. We can discuss the specific maintenance needs for your website.",
    },
    {
      question: "How long does it take to complete a website?",
      answer:
        "The timeline depends on the complexity of the project and the package you choose. Basic websites typically take 1-2 weeks, standard websites 2-3 weeks, and premium websites with e-commerce functionality 3-4 weeks. I'll provide a more accurate timeline after our initial consultation.",
    },
    {
      question: "Will my website be mobile-friendly?",
      answer:
        "All websites I create are fully responsive and optimized for all devices, including desktops, laptops, tablets, and smartphones. Mobile-friendliness is essential for user experience and SEO, so it's a standard feature in all my packages.",
    },
    {
      question: "Can you help with SEO for my website?",
      answer:
        "Yes, all websites I build include basic on-page SEO optimization. This includes proper HTML structure, meta tags, image optimization, and mobile responsiveness. For more comprehensive SEO services, I offer additional packages that include keyword research, content optimization, and ongoing SEO strategy.",
    },
  ]

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
