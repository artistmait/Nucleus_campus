import { Award, FileCheck2, FileText, GraduationCap } from "lucide-react";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";

// Data for the service cards
const services = [
  {
    icon: FileText,
    title: "Marksheet Name Correction",
    description: "Request correction of name on your official academic marksheet",
    link:'/student/correction'
  },
  {
    icon: GraduationCap,
    title: "Official Transcript",
    description: "Request return of official transcripts for external use",
    link:'/transcript'
  },
  {
    icon: Award,
    title: "Degree Certificate",
    description: "Request your degree completion certificate",
    link:'/certificate'
  },
  {
    icon: FileCheck2,
    title: "Revaluation Request",
    description: "Apply for examination paper revaluation",
    link:'/revaluation'
  },
];

export default function ExamSection() {
  return (
    <div className="w-full">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* --- Page Header --- */}
        <header className="mb-14 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            Examination Section
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Submit requests for academic documents, certificates, and
            examination-related services.
          </p>
        </header>

        {/* --- Important Information Section --- */}
        <section className="border-2 border-indigo-400 bg-indigo-50 rounded-2xl p-8 md:p-10 mb-16">
          <h3 className="text-xl font-bold text-indigo-900 mb-6">
            Important Information
          </h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-semibold mb-3">Processing Time:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Marksheet requests: 3-5 days</li>
                <li>Official Transcripts: 5-7 days</li>
                <li>Degree Certificates: 7-10 days</li>
                <li>Revaluation Application: 10-12 days</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Required Documents:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Valid student ID or admission number</li>
                <li>Fee Payment receipt (where applicable)</li>
                <li>Passport size photograph</li>
                <li>Additional documents as per service requirements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- Services Provided Section --- */}
        <section>
          <h2 className="text-3xl font-bold text-indigo-900 mb-10">
            Services Provided
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex flex-col text-center items-center bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-1 transition-transform"
              >
                {/* Icon */}
                <div className="bg-indigo-100 p-5 rounded-xl mb-6">
                  <service.icon className="h-10 w-10 text-indigo-700" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-indigo-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base mt-3 flex-grow">
                  {service.description}
                </p>

                {/* Button */}
                <a
                  href={service.link}
                  className="mt-6 w-full px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-center"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
