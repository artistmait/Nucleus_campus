import React from "react";
import Navbar from "../main/Navbar";
import Footer from "../main/Footer";
import {
  FileAxis3D,
  CheckCircle2Icon,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const LandingPage = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-indigo-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Welcome to <span className="text-indigo-300">NUCLEUS</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl">
            Your Digital Campus Assistant — making academics simpler, faster and
            accessible anytime.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="#explore"
              className="px-6 py-3 bg-indigo-300 text-indigo-900 font-bold rounded-lg hover:bg-white transition"
            >
              Explore Sections
            </a>
            <a
              href="#about"
              className="px-6 py-3 border border-indigo-300 rounded-lg font-bold hover:bg-indigo-800 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
            Why Choose NUCLEUS?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="shadow-lg rounded-xl p-8 bg-white hover:scale-105 transition">
              <FileAxis3D className="mx-auto bg-blue-200 p-4 rounded-full size-16 text-indigo-900" />
              <h3 className="mt-4 font-bold text-xl">Digital Processing</h3>
              <p className="mt-2 text-gray-600">
                Fast and secure online application process in real-time.
              </p>
            </div>
            <div className="shadow-lg rounded-xl p-8 bg-white hover:scale-105 transition">
              <CheckCircle2Icon className="mx-auto bg-blue-200 p-4 rounded-full size-16 text-indigo-900" />
              <h3 className="mt-4 font-bold text-xl">Verified Documents</h3>
              <p className="mt-2 text-gray-600">
                Officially authenticated certificates and transcripts.
              </p>
            </div>
            <div className="shadow-lg rounded-xl p-8 bg-white hover:scale-105 transition">
              <Clock className="mx-auto bg-blue-200 p-4 rounded-full size-16 text-indigo-900" />
              <h3 className="mt-4 font-bold text-xl">24/7 Access</h3>
              <p className="mt-2 text-gray-600">
                Submit applications anytime and track progress instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
              About NUCLEUS
            </h2>
            <p className="mt-6 text-gray-700 leading-relaxed">
              NUCLEUS is your one-stop platform for managing academic
              applications, certifications, library resources, and institutional
              services. Designed for efficiency, transparency, and ease of use —
              empowering students and faculty alike.
            </p>
            <a
              href="#explore"
              className="mt-8 inline-block px-6 py-3 bg-indigo-900 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="/assets/study_one.jpg"
              alt="Campus"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Explore Sections */}
      <section id="explore" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
            Explore Sections
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="p-8 bg-white shadow-lg rounded-xl hover:scale-105 transition">
              <GraduationCap className="mx-auto size-16 text-indigo-900" />
              <h3 className="mt-4 text-xl font-bold">Exam Section</h3>
              <p className="mt-2 text-gray-600">
                Manage applications, results, and certifications with ease.
              </p>
              <a
                href="/student/exam-section"
                className="mt-4 inline-block px-4 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Go to Exam
              </a>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl hover:scale-105 transition">
              <BookOpen className="mx-auto size-16 text-indigo-900" />
              <h3 className="mt-4 text-xl font-bold">Library Section</h3>
              <p className="mt-2 text-gray-600">
                Access academic resources, research databases, and digital
                materials.
              </p>
              <a
                href="#"
                className="mt-4 inline-block px-4 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Go to Library
              </a>
            </div>

            <div className="p-8 bg-white shadow-lg rounded-xl hover:scale-105 transition">
              <Users className="mx-auto size-16 text-indigo-900" />
              <h3 className="mt-4 text-xl font-bold">Admin Office</h3>
              <p className="mt-2 text-gray-600">
                Student services, document processing, and institutional
                procedures.
              </p>
              <a
                href="#"
                className="mt-4 inline-block px-4 py-2 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Go to Admin Office
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-900 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Experience Digital Campus?
        </h2>
        <p className="mt-4 text-lg">
          Join thousands of students who trust NUCLEUS for their academic needs.
        </p>
        <a
          href="#"
          className="mt-8 inline-block px-8 py-4 bg-indigo-300 text-indigo-900 font-bold rounded-lg hover:bg-white transition"
        >
          Apply Now
        </a>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;
