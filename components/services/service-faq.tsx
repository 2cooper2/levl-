"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from "lucide-react"

export function ServiceFAQ() {
  const faqs = [
    {
      question: "What types of TVs can you mount?",
      answer:
        "We can mount virtually any TV size and type, from small 32-inch models to large 85-inch TVs. Our mounting services work with all major brands including Samsung, LG, Sony, TCL, and more. We're equipped with specialized hardware for OLED, QLED, curved, and standard LED/LCD displays.",
    },
    {
      question: "What wall types are suitable for TV mounting?",
      answer:
        "We can mount TVs on most wall types including drywall with studs, brick, concrete, and stone. Each surface requires specific mounting hardware and techniques, which our technicians are fully trained to handle. During our initial assessment, we'll determine the best mounting solution for your specific wall type.",
    },
    {
      question: "Do you provide the mounting hardware?",
      answer:
        "Yes, we provide all necessary professional-grade mounting hardware as part of our service. This includes appropriate brackets, anchors, screws, and bolts designed specifically for your TV model and wall type. All our hardware exceeds industry safety standards to ensure your TV is mounted securely.",
    },
    {
      question: "Can you hide the cables and wires?",
      answer:
        "We offer professional cable management solutions with every mounting service. Options include simple cable channeling along the wall surface, complete in-wall cable concealment (where building codes permit), and wireless solutions. Our goal is to create a clean, professional look with no visible wires.",
    },
    {
      question: "How long does the mounting process take?",
      answer:
        "A standard TV mounting typically takes 1-2 hours to complete. More complex installations involving in-wall wiring, multiple components, or challenging wall surfaces may take 2-4 hours. We'll provide a more accurate time estimate during our initial consultation based on your specific requirements.",
    },
    {
      question: "Do you offer a warranty on mounting services?",
      answer:
        "Yes, all our mounting services come with a comprehensive warranty. We provide a 1-year warranty on labor and installation, and all hardware comes with a manufacturer's warranty (typically 5-10 years). If you experience any issues with your mounted TV, we'll return to address the problem at no additional cost.",
    },
    {
      question: "Can you also set up my audio and streaming devices?",
      answer:
        "Yes, we offer complete home entertainment setup services. In addition to mounting your TV, we can install and configure sound bars, surround sound systems, streaming devices, game consoles, and other components. We'll ensure everything is properly connected and working perfectly before we leave.",
    },
  ]

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="mb-4 border border-purple-200/20 dark:border-purple-800/20 rounded-xl overflow-hidden bg-white/60 dark:bg-black/30 backdrop-blur-sm"
        >
          <AccordionTrigger className="group flex w-full items-center justify-between px-6 py-5 text-left font-medium transition-all hover:bg-purple-50/50 dark:hover:bg-purple-900/10 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-purple-50/70 [&[data-state=open]]:to-indigo-50/70 dark:[&[data-state=open]]:from-purple-900/20 dark:[&[data-state=open]]:to-indigo-900/20">
            <div className="flex items-center">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />
              </div>
              <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300">
                {faq.question}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-hidden text-base text-gray-600 dark:text-gray-300 px-6 pt-0 pb-5 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pl-12">{faq.answer}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
